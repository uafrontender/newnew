import { useState, useCallback, useEffect } from 'react';
import { newnewapi } from 'newnew-api';
import { webPushRegister, webPushUnRegister } from '../../api/endpoints/user';


const usePushNotifications = () => {
  const [inSubscribed, setIsSubscribed] = useState(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      return Notification.permission === 'granted';
    }

    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSubscribed(Notification.permission === 'granted');
    }
  }, []);

  const checkPermissionSafari = useCallback((permissionData: any) => {
    if (permissionData.permission === 'default') {
      // This is a new web service URL and its validity is unknown.
      (window as any).safari.pushNotification.requestPermission(
        'http://localhost:4000', // The web service URL.
        'web.development.newnew.co', // The Website Push ID.
        {}, // Data that you choose to send to your server to help you identify the user.
        checkPermissionSafari // The callback function.
      );
    } else if (permissionData.permission === 'denied') {
      // The user said no.
    } else if (permissionData.permission === 'granted') {
      // The web service URL is a valid push provider, and the user said yes.
      // permissionData.deviceToken is now available to use.

      console.log(permissionData, 'permissionData');
    }
  }, []);

  const subscribe = useCallback(
    async (topic: string, onSuccess?: () => void) => {
      try {
        const swReg = await navigator.serviceWorker.register('/sw.js');

        console.log(swReg.pushManager, 'swReg.pushManager');

        if (
          'safari' in window &&
          !swReg.pushManager &&
          'pushNotification' in (window as any).safari
        ) {
          const permissionData = (
            window as any
          ).safari.pushNotification.permission('web.development.newnew.co');
          console.log(checkPermissionSafari, 'checkPermissionSafari');
          checkPermissionSafari(permissionData);
        } else {
          return Notification.requestPermission( async (result) => {
            if (result === 'granted') {
              const subscription = await swReg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'BKp2r28o7iFLHBIC23U1Sc2fLg7t9D1DOklKJ8fQofHzySrBUg-F54TUl_69AaikfoMmkbduiWipOJ1qeO-ioPU',
              });
              const sub = subscription?.toJSON();

              if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
                return null;
              }

              console.log(JSON.stringify({
                action: 'register',
                subscription
              }));

              setIsSubscribed(true);
              onSuccess?.();

              const payload = new newnewapi.RegisterForWebPushRequest({
                name: navigator.userAgent,
                expiration: `${sub.expirationTime}`,
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              });

              return webPushRegister(payload);
            }

            return null;
          });
        }
      } catch (err) {
        console.error(err);
      }

      return null;
    },
    [checkPermissionSafari]
  );

  const unsubscribe = useCallback(async () => {
    try {
      const swReg = await navigator.serviceWorker.register('/sw.js');
      // console.log(window.safari.pushNotification, 'subscription');
      swReg.pushManager.getSubscription().then(async (subscription) => {
        console.log(subscription, 'subscription 2');
        const sub = subscription?.toJSON();

        if (!sub || !sub?.keys?.p256dh || !sub?.keys?.auth) {
          return null;
        }

        try {
          const payload = new newnewapi.UnRegisterForWebPushRequest({
            endpoint: sub.endpoint,
          });
          await webPushUnRegister(payload);
        } catch (e) {
          console.log(e);
        }

        try {
          await subscription?.unsubscribe();
        } catch (e) {
            console.log(e)
        }
              setIsSubscribed(false);

        return null;
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  // useEffect(() => {
  //   if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  //     // run only in browser
  //     subscribe('news');
  //   }
  // }, [subscribe]);

  return { inSubscribed, subscribe, unsubscribe };
};

export default usePushNotifications;
