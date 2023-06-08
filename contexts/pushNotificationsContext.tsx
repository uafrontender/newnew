import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { newnewapi } from 'newnew-api';

import {
  webPushCheck,
  webPushConfig,
  webPushPause,
  webPushRegister,
  webPushResume,
  webPushUnRegister,
} from '../api/endpoints/web_push';
import { cookiesInstance } from '../api/apiConfigs';
import isSafari from '../utils/isSafari';
import isIOS from '../utils/isIOS';
import useErrorToasts from '../utils/hooks/useErrorToasts';
import isBrowser from '../utils/isBrowser';
import { useAppState } from './appStateContext';

const WEB_PUSH_PROMPT_KEY =
  'isUserPromptedWithPushNotificationsPermissionModal';

const SESSION_TIME = 240000;

export const PushNotificationsContext = createContext<{
  isSubscribed: boolean;
  isPermissionRequestModalOpen: boolean;
  isPushNotificationAlertShown: boolean;
  isPushNotificationSupported: boolean;
  subscribe: (callback?: () => void) => void;
  unsubscribe: () => void;
  requestPermission: () => void;
  closePermissionRequestModal: () => void;
  closePushNotificationAlert: () => void;
  promptUserWithPushNotificationsPermissionModal: () => void;
  pauseNotification: () => void;
  resumePushNotification: () => void;
}>({
  isSubscribed: false,
  isPermissionRequestModalOpen: false,
  isPushNotificationAlertShown: false,
  isPushNotificationSupported: false,
  subscribe: () => {},
  unsubscribe: () => {},
  requestPermission: () => {},
  closePermissionRequestModal: () => {},
  closePushNotificationAlert: () => {},
  promptUserWithPushNotificationsPermissionModal: () => {},
  pauseNotification: () => {},
  resumePushNotification: () => {},
});

type PermissionType = 'default' | 'denied' | 'granted';

interface IPushNotificationsContextProvider {
  children: React.ReactNode;
}

const PushNotificationsContextProvider: React.FC<
  IPushNotificationsContextProvider
