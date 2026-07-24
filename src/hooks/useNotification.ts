import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { subscribeToWebPush } from "../utils/pushHelper";

export function useNotification() {
    const [notifPermission, setNotifPermission] = useState(
        "Notification" in window ? Notification.permission : "denied"
    );
    const hasAutoSubscribed = useRef(false);

    const trySubscribe = async () => {
        await subscribeToWebPush();
    };

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            toast.error("Trình duyệt không hỗ trợ thông báo");
            return;
        }
        if (Notification.permission === "granted") {
            toast.success("Đã cấp quyền thông báo trước đó");
            await trySubscribe();
            return;
        }
        const permission = await Notification.requestPermission();
        setNotifPermission(permission);
        if (permission === "granted") {
            toast.success("Đã cấp quyền thông báo thành công!");
            await trySubscribe();
        } else {
            toast.error("Bạn đã từ chối cấp quyền thông báo");
        }
    };

    // Defer: Chỉ tự động subscribe nếu đã có quyền, và delay 3s để UI render trước
    useEffect(() => {
        if (hasAutoSubscribed.current) return;
        const timer = setTimeout(async () => {
            if (Notification.permission === "granted") {
                hasAutoSubscribed.current = true;
                await subscribeToWebPush();
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return { notifPermission, requestNotificationPermission };
}
