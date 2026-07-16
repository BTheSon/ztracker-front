import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Order as DbOrder } from "../db/db";
import { DetailOrder } from "../api/orderApi";
import { createSocket } from "../api/socketClient";
import { subscribeToWebPush } from "../utils/pushHelper";

export function useApp() {
    // Queries Live từ Dexie
    const detailLive = useLiveQuery(() => db.orders.where('status').equals('detail').sortBy('createdAt')) || [];
    const detail = [...detailLive].reverse() as DetailOrder[]; // Đảo ngược để mới nhất lên đầu
    
    const calledLive = useLiveQuery(() => db.orders.where('status').equals('called').sortBy('createdAt')) || [];
    const calledQueue = [...calledLive].reverse();
    
    const queueLive = useLiveQuery(() => db.orders.where('status').equals('queue').sortBy('orderIndex')) || [];
    const [queue, setQueueLocal] = useState<DbOrder[]>([]);

    useEffect(() => {
        setQueueLocal(queueLive);
    }, [queueLive]);

    // Hàm setQueue dùng cho kéo thả (Reorder), cập nhật state ngay lập tức và đồng bộ xuống DB
    const setQueue = (newQ: DbOrder[]) => {
        setQueueLocal(newQ);
        db.transaction('rw', db.orders, async () => {
            for (let i = 0; i < newQ.length; i++) {
                await db.orders.update(newQ[i].id, { orderIndex: i });
            }
        });
    };

    const [screen, setScreen] = useState<"queue" | "detail">("queue");
    const [loading, setLoading] = useState(false);
    const [qrBase64, setQrBase64] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mounted = true;

        // Request Notification permission and subscribe to Web Push
        if ("Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') subscribeToWebPush();
                });
            } else if (Notification.permission === "granted") {
                subscribeToWebPush();
            }
        }
        
        const socket = createSocket();

        socket.on("connect", () => {
            console.log("Socket.IO connected!");
        });

        socket.on("login_qr", (payload: { qrcode_base64: string }) => {
            toast.success("Đăng nhập zalo để nhận đơn");
            if (payload && payload.qrcode_base64) {
                // payload.qrcode_base64 is expected to be a base64-encoded PNG/JPEG string (no data-uri prefix)
                setQrBase64(payload.qrcode_base64);
            }
        });

        socket.on("new_order", async (payload: { id: string; address: string; phone: string; img_url: string; createdAt: string | Date }) => {
            const timeFormatted = new Date(payload.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await db.orders.put({
                id: payload.id,
                address: payload.address,
                phone: payload.phone,
                img_url: payload.img_url,
                createdAt: new Date(payload.createdAt).toISOString(),
                status: 'detail',
                time: timeFormatted,
                orderIndex: Date.now()
            });
            toast.success(`Đơn mới: ${payload.address}`);
            // Push Notification is handled by Service Worker when app is closed,
            // but if app is open, SW might still show it. Native Notification here is optional now.
        });

        socket.on("go_ship", async (payload: { msg_id: string }) => {
            const order = await db.orders.get(payload.msg_id);
            if (order) {
                await db.orders.update(payload.msg_id, { status: 'queue', orderIndex: Date.now() });
                toast.success("Đã chuyển 1 đơn vào hàng chờ");
            }
        });

        socket.on("deleted_oder", async (payload: { msg_id: string }) => {
            await db.orders.delete(payload.msg_id);
            toast.error("Một đơn hàng đã bị xóa");
        });

        socket.on("server_message", (payload: { msg: string }) => {
            toast(payload.msg, { icon: "🔔" });
        });

        return () => { 
            mounted = false; 
            socket.disconnect();
        };
    }, []);

    const scrollToScreen = (scr: "queue" | "detail") => {
        setScreen(scr);
        if (scrollContainerRef.current) {
            const index = scr === "queue" ? 0 : 1;
            scrollContainerRef.current.scrollTo({
                left: index * window.innerWidth,
                behavior: "smooth"
            });
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const scrollLeft = target.scrollLeft;
        const width = target.clientWidth;
        if (width === 0) return;
        const index = Math.round(scrollLeft / width);
        const newScreen = index === 0 ? "queue" : "detail";
        if (newScreen !== screen) {
            setScreen(newScreen);
        }
    };

    const handleMoveToQueue = async (order: DetailOrder) => {
            await db.orders.update(order.id, { status: 'queue', orderIndex: Date.now() });
    };

    const handleSaveDetail = async (updated: DetailOrder) => {
        await db.orders.update(updated.id, { ...updated });
    };

    const handleDeleteOrder = async (id: string) => {
        await db.orders.delete(id);
    };

    const handleCallQueueOrder = async (id: string, isAlreadyCalled: boolean) => {
        if (isAlreadyCalled) return; // Dial native phone app, no state update needed
        await db.orders.update(id, { status: 'called' });
    };

    const handleClearHistory = async () => {
        const calledOrders = await db.orders.where('status').equals('called').toArray();
        const ids = calledOrders.map(o => o.id);
        await db.orders.bulkDelete(ids);
        toast.success("Đã dọn dẹp lịch sử đơn gọi");
    };

    const handleResetAll = async () => {
        await db.orders.clear();
        toast.success("Đã xóa trắng toàn bộ dữ liệu");
    };

    const clearQr = () => setQrBase64(null);

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            toast.error("Trình duyệt không hỗ trợ thông báo");
            return;
        }
        
        if (Notification.permission === "granted") {
            toast.success("Đã cấp quyền thông báo trước đó");
            subscribeToWebPush();
            return;
        }
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            toast.success("Đã cấp quyền thông báo thành công!");
            subscribeToWebPush();
        } else {
            toast.error("Bạn đã từ chối cấp quyền thông báo");
        }
    };

    return {
        queue,
        setQueue,
        calledQueue,
        detail,
        screen,
        loading,
        scrollContainerRef,
        scrollToScreen,
        handleScroll,
        handleMoveToQueue,
        handleSaveDetail,
        handleDeleteOrder,
        handleCallQueueOrder,
        handleClearHistory,
        handleResetAll,
        firstUncalledOrder: queue[0],
        qrBase64,
        clearQr,
        requestNotificationPermission
    };
}
