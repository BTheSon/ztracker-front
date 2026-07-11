import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { orderApi, Order, DetailOrder, BASE_URL } from "../api/orderApi";

export function useApp() {
    const [queue, setQueue] = useState<Order[]>([]);
    const [calledQueue, setCalledQueue] = useState<Order[]>([]);
    const [detail, setDetail] = useState<DetailOrder[]>([]);
    const [screen, setScreen] = useState<"queue" | "detail">("queue");
    const [loading, setLoading] = useState(true);
    const [qrBase64, setQrBase64] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            setLoading(true);
            const [qData, dData] = await Promise.all([
                orderApi.getQueue(),
                orderApi.getDetail()
            ]);
            if (mounted) {
                setQueue(qData);
                setDetail(dData);
                setLoading(false);
            }
        }
        fetchData();

        // Request Notification permission
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const socket = io("http://localhost:3000");

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

        socket.on("new_order", (payload: { id: string; address: string; phone: string; img_url: string; createdAt: string | Date }) => {
            const newOrder: DetailOrder = {
                id: payload.id,
                address: payload.address,
                phone: payload.phone,
                img_url: payload.img_url,
                createdAt: new Date(payload.createdAt).toISOString(), 
                time: new Date(payload.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setDetail(prev => [newOrder, ...prev]);
            toast.success(`Đơn mới: ${payload.address}`);
            
            // Native Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Đơn hàng mới! 🛵", {
                    body: `Địa chỉ: ${payload.address}\nSĐT: ${payload.phone}`,
                    icon: "/icon-192x192.svg"
                });
            }
        });

        socket.on("go_ship", (payload: { msg_id: string }) => {
            setDetail(prev => {
                const orderToMove = prev.find(o => o.id === payload.msg_id);
                if (orderToMove) {
                    setQueue(q => {
                        if (q.some(o => o.id === payload.msg_id)) return q;
                        return [...q, {
                            id: orderToMove.id,
                            address: orderToMove.address,
                            phone: orderToMove.phone,
                            createdAt: orderToMove.createdAt
                        }];
                    });
                    toast.success("Đã chuyển 1 đơn vào hàng chờ");
                }
                return prev.filter(o => o.id !== payload.msg_id);
            });
        });

        socket.on("deleted_oder", (payload: { msg_id: string }) => {
            setDetail(prev => prev.filter(o => o.id !== payload.msg_id));
            setQueue(prev => prev.filter(o => o.id !== payload.msg_id));
            setCalledQueue(prev => prev.filter(o => o.id !== payload.msg_id));
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

    const handleMoveToQueue = (order: DetailOrder) => {
        setDetail((prev) => prev.filter((o) => o.id !== order.id));
        setQueue((prev) => [
            ...prev,
            { id: order.id, address: order.address, phone: order.phone, createdAt: order.createdAt },
        ]);
    };

    const handleSaveDetail = (updated: DetailOrder) => {
        setDetail((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    };

    const handleCallQueueOrder = (id: string, isAlreadyCalled: boolean) => {
        if (isAlreadyCalled) return; // Dial native phone app, no state update needed

        // Extract the order outside the state updater to avoid React Strict Mode double-invocation bug
        const order = queue.find(o => o.id === id);
        if (!order) return;

        setQueue(prev => prev.filter(o => o.id !== id));
        setCalledQueue(cq => [{ ...order, called: true }, ...cq]);
    };

    const clearQr = () => setQrBase64(null);

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
        handleCallQueueOrder,
        firstUncalledOrder: queue[0],
        qrBase64,
        clearQr
    };
}
