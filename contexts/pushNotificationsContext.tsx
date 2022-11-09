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

const WEB_PUSH_PROMPT_KEY =
  'isUserPromptedWithPushNotificationsPermissionModal';

const SESSION_TIME = 240000;

export const PushNotificationsContext = createContext<{
  inSubscribed: boolean;
  isPermissionRequestModalOpen: boolean;
  isLoading: boolean;
  permission: PermissionType;
  subscribe: (callback?: () => void) => void;
  unsubscribe: () => void;
  showPermissionRequestModal: () => void;
  closePermissionRequestModal: () => void;
  promptUserWithPushNotificationsPermissionModal: () => void;
}>({
  inSubscribed: false,
  isPermissionRequestModalOpen: false,
  isLoading: false,
  permission: 'default',
  subscribe: () => {},
  unsubscribe: () => {},
  showPermissionRequestModal: () => {},
  closePermissionRequestModal: () => {},
  promptUserWithPushNotificationsPermissionModal: () => {},
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
    useState<boolean>(false);

  const [inSubscribed, setIsSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [hasWebPush, setHasWebPush] = useState(false);
  const [permission, setPermission] = useState<PermissionType>('default');

  useEffect(() => {
    const getWebConfig = async () => {
      try {
        setIsLoading(true);
        const payload = new newnewapi.EmptyRequest({});

        const response = await webPushConfig(payload);

        setPublicKey(response.data?.publicKey || '');
        setHasWebPush(response.data?.hasWebPush || false);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getWebConfig();
  }, []);

  // Check initial push notification permission
  useEffect(() => {
    const checkSubscriptionSafari = () => {
      const permissionData = (window as any).safari.pushNotification.permission(
        process.env.NEXT_PUBLIC_WEBSITE_PUSH_ID
      );

      if (permissionData.permission === 'granted') {
        setIsSubscribed(true);
      }

      setPermission(permissionData.permission);
    };

    const checkSubscriptionNonSafari = async () => {
      const swReg = await navigator.serviceWorker.register('/sw.js');

      if (Notification.permission === 'granted') {
        const subscription = await swReg.pushManager.getSubscription();

        if (subscription) {
          setIsSubscribed(hasWebPush);
        } else {
          setIsSubscribed(false);
        }
      }

      setPermission(Notification.permission);
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (isSafari() && 'pushNotification' in (window as any).safari) {
        checkSubscriptionSafari();
      } else {
        checkSubscriptionNonSafari();
      }
    }
  }, [hasWebPush]);

  // Permission Modal
  const showPermissionRequestModal = useCallback(() => {
    setIsPermissionRequestModalOpen(true);
  }, []);

  const closePermissionRequestModal = useCallback(() => {
    setIsPermissionRequestModalOpen(false);
  }, []);

  const promptUserWithPushNotificationsPermissionModal = useCallback(() => {
    if (
      localStorage.getItem(WEB_PUSH_PROMPT_KEY) !== 'true' &&
      permission === 'default' &&
      user.loggedIn
    ) {
      localStorage.setItem(WEB_PUSH_PROMPT_KEY, 'true');
      showPermissionRequestModal();
    }
  }, [showPermissionRequestModal, permission, user.loggedIn]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const shouldShowModal =
      localStorage.getItem(WEB_PUSH_PROMPT_KEY) !== 'true' &&
      user.loggedIn &&
      permission === 'default';

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
    permission,
  ]);

  // Subscribe to push notifications
  const checkPermissionSafari = useCallback(
    async (permissionData: any, onSuccess?: () => void) => {
      try {
        setPermission(permissionData.permission);

        if (permissionData.permission === 'default') {
          (window as any).safari.pushNotification.requestPermission(
            `${process.env.NEXT_PUBLIC_BASE_URL}/web_push/safari`,
            process.env.NEXT_PUBLIC_WEBSITE_PUSH_ID,
            {
              publicKey,
              access_token:
                cookiesInstance && cookiesInstance.get('accessToken'),
            },
            checkPermissionSafari
          );
        } else if (permissionData.permission === 'denied') {
          // The user said no.
        } else if (permissionData.permission === 'granted') {
          onSuccess?.();
          setIsSubscribed(true);
        }
      } catch (err: any) {
        if (err.message === 'Push notification prompting has been disabled.') {
          // TODO: show alert
        } else {
          console.error(err);
        }
      }
    },
    [publicKey]
  );

  const subscribeSafari = useCallback(
    (onSuccess?: () => void) => {
      try {
        const permissionData = (
          window as any
        ).safari.pushNotification.permission(
          `${process.env.NEXT_PUBLIC_BASE_URL}/web_push/safari`,
          process.env.NEXT_PUBLIC_WEBSITE_PUSH_ID
        );

        checkPermissionSafari(permissionData, onSuccess);
      } catch (err) {
        console.error(err);
      }
    },
    [checkPermissionSafari]
  );

  const subscribeNonSafari = useCallback(
    async (onSuccess?: () => void) => {
      try {
        const swReg = await navigator.serviceWorker.register('/sw.js');

        const notificationPermission = await Notification.requestPermission();

        if (notificationPermission === 'granted') {
          const subscription = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey,
          });
          const sub = subscription?.toJSON();

          if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
            throw new Error('Something goes wrong');
          }

          const payload = new newnewapi.RegisterForWebPushRequest({
            name: navigator.userAgent,
            expiration: `${sub.expirationTime}`,
            endpoint: sub.endpoint,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          });

          await webPushRegister(payload);

          onSuccess?.();
          setIsSubscribed(true);
        }

        setPermission(notificationPermission);
      } catch (err) {
        console.error(err);
      }
    },
    [publicKey]
  );

  const subscribe = useCallback(
    async (onSuccess?: () => void) => {
      if (isSafari() && 'pushNotification' in (window as any).safari) {
        subscribeSafari(onSuccess);
      } else {
        subscribeNonSafari(onSuccess);
      }
    },
    [subscribeSafari, subscribeNonSafari]
  );

  // Unsubscribe from push notifications
  const unsubscribeSafari = useCallback(() => {}, []);

  const unsubscribeNonSafari = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/sw.js');

      const subscription = await swReg.pushManager.getSubscription();
      const sub = subscription?.toJSON();

      if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
        throw new Error('No active subscription');
      }

      const payload = new newnewapi.UnRegisterForWebPushRequest({
        endpoint: sub.endpoint,
      });
      await webPushUnRegister(payload);

      await subscription?.unsubscribe();

      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (isSafari() && 'pushNotification' in (window as any).safari) {
      unsubscribeSafari();
    } else {
      unsubscribeNonSafari();
    }
  }, [unsubscribeSafari, unsubscribeNonSafari]);

  const contextValue = useMemo(
    () => ({
      isPermissionRequestModalOpen,
      inSubscribed,
      isLoading,
      permission,
      subscribe,
      unsubscribe,
      showPermissionRequestModal,
      closePermissionRequestModal,
      promptUserWithPushNotificationsPermissionModal,
    }),
    [
      inSubscribed,
      isPermissionRequestModalOpen,
      isLoading,
      permission,
      showPermissionRequestModal,
      closePermissionRequestModal,
      subscribe,
      unsubscribe,
      promptUserWithPushNotificationsPermissionModal,
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
