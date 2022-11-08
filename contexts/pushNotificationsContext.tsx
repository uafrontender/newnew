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

const PushNotificationsContextProvider: React.FC<
  IPushNotificationsContextProvider
> = ({ children }) => {
  const [isPermissionRequestModalOpen, setIsPermissionRequestModalOpen] =
    useState<boolean>(false);

  const [inSubscribed, setIsSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    const getWebConfig = async () => {
      try {
        const payload = new newnewapi.EmptyRequest({});

        const response = await webPushConfig(payload);

        setPublicKey(response.data?.publicKey || '');
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

          // TODO: check existing subscription
          console.log(permissionData.permission, 'permissionData.permission');
          if (permissionData.permission === 'granted') {
            setIsSubscribed(true);
          }
        } else if (Notification.permission === 'granted') {
          console.log('subscribe');
          const subscription = await swReg.pushManager.getSubscription();

          if (subscription) {
            setIsSubscribed(true);
          } else {
            setIsSubscribed(false);
          }
        } else {
          setIsSubscribed(false);
        }
      }
    };

    checkSubscription();
  }, []);

  const showPermissionRequestModal = useCallback(() => {
    setIsPermissionRequestModalOpen(true);
  }, []);

  const closePermissionRequestModal = useCallback(() => {
    setIsPermissionRequestModalOpen(false);
  }, []);

  const promptUserWithPushNotificationsPermissionModal = useCallback(() => {
    console.log('HERE');
    const WEB_PUSH_PROMPT_KEY =
      'isUserPromptedWithPushNotificationsPermissionModal';
    if (localStorage.getItem(WEB_PUSH_PROMPT_KEY) !== 'true') {
      localStorage.setItem(WEB_PUSH_PROMPT_KEY, 'true');
      showPermissionRequestModal();
    }
  }, [showPermissionRequestModal]);

  const checkPermissionSafari = useCallback(
    async (permissionData: any) => {
      console.log(permissionData, 'permissionData');
      if (permissionData.permission === 'default') {
        console.log(
          'here',
          process.env.NEXT_PUBLIC_WEBSITE_PUSH_ID,
          process.env.NEXT_PUBLIC_APP_URL
        );
        // This is a new web service URL and its validity is unknown.
        const perm = await (
          window as any
        ).safari.pushNotification.requestPermission(
          `https://ldev.cloud/v1/web_push/safari`,
          'web.development.newnew.co',
          { publicKey, access_token: cookiesInstance.get('accessToken') }, // Data that you choose to send to your server to help you identify the user.
          checkPermissionSafari
        );
        console.log({ perm });
      } else if (permissionData.permission === 'denied') {
        // The user said no.
      } else if (permissionData.permission === 'granted') {
        // The web service URL is a valid push provider, and the user said yes.
        // permissionData.deviceToken is now available to use.

        console.log(permissionData, 'permissionData');
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
            `https://ldev.cloud/v1/web_push/safari`,
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

              console.log(
                JSON.stringify({
                  action: 'register',
                  subscription,
                })
              );

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
      // console.log(window.safari.pushNotification, 'subscription');

      const subscription = await swReg.pushManager.getSubscription();
      const sub = subscription?.toJSON();

      console.log(subscription, 'unsubscribe');

      if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
        throw new Error('No active subscription');
      }

      try {
        const payload = new newnewapi.UnRegisterForWebPushRequest({
          endpoint: sub.endpoint,
        });
        await webPushUnRegister(payload);
      } catch (e) {
        console.error(e);
      }

      try {
        await subscription?.unsubscribe();
      } catch (e) {
        console.error(e);
      }
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
