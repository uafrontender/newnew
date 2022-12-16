self.addEventListener('push', (event) => {
  const message = event.data.json();

  if (message.silent) {
    return console.log(message);
  }

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i += 1) {
          const client = clientList[i];

          // don't show pushes for dms is user is on dm page
          if (
            message?.url.includes('direct-message') &&
            client.url.includes('direct-message') &&
            client.focused
          ) {
            return;
          }

          // don't show pushes if user currently is on the same url as in push message
          if (client.url.includes(message?.url) && client.focused) {
            return;
          }
        }

        self.registration.showNotification(message.title, {
          body: message.text,
          badge: './favicon.png',
          icon: './favicon.png',
          tag: message.url,
          renotify: true,
          data: {
            message,
          },
        });
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i += 1) {
          const client = clientList[i];

          if (
            client.url.includes(event.notification.data?.message?.url) &&
            'focus' in client
          ) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(
            event.notification.data?.message?.url || '/'
          );
        }
      })
  );
});
