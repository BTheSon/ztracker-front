/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching';

// Tự động cache các file tĩnh của ứng dụng do Vite build ra
precacheAndRoute(self.__WB_MANIFEST || []);

// Helper: Ghi order vào IndexedDB bằng raw API (không cần import Dexie)
function saveOrderToIDB(orderData: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ZTrackerDB');
        request.onsuccess = () => {
            const db = request.result;
            try {
                const tx = db.transaction('orders', 'readwrite');
                const store = tx.objectStore('orders');
                store.put({
                    id: orderData.id,
                    address: orderData.address,
                    phone: orderData.phone,
                    img_url: orderData.img_url,
                    createdAt: orderData.createdAt,
                    status: 'detail',
                    time: new Date(orderData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    orderIndex: Date.now()
                });
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            } catch (e) {
                // DB chưa có table orders (chưa mở app lần nào) → bỏ qua
                console.warn('SW: Không thể ghi order vào IDB:', e);
                resolve();
            }
        };
        request.onerror = () => {
            console.warn('SW: Không thể mở IDB:', request.error);
            resolve(); // Không block notification
        };
    });
}

// Lắng nghe sự kiện Push từ Backend gởi tới
self.addEventListener('push', (event) => {
    let payload: any = { title: "Thông báo", body: "Bạn có thông báo mới", data: { url: "/" } };
    
    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            payload.body = event.data.text();
        }
    }

    const processPush = async () => {
        let imageUrl: string | undefined = payload.image;

        // Trích xuất cục Order từ payload theo định dạng Backend mới
        if (payload.data && payload.data.type === 'new_order') {
            const orderData = payload.data.orderData;
            if (orderData) {
                console.log("Đã nhận được chi tiết đơn hàng (Background):", orderData);
                await saveOrderToIDB(orderData);
                if (orderData.img_url) {
                    imageUrl = orderData.img_url;
                }
            }
        }

        const options: NotificationOptions = {
            body: payload.body,
            icon: payload.icon || '/icon-192x192.svg',
            badge: imageUrl,
            data: payload.data || { url: '/' }
        };

        await self.registration.showNotification(payload.title, options);
    };

    event.waitUntil(processPush());
});

// Lắng nghe sự kiện khi người dùng bấm vào thông báo
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data.url ?? '/';

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

