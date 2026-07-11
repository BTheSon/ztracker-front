/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching';

// Tự động cache các file tĩnh của ứng dụng do Vite build ra
precacheAndRoute(self.__WB_MANIFEST || []);

// Lắng nghe sự kiện Push từ Backend gởi tới
self.addEventListener('push', (event) => {
    let data = { title: "Thông báo", body: "Bạn có thông báo mới", url: "/" };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options: NotificationOptions = {
        body: data.body,
        icon: '/icon-192x192.svg',
        badge: '/icon-192x192.svg',
        data: { url: data.url || '/' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Lắng nghe sự kiện khi người dùng bấm vào thông báo
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Nếu web đang mở, focus vào nó
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Nếu chưa mở, mở tab mới
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
