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
  webPushConfig,
  webPushRegister,
  webPushUnRegister,
} from '../api/endpoints/web_push';
import { cookiesInstance } from '../api/apiConfigs';
import { useAppSelector } from '../redux-store/store';
import isSafari from '../utils/isSafari';
import isIOS from '../utils/isIOS';
import useErrorToasts from '../utils/hooks/useErrorToasts';

const WEB_PUSH_PROMPT_KEY =
  'isUserPromptedWithPushNotificationsPermissionModal';

const SESSION_TIME = 240000;

export const PushNotificationsContext = createContext<{
  inSubscribed: boolean;
  isPermissionRequestModalOpen: boolean;
  isLoading: boolean;
  isPushNotificationAlertShown: boolean;
  subscribe: (callback?: () => void) => void;
  unsubscribe: () => void;
  requestPermission: () => void;
  closePermissionRequestModal: () => void;
  closePushNotificationAlert: () => void;
  promptUserWithPushNotificationsPermissionModal: () => void;
  pauseNotification: () => void;
  resumePushNotification: () => void;
}>({
  inSubscribed: false,
  isPermissionRequestModalOpen: false,
  isLoading: false,
  isPushNotificationAlertShown: false,
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
  const user = useAppSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [isPermissionRequestModalOpen, setIsPermissionRequestModalOpen] =
    useState(false);

  const [isPushNotificationAlertShown, setIsPushNotificationAlertShown] =
    useState(false);

  const [inSubscribed, setIsSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState('');

  const { showErrorToastPredefined } = useErrorToasts();

  const isSafariBrowser = useRef(
    isSafari() &&
      (window as any).safari &&
      'pushNotification' in (window as any).safari
  );

  // Get config
  useEffect(() => {
    const getWebConfig = async (isSecondTry?: boolean) => {
      try {
        setIsLoading(true);
        const payload = new newnewapi.EmptyRequest({});

        const response = await webPushConfig(payload);

        setPublicKey(response.data?.publicKey || '');
      } catch (err) {
        console.error(err);
        if (!isSecondTry) {
          getWebConfig(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    getWebConfig();
  }, []);

  // Get browser permission
  const getPermissionData: () => {
    permission: PermissionType;
    deviceToken?: string;
  } = useCallback(() => {
    if (isSafariBrowser.current) {
      const permissionData = (window as any).safari.pushNotification.permission(
        process.env.NEXT_PUBLIC_WEB_PUSH_ID
      );

      return permissionData;
    }

    return { permission: Notification.permission };
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
  const fetchCheckSubscription = useCallback(async (token: string) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/web_push/safari/check?token=${token}&access_token=${cookiesInstance.get(
          'accessToken'
        )}`
      );

      const response = await res.json();

      return !(Object.keys(response).length === 0);
    } catch (err) {
      return false;
    }
  }, []);

  // Check push notification subscription existing
  const checkSubscriptionSafari = useCallback(async () => {
    const permissionData = getPermissionData();

    if (permissionData.permission === 'granted' && permissionData.deviceToken) {
      const isSubscriptionExists = await fetchCheckSubscription(
        permissionData.deviceToken
      );

      return isSubscriptionExists;
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

      const isSubscriptionExists = await fetchCheckSubscription(
        subscription.endpoint
      );

      if (isSubscriptionExists) {
        return true;
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
    registerSubscriptionNonSafari,
    fetchCheckSubscription,
  ]);

  const checkSubscription = useCallback(async () => {
    let isSubscribed = false;

    if (isIOS()) {
      return;
    }

    if (isSafariBrowser.current) {
      isSubscribed = await checkSubscriptionSafari();
    } else {
      isSubscribed = await checkSubscriptionNonSafari();
    }

    setIsSubscribed(isSubscribed);
  }, [checkSubscriptionSafari, checkSubscriptionNonSafari]);

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
      !isIOS() &&
      getPermissionData().permission === 'default' &&
      user.loggedIn
    ) {
      localStorage.setItem(WEB_PUSH_PROMPT_KEY, 'true');
      openPermissionRequestModal();
    }
  }, [openPermissionRequestModal, user.loggedIn, getPermissionData]);

  // Prompt user after 4 min session on site
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const shouldShowModal =
      localStorage.getItem(WEB_PUSH_PROMPT_KEY) !== 'true' &&
      user.loggedIn &&
      !isIOS() &&
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
    user.loggedIn,
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
    [publicKey, openPushNotificationAlert, showErrorToastPredefined]
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
    [publicKey, registerSubscriptionNonSafari, showErrorToastPredefined]
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
    } catch (err) {
      console.error(err);
      showErrorToastPredefined();
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

      await unregister(sub.endpoint);

      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
    }
  }, [unregister]);

  const pauseNotification = useCallback(() => {
    if (isIOS()) {
      return;
    }

    if (isSafariBrowser.current) {
      unsubscribeSafari();
    } else {
      pauseNotificationNonSafari();
    }
  }, [unsubscribeSafari, pauseNotificationNonSafari]);

  const resumePushNotificationSafari = useCallback(async () => {
    try {
      const permissionData = getPermissionData();

      if (permissionData.permission !== 'granted') {
        return;
      }

      const isDeviceSubscribed = await checkSubscriptionSafari();

      if (!isDeviceSubscribed) {
        return;
      }

      await registerSubscriptionSafari(permissionData.deviceToken);
    } catch (err) {
      console.error(err);
    }
  }, [registerSubscriptionSafari, getPermissionData, checkSubscriptionSafari]);

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

      if (!subscription) {
        return;
      }

      await registerSubscriptionNonSafari(subscription);
    } catch (err) {
      console.error(err);
    }
  }, [getPermissionData, registerSubscriptionNonSafari]);

  const resumePushNotification = useCallback(() => {
    if (isIOS()) {
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
      inSubscribed,
      isLoading,
      isPermissionRequestModalOpen,
      isPushNotificationAlertShown,
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
      inSubscribed,
      isLoading,
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

  const isUserWasLoggedIn = useRef(user.loggedIn);

  useEffect(() => {
    if (user.loggedIn) {
      isUserWasLoggedIn.current = true;
    }
  }, [user.loggedIn]);

  useEffect(() => {
    if (!user.loggedIn && isUserWasLoggedIn.current) {
      pauseNotification();
    }
  }, [user.loggedIn, pauseNotification]);

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