> = ({ children }) => {
  const { userLoggedIn } = useAppState();

  const [isPermissionRequestModalOpen, setIsPermissionRequestModalOpen] =
    useState(false);

  const [isPushNotificationAlertShown, setIsPushNotificationAlertShown] =
    useState(false);

  const [isSubscribed, setIsSubscribed] = useState(false);

  const { showErrorToastPredefined } = useErrorToasts();

  const isSafariBrowser = useRef(
    isSafari() &&
      (window as any).safari &&
      'pushNotification' in (window as any).safari
  );

  const isPushNotificationSupported = useRef(
    isBrowser() &&
      typeof Notification !== 'undefined' &&
      (isSafariBrowser ||
        ('serviceWorker' in navigator &&
          'PushManager' in window &&
          'Notification' in window)) &&
      !isIOS()
  );

  // Get config
  const getPublicKey = useCallback(async () => {
    const payload = new newnewapi.EmptyRequest({});

    const response = await webPushConfig(payload);

    if (!response.data?.publicKey) {
      throw new Error('No public key');
    }

    return response.data?.publicKey;
  }, []);

  // Get browser permission
  const getPermissionData: () => {
    permission: PermissionType;
    deviceToken?: string;
  } = useCallback(() => {
    try {
      if (isSafariBrowser.current) {
        const permissionData = (
          window as any
        ).safari.pushNotification.permission(
          process.env.NEXT_PUBLIC_WEB_PUSH_ID
        );

        return permissionData;
      }

      return { permission: Notification.permission };
    } catch (err) {
      console.error(err);
      return {
        permission: 'denied',
      };
    }
  }, []);

  // register subscription on BE
  const registerSubscriptionSafari = useCallback(async (endpoint?: string) => {
    if (!endpoint) {
      throw new Error(
        "Cannot register web push subscription: Endpoint wasn't provided"
      );
    }

    const payload = new newnewapi.RegisterForWebPushRequest({
      name: navigator.userAgent,
      endpoint,
      p256dh: 'safari',
      auth: process.env.NEXT_PUBLIC_WEB_PUSH_ID,
    });

    const response = await webPushRegister(payload);

    if (response.error) {
      throw response.error;
    }
  }, []);

  const registerSubscriptionNonSafari = useCallback(
    async (subscription?: PushSubscription) => {
      if (!subscription) {
        throw new Error(
          "Cannot register web push subscription: Subscription wasn't provided"
        );
      }

      const sub = subscription.toJSON();
      if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
        throw new Error('Something goes wrong');
      }

      const payload = new newnewapi.RegisterForWebPushRequest({
        expiration: `${sub.expirationTime}`,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      });

      const response = await webPushRegister(payload);

      if (response.error) {
        throw response.error;
      }
    },
    []
  );

  // unregister subscription on BE
  const unregister = useCallback(async (endpoint: string) => {
    const payload = new newnewapi.UnRegisterForWebPushRequest({
      endpoint,
    });

    await webPushUnRegister(payload);
  }, []);

  // check subscription existing on BE
  const fetchCheckSubscription = useCallback(async (endpoint: string) => {
    try {
      const payload = new newnewapi.WebPushCheckRequest({
        endpoint,
      });
      const res = await webPushCheck(payload);

      if (res.error || !res.data) {
        return {
          exists: false,
          paused: false,
        };
      }

      return res.data;
    } catch (err) {
      return {
        exists: false,
        paused: false,
      };
    }
  }, []);

  // Check push notification subscription existing
  const checkSubscriptionSafari = useCallback(async () => {
    const permissionData = getPermissionData();

    if (permissionData.permission === 'granted' && permissionData.deviceToken) {
      const subscriptionStatus = await fetchCheckSubscription(
        permissionData.deviceToken
      );

      return subscriptionStatus?.exists && !subscriptionStatus.paused;
    }

    return false;
  }, [getPermissionData, fetchCheckSubscription]);

  const checkSubscriptionNonSafari = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/sw.js');

      if (!swReg) {
        throw new Error('No active service worker');
      }

      const permissionData = getPermissionData();

      if (permissionData.permission !== 'granted') {
        return false;
      }

      const subscription = await swReg.pushManager.getSubscription();

      if (!subscription) {
        return false;
      }

      const sub = subscription?.toJSON();

      if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth || !sub.endpoint) {
        return false;
      }

      const checkSubscriptionValue = await fetchCheckSubscription(
        subscription.endpoint
      );

      if (checkSubscriptionValue.exists && !checkSubscriptionValue.paused) {
        return true;
      }

      if (checkSubscriptionValue?.paused) {
        return false;
      }

      // renew subscription if it has been updated
      await registerSubscriptionNonSafari(subscription);

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [
    getPermissionData,
    fetchCheckSubscription,
    registerSubscriptionNonSafari,
  ]);

  const checkSubscription = useCallback(async () => {
    if (!userLoggedIn) {
      return;
    }

    if (!isPushNotificationSupported.current) {
      return;
    }

    let isSubscribedValue = false;

    if (isSafariBrowser.current) {
      isSubscribedValue = await checkSubscriptionSafari();
    } else {
      isSubscribedValue = await checkSubscriptionNonSafari();
    }

    setIsSubscribed(isSubscribedValue);
  }, [userLoggedIn, checkSubscriptionSafari, checkSubscriptionNonSafari]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Permission Modal
  const openPermissionRequestModal = useCallback(() => {
    setIsPermissionRequestModalOpen(true);
  }, []);

  const closePermissionRequestModal = useCallback(() => {
    setIsPermissionRequestModalOpen(false);
  }, []);

  const promptUserWithPushNotificationsPermissionModal = useCallback(() => {
    if (
      localStorage.getItem(WEB_PUSH_PROMPT_KEY) !== 'true' &&
      isPushNotificationSupported.current &&
      getPermissionData().permission === 'default' &&
      userLoggedIn
    ) {
      localStorage.setItem(WEB_PUSH_PROMPT_KEY, 'true');
      openPermissionRequestModal();
    }
  }, [userLoggedIn, openPermissionRequestModal, getPermissionData]);

  // Prompt user after 4 min session on site
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const shouldShowModal =
      localStorage.getItem(WEB_PUSH_PROMPT_KEY) !== 'true' &&
      userLoggedIn &&
      isPushNotificationSupported.current &&
      getPermissionData().permission === 'default';

    if (shouldShowModal) {
      timeoutId = setTimeout(
        promptUserWithPushNotificationsPermissionModal,
        SESSION_TIME
      );

      window.onfocus = () => {
        timeoutId = setTimeout(
          promptUserWithPushNotificationsPermissionModal,
          SESSION_TIME
        );
      };

      window.onblur = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    promptUserWithPushNotificationsPermissionModal,
    userLoggedIn,
    getPermissionData,
  ]);

  // Push notification alert
  const openPushNotificationAlert = useCallback(() => {
    setIsPushNotificationAlertShown(true);
  }, []);

  const closePushNotificationAlert = useCallback(() => {
    setIsPushNotificationAlertShown(false);
  }, []);

  // Subscribe to push notifications
  const requestPermissionSafari = useCallback(
    async (permissionData: any, onSuccess?: () => void) => {
      try {
        if (permissionData.permission === 'default') {
          const publicKey = await getPublicKey();

          (window as any).safari.pushNotification.requestPermission(
            `${process.env.NEXT_PUBLIC_BASE_URL}/web_push/safari`,
            process.env.NEXT_PUBLIC_WEB_PUSH_ID,
            {
              publicKey,
              access_token: cookiesInstance.get('accessToken'),
            },
            requestPermissionSafari
          );
        } else if (permissionData.permission === 'denied') {
          // The user said no.
        } else if (permissionData.permission === 'granted') {
          onSuccess?.();
          setIsSubscribed(true);
        }
      } catch (err: any) {
        if (err.message === 'Push notification prompting has been disabled.') {
          openPushNotificationAlert();
        } else {
          showErrorToastPredefined();
          console.error(err);
        }
      }
    },
    [openPushNotificationAlert, showErrorToastPredefined, getPublicKey]
  );

  const subscribeSafari = useCallback(
    async (onSuccess?: () => void) => {
      try {
        const permissionData = getPermissionData();

        if (permissionData.permission === 'granted') {
          await registerSubscriptionSafari(permissionData.deviceToken);

          onSuccess?.();
          setIsSubscribed(true);
        } else {
          requestPermissionSafari(permissionData, onSuccess);
        }
      } catch (err) {
        console.error(err);
        showErrorToastPredefined();
      }
    },
    [
      requestPermissionSafari,
      getPermissionData,
      registerSubscriptionSafari,
      showErrorToastPredefined,
    ]
  );

  const subscribeNonSafari = useCallback(
    async (onSuccess?: () => void) => {
      try {
        if (!('serviceWorker' in navigator)) {
          throw new Error(
            `Sorry, your browser doesn't support push notifications`
          );
        }

        const swReg = await navigator.serviceWorker.register('/sw.js');

        const notificationPermission = await Notification.requestPermission();

        if (notificationPermission !== 'granted') {
          return;
        }

        // remove old subscription if exist
        const oldSubscription = await swReg.pushManager.getSubscription();

        if (oldSubscription) {
          await oldSubscription.unsubscribe();
        }

        const publicKey = await getPublicKey();

        // subscribe
        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });

        await registerSubscriptionNonSafari(subscription);

        onSuccess?.();
        setIsSubscribed(true);
      } catch (err) {
        console.error(err);
        showErrorToastPredefined();
      }
    },
    [getPublicKey, registerSubscriptionNonSafari, showErrorToastPredefined]
  );

  const subscribe = useCallback(
    async (onSuccess?: () => void) => {
      if (isSafariBrowser.current) {
        await subscribeSafari(onSuccess);
      } else {
        await subscribeNonSafari(onSuccess);
      }
    },
    [subscribeSafari, subscribeNonSafari]
  );

  // Unsubscribe from push notifications
  const unsubscribeSafari = useCallback(async () => {
    try {
      const permissionData = getPermissionData();

      if (permissionData.deviceToken) {
        await unregister(permissionData.deviceToken);
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
      showErrorToastPredefined();
    }
  }, [unregister, getPermissionData, showErrorToastPredefined]);

  const unsubscribeNonSafari = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/sw.js');

      if (!swReg) {
        throw new Error('No active service worker');
      }

      const subscription = await swReg.pushManager.getSubscription();
      const sub = subscription?.toJSON();

      if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth || !sub.endpoint) {
        throw new Error('No active subscription');
      }

      await unregister(sub.endpoint);

      await subscription?.unsubscribe();

      setIsSubscribed(false);
    } catch (err: any) {
      if (err?.message === 'No active subscription') {
        setIsSubscribed(false);
      } else {
        showErrorToastPredefined();
      }
      console.error(err);
    }
  }, [unregister, showErrorToastPredefined]);

  const unsubscribe = useCallback(async () => {
    if (isSafariBrowser.current) {
      await unsubscribeSafari();
    } else {
      await unsubscribeNonSafari();
    }
  }, [unsubscribeSafari, unsubscribeNonSafari]);

  // Pause and resume notifications
  const pause = useCallback(async (endpoint: string) => {
    const payload = new newnewapi.WebPushPauseRequest({
      endpoint,
    });

    await webPushPause(payload);
  }, []);

  const resume = useCallback(async (endpoint: string) => {
    const payload = new newnewapi.WebPushResumeRequest({
      endpoint,
    });

    await webPushResume(payload);
  }, []);

  const pauseNotificationSafari = useCallback(async () => {
    try {
      const permissionData = getPermissionData();

      if (permissionData.deviceToken) {
        await pause(permissionData.deviceToken);
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
    }
  }, [pause, getPermissionData]);

  const pauseNotificationNonSafari = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/sw.js');

      if (!swReg) {
        throw new Error('No active service worker');
      }

      const subscription = await swReg.pushManager.getSubscription();
      const sub = subscription?.toJSON();

      if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth || !sub.endpoint) {
        return;
      }

      await pause(sub.endpoint);

      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
    }
  }, [pause]);

  const pauseNotification = useCallback(() => {
    if (!isPushNotificationSupported.current || !isSubscribed) {
      return;
    }

    if (isSafariBrowser.current) {
      pauseNotificationSafari();
    } else {
      pauseNotificationNonSafari();
    }
  }, [isSubscribed, pauseNotificationSafari, pauseNotificationNonSafari]);

  const resumePushNotificationSafari = useCallback(async () => {
    try {
      const permissionData = getPermissionData();

      if (permissionData.permission !== 'granted') {
        return;
      }

      if (!permissionData.deviceToken) {
        return;
      }

      const payload = await fetchCheckSubscription(permissionData.deviceToken);

      if (payload.exists && payload.paused) {
        await resume(permissionData.deviceToken);

        setIsSubscribed(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, [resume, getPermissionData, fetchCheckSubscription]);

  const resumePushNotificationNonSafari = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/sw.js');

      if (!swReg) {
        throw new Error('No active service worker');
      }

      const permissionData = getPermissionData();

      if (permissionData.permission !== 'granted') {
        return;
      }

      const subscription = await swReg.pushManager.getSubscription();
      const sub = subscription?.toJSON();

      if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth || !sub.endpoint) {
        return;
      }

      const payload = await fetchCheckSubscription(sub.endpoint);

      if (payload.exists && payload.paused) {
        await resume(sub.endpoint);

        setIsSubscribed(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, [getPermissionData, resume, fetchCheckSubscription]);

  const resumePushNotification = useCallback(() => {
    if (!isPushNotificationSupported.current) {
      return;
    }

    if (isSafariBrowser.current) {
      resumePushNotificationSafari();
    } else {
      resumePushNotificationNonSafari();
    }
  }, [resumePushNotificationSafari, resumePushNotificationNonSafari]);

  // Request permission
  const requestPermission = useCallback(async () => {
    const permissionData = getPermissionData();

    if (permissionData.permission === 'granted') {
      subscribe();
    } else if (permissionData.permission === 'default') {
      openPermissionRequestModal();
    } else {
      openPushNotificationAlert();
    }
  }, [
    openPushNotificationAlert,
    openPermissionRequestModal,
    getPermissionData,
    subscribe,
  ]);

  const contextValue = useMemo(
    () => ({
      isSubscribed,
      isPermissionRequestModalOpen,
      isPushNotificationAlertShown,
      isPushNotificationSupported: isPushNotificationSupported.current,
      requestPermission,
      subscribe,
      unsubscribe,
      closePermissionRequestModal,
      closePushNotificationAlert,
      promptUserWithPushNotificationsPermissionModal,
      pauseNotification,
      resumePushNotification,
    }),
    [
      isSubscribed,
      isPermissionRequestModalOpen,
      isPushNotificationAlertShown,
      requestPermission,
      closePermissionRequestModal,
      closePushNotificationAlert,
      subscribe,
      unsubscribe,
      promptUserWithPushNotificationsPermissionModal,
      pauseNotification,
      resumePushNotification,
    ]
  );

  const isUserWasLoggedIn = useRef(userLoggedIn);

  useEffect(() => {
    if (userLoggedIn) {
      isUserWasLoggedIn.current = true;
    }
  }, [userLoggedIn]);

  useEffect(() => {
    if (
      !userLoggedIn &&
      isUserWasLoggedIn.current &&
      isPushNotificationSupported.current
    ) {
      setIsPushNotificationAlertShown(false);
      setIsPermissionRequestModalOpen(false);
      setIsSubscribed(false);
      pauseNotification();
    }
  }, [userLoggedIn, pauseNotification]);

  return (
    <PushNotificationsContext.Provider value={contextValue}>
      {children}
    </PushNotificationsContext.Provider>
  );
};

export default PushNotificationsContextProvider;

export function usePushNotifications() {
  const context = useContext(PushNotificationsContext);

  if (!context) {
    throw new Error(
      'useModalWebPushes must be used inside a `PushNotificationsContextProvider`'
    );
  }

  return context;
}
