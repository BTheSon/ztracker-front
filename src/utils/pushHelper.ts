import { BASE_URL } from "../config";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribeToWebPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications are not supported by this browser.');
        return;
    }

    try {
        // Chờ Service Worker cài đặt và kích hoạt thành công
        const registration = await navigator.serviceWorker.ready;
        
        // Gọi API lấy VAPID Public Key từ Backend
        const response = await fetch(`${BASE_URL}/api/push/vapid-public-key`);
        if (!response.ok) {
            throw new Error('Không thể lấy VAPID public key từ Backend');
        }
        
        const data = await response.json();
        // Backend có thể trả về { publicKey: "..." } hoặc bản thân data là chuỗi tùy thiết kế, ta lấy thuộc tính publicKey
        const vapidPublicKey = data.publicKey || data; 
        
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        // Đăng ký Push Manager
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });

        // Gửi subscription lên Backend lưu lại
        const subResponse = await fetch(`${BASE_URL}/api/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        if (!subResponse.ok) {
            throw new Error('Lỗi khi gửi subscription lên Backend');
        }

        console.log('Đăng ký Web Push thành công!');
    } catch (error) {
        console.error('Lỗi quá trình đăng ký Web Push:', error);
    }
}
