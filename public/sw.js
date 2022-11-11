self.addEventListener('push', (event) => {
  const message = event.data.json();

  self.registration.showNotification(message.title, {
    body: message.text,
    badge: './favicon.png',
    icon: './favicon.png',
    data: {
      message,
    },
  });
});

self.addEventListener('notificationclick', (event) => {
  console.log('On notification click: ', event);

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
          console.log(
            client.url,
            event.notification.data?.message?.url,
            client.url.includes(event.notification.data?.message?.url)
          );
          console.log('focus' in client, 'focus');
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
