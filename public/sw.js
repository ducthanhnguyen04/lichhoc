// Service Worker for Web Push Notifications (LịchHọc.Ai)

self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || '📚 Nhắc Lịch Học Hôm Nay';
    const options = {
      body: data.body || 'Bạn có ca học hôm nay, hãy kiểm tra lịch nhé!',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      sound: data.sound || '/notification.mp3',
      silent: false,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        url: data.url || '/my-schedule',
      },
      tag: 'schedule-reminder-' + Date.now(),
      renotify: true,
      requireInteraction: true,
    };

    const playAudioInClients = clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        clientList[i].postMessage({ type: 'PLAY_NOTIFICATION_SOUND' });
      }
    });

    event.waitUntil(
      Promise.all([
        self.registration.showNotification(title, options),
        playAudioInClients
      ])
    );
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/my-schedule';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/my-schedule') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
