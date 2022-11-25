import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { newnewapi } from 'newnew-api';

import {
  webPushConfig,
  webPushRegister,
  webPushUnRegister,
} from '../api/endpoints/user';
import { cookiesInstance } from '../api/apiConfigs';
import { useAppSelector } from '../redux-store/store';
import isSafari from '../utils/isSafari';
import isIOS from '../utils/isIOS';

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
  // const [hasWebPush, setHasWebPush] = useState(false);

  // Get config
  useEffect(() => {
    const getWebConfig = async () => {
      try {
        setIsLoading(true);
        const payload = new newnewapi.EmptyRequest({});

        const response = await webPushConfig(payload);

        setPublicKey(response.data?.publicKey || '');
        // setHasWebPush(response.data?.hasWebPush || false);
      } catch (err) {
        console.error(err);
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
    if (
      isSafari() &&
      (window as any).safari &&
      'pushNotification' in (window as any).safari
    ) {
      const permissionData = (window as any).safari.pushNotification.permission(
        process.env.NEXT_PUBLIC_WEB_PUSH_ID
      );

      return permissionData;
    }

    return { permission: Notification.permission };
  }, []);

  // register and unregister
  const register = useCallback(
    async (subscriptionData: {
      expiration?: string;
      endpoint?: string;
      p256dh?: string;
      auth?: string;
    }) => {
      const payload = new newnewapi.RegisterForWebPushRequest({
        name: navigator.userAgent,
        expiration: subscriptionData.expiration,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.p256dh,
        auth: subscriptionData.auth,
      });

      return webPushRegister(payload);
    },
    []
  );

  const unregister = useCallback(async (endpoint: string) => {
    const payload = new newnewapi.UnRegisterForWebPushRequest({
      endpoint,
    });

    await webPushUnRegister(payload);
  }, []);

  // Check push notification subscription
  const checkSubscriptionSafari = useCallback(async () => {
    const permissionData = getPermissionData();

    if (permissionData.permission === 'granted') {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/web_push/safari/check?token=${
            permissionData.deviceToken
          }&access_token=${cookiesInstance.get('accessToken')}`
        );

        const response = await res.json();

        setIsSubscribed(!(Object.keys(response).length === 0));
        return !!response.endpoint;
      } catch (err) {
        setIsSubscribed(false);
        return false;
      }
    }

    return false;
  }, [getPermissionData]);

  const checkSubscriptionNonSafari = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/sw.js');

      if (!swReg) {
        setIsSubscribed(false);
        return false;
      }

      const permissionData = getPermissionData();

      if (permissionData.permission === 'granted') {
        const subscription = await swReg.pushManager.getSubscription();

        if (subscription) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/web_push/safari/check?token=${
              subscription.endpoint
            }&access_token=${cookiesInstance.get('accessToken')}`
          );

          const response = await res.json();

          console.log(response, 'response');

          // renew subscription if it has been updated
          if (Object.keys(response).length === 0) {
            const sub = subscription.toJSON();
            if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
              throw new Error('Something goes wrong');
            }

            await register({
              expiration: `${sub.expirationTime}`,
              endpoint: sub.endpoint,
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            });

            setIsSubscribed(true);
            return true;
          }

          setIsSubscribed(true);
          return true;
        }

        setIsSubscribed(false);
        return false;
      }

      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [getPermissionData, register]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (
        isSafari() &&
        (window as any).safari &&
        'pushNotification' in (window as any).safari
      ) {
        checkSubscriptionSafari();
      } else {
        checkSubscriptionNonSafari();
      }
    }
  }, [checkSubscriptionSafari, checkSubscriptionNonSafari]);

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
      getPermissionData().permission === 'default' &&
      user.loggedIn &&
      !isIOS()
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
          console.error(err);
        }
      }
    },
    [publicKey, openPushNotificationAlert]
  );

  const subscribeSafari = useCallback(
    async (onSuccess?: () => void) => {
      try {
        const permissionData = getPermissionData();

        if (permissionData.permission === 'default') {
          requestPermissionSafari(permissionData, onSuccess);
        } else {
          const response = await register({
            endpoint: permissionData.deviceToken,
            p256dh: 'safari',
            auth: process.env.NEXT_PUBLIC_WEB_PUSH_ID,
          });

          if (response.error) {
            throw response.error;
          }

          setIsSubscribed(true);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [requestPermissionSafari, getPermissionData, register]
  );

  const subscribeNonSafari = useCallback(
    async (onSuccess?: () => void) => {
      try {
        const swReg = await navigator.serviceWorker.register('/sw.js');

        const notificationPermission = await Notification.requestPermission();

        if (notificationPermission === 'granted') {
          const oldSubscription = await swReg.pushManager.getSubscription();
          if (oldSubscription) {
            await oldSubscription.unsubscribe();
          }

          const subscription = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey,
          });

          const sub = subscription?.toJSON();

          if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
            throw new Error('Something goes wrong');
          }
          const response = await register({
            expiration: `${sub.expirationTime}`,
            endpoint: sub.endpoint,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          });

          if (response.error) {
            throw response.error;
          }

          onSuccess?.();
          setIsSubscribed(true);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [publicKey, register]
  );

  const subscribe = useCallback(
    async (onSuccess?: () => void) => {
      if (
        isSafari() &&
        (window as any).safari &&
        'pushNotification' in (window as any).safari
      ) {
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

      if (!permissionData.deviceToken) {
        throw new Error('No active subscription');
      }

      await unregister(permissionData.deviceToken);

      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
    }
  }, [unregister, getPermissionData]);

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
    }
  }, [unregister]);

  const unsubscribe = useCallback(async () => {
    if (
      isSafari() &&
      (window as any).safari &&
      'pushNotification' in (window as any).safari
    ) {
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
        throw new Error('No active subscription');
      }

      await unregister(sub.endpoint);

      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
    }
  }, [unregister]);

  const pauseNotification = useCallback(() => {
    if (
      isSafari() &&
      (window as any).safari &&
      'pushNotification' in (window as any).safari
    ) {
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

      const response = await register({
        endpoint: permissionData.deviceToken,
        p256dh: 'safari',
        auth: process.env.NEXT_PUBLIC_WEB_PUSH_ID,
      });

      if (response.error) {
        throw response.error;
      }
    } catch (err) {
      console.error(err);
    }
  }, [register, getPermissionData, checkSubscriptionSafari]);

  const resumePushNotificationNonSafari = useCallback(
    async (onSuccess?: () => void) => {
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

        const sub = subscription?.toJSON();

        if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
          throw new Error('Something goes wrong');
        }

        const response = await register({
          expiration: `${sub.expirationTime}`,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        });

        if (response.error) {
          throw response.error;
        }

        onSuccess?.();
        setIsSubscribed(true);
      } catch (err) {
        console.error(err);
      }
    },
    [getPermissionData, register]
  );

  const resumePushNotification = useCallback(() => {
    if (
      isSafari() &&
      (window as any).safari &&
      'pushNotification' in (window as any).safari
    ) {
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
