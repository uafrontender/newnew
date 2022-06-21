import { useEffect } from 'react';

const config = {
  pushKey:
    "BKEcrchnX1OcONiHmQ7yfdx5SUTamoO_mQ-FvucfYIq9TTr62b8EKkMwJ8Buo1dAzG1HjQ8uBlPneSziguKwilg",
  appSyncUrl:
    "https://vqhpvr754vhdzl7htowx2wdh7y.appsync-api.us-east-1.amazonaws.com/graphql",
  appSyncApiKey: "da2-sbycfbciq5e5rpq4k5nxcpbvpe",
};


function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const usePushNotifications = () => {
  useEffect(() => {
    const subscribe = async(topic: string) => {
      try {   
      const swReg = await navigator.serviceWorker.register("/sw.js");


      Notification.requestPermission(async (result) => {
        if (result === 'granted') {
          const subscription = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(config.pushKey),
          });
      
          fetch(config.appSyncUrl, {
            method: "POST",
            headers: { "x-api-key": config.appSyncApiKey },
            body: JSON.stringify({ query: `mutation($topic: String, $subscription: String) {subscribe(topic: $topic, subscription: $subscription)}`, 
              variables: { topic, subscription: JSON.stringify(subscription) } })
          });
        }
      });

      } catch (err) {
        console.error(err)
      }
    }
   

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // run only in browser
      subscribe('news');
    }
  }, [])
}

export default usePushNotifications;