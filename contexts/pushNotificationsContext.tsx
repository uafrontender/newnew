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

export const PushNotificationsContext = createContext<{
  inSubscribed: boolean;
  isPermissionRequestModalOpen: boolean;
  subscribe: (callback?: () => void) => void;
  unsubscribe: () => void;
  showPermissionRequestModal: () => void;
  closePermissionRequestModal: () => void;
  promptUserWithPushNotificationsPermissionModal: () => void;
}>({
  inSubscribed: false,
  isPermissionRequestModalOpen: false,
  subscribe: () => {},
  unsubscribe: () => {},
  showPermissionRequestModal: () => {},
  closePermissionRequestModal: () => {},
  promptUserWithPushNotificationsPermissionModal: () => {},
});

interface IPushNotificationsContextProvider {
  children: React.ReactNode;
}

const WEB_PUSH_PROMPT_KEY =
  'isUserPromptedWithPushNotificationsPermissionModal';

const PushNotificationsContextProvider: React.FC<
  IPushNotificationsContextProvider
> = ({ children }) => {
  const user = useAppSelector((state) => state.user);

  const [isPermissionRequestModalOpen, setIsPermissionRequestModalOpen] =
    useState<boolean>(false);

  const [inSubscribed, setIsSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [hasWebPush, setHasWebPush] = useState(false);

  useEffect(() => {
    const getWebConfig = async () => {
      try {
        const payload = new newnewapi.EmptyRequest({});

        const response = await webPushConfig(payload);

        setPublicKey(response.data?.publicKey || '');
        setHasWebPush(response.data?.hasWebPush || false);
      } catch (err) {
        console.error(err);
      }
    };

    getWebConfig();
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const swReg = await navigator.serviceWorker.register('/sw.js');

        if (
          'safari' in window &&
          !swReg.pushManager &&
          'pushNotification' in (window as any).safari
        ) {
          // Safari 15 and lower
          const permissionData = (
            window as any
          ).safari.pushNotification.permission(
            process.env.NEXT_PUBLIC_WEBSITE_PUSH_ID
          );

          if (permissionData.permission === 'granted') {
            setIsSubscribed(hasWebPush);
          }
        } else if (Notification.permission === 'granted') {
          const subscription = await swReg.pushManager.getSubscription();

          if (subscription) {
            setIsSubscribed(hasWebPush);
          } else {
            setIsSubscribed(false);
          }
        }
      }
    };

    checkSubscription();
  }, [hasWebPush]);

  const showPermissionRequestModal = useCallback(() => {
    setIsPermissionRequestModalOpen(true);
  }, []);

  const closePermissionRequestModal = useCallback(() => {
    setIsPermissionRequestModalOpen(false);
  }, []);

  const promptUserWithPushNotificationsPermissionModal = useCallback(() => {
    if (localStorage.getItem(WEB_PUSH_PROMPT_KEY) !== 'true') {
      localStorage.setItem(WEB_PUSH_PROMPT_KEY, 'true');
      showPermissionRequestModal();
    }
  }, [showPermissionRequestModal]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // TODO: check tab focus
    if (localStorage.getItem(WEB_PUSH_PROMPT_KEY) !== 'true' && user.loggedIn) {
      timeoutId = setTimeout(
        promptUserWithPushNotificationsPermissionModal,
        240000
      );
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [promptUserWithPushNotificationsPermissionModal, user.loggedIn]);

  const checkPermissionSafari = useCallback(
    async (permissionData: any) => {
      if (permissionData.permission === 'default') {
        (window as any).safari.pushNotification.requestPermission(
          `${process.env.NEXT_PUBLIC_BASE_URL}/web_push/safari`,
          process.env.NEXT_PUBLIC_WEBSITE_PUSH_ID,
          { publicKey, access_token: cookiesInstance.get('accessToken') },
          checkPermissionSafari
        );
      } else if (permissionData.permission === 'denied') {
        // The user said no.
      } else if (permissionData.permission === 'granted') {
        setIsSubscribed(true);
      }
    },
    [publicKey]
  );

  const subscribe = useCallback(
    async (onSuccess?: () => void) => {
      try {
        if (
          'safari' in window &&
          // !swReg.pushManager &&
          'pushNotification' in (window as any).safari
        ) {
          // Safari 15 and lower
          const permissionData = (
            window as any
          ).safari.pushNotification.permission(
            `${process.env.NEXT_PUBLIC_BASE_URL}/web_push/safari`,
            process.env.NEXT_PUBLIC_WEBSITE_PUSH_ID
          );

          checkPermissionSafari(permissionData);
        } else {
          const swReg = await navigator.serviceWorker.register('/sw.js');

          const notificationPermission = await Notification.requestPermission();

          if (notificationPermission === 'granted') {
            try {
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
            } catch (err) {
              console.error(err);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    [checkPermissionSafari, publicKey]
  );

  const unsubscribe = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/sw.js');

      if (
        'safari' in window &&
        !swReg.pushManager &&
        'pushNotification' in (window as any).safari
      ) {
        setIsSubscribed(false);
        return;
      }

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

  const contextValue = useMemo(
    () => ({
      isPermissionRequestModalOpen,
      inSubscribed,
      subscribe,
      unsubscribe,
      showPermissionRequestModal,
      closePermissionRequestModal,
      promptUserWithPushNotificationsPermissionModal,
    }),
    [
      inSubscribed,
      isPermissionRequestModalOpen,
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
