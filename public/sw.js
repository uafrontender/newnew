self.addEventListener('push', (event) => {
  const message = event.data.json();

  self.registration.showNotification(message.title, {
    body: message.text,
    badge: './favicon.png',
    icon: './favicon.png',
  });
});

self.addEventListener('notificationclick', (event) => {
  console.log('On notification click: ', event.notification);

  event.notification.close();
  clients.openWindow('/');

  // This looks to see if the current is already open and
  // focuses if it is
  // event.waitUntil(clients.matchAll({
  //   type: "window"
  // }).then((clientList) => {
  //   console.log(clientList, 'clientList');
  //   for (var i = 0; i < clientList.length; i++) {
  //     var client = clientList[i];
  //     if (client.url == '/' && 'focus' in client)
  //       return client.focus();
  //   }
  //   if (clients.openWindow)
  //     return clients.openWindow('/');
  // }));
});
