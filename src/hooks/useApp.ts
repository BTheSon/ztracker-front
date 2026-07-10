import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { orderApi, Order, DetailOrder, BASE_URL } from "../api/orderApi";

export function useApp() {
    const [queue, setQueue] = useState<Order[]>([]);
    const [detail, setDetail] = useState<DetailOrder[]>([]);
    const [screen, setScreen] = useState<"queue" | "detail">("queue");
    const [loading, setLoading] = useState(true);

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

        const socket = io(BASE_URL);

        socket.on("connect", () => {
            console.log("Socket.IO connected!");
        });

        socket.on("new_order", (payload: { id: string; address: string; phone: string; createdAt: string | Date }) => {
            const newOrder: DetailOrder = {
                id: payload.id,
                address: payload.address,
                phone: payload.phone,
                timer: "Mới", 
                hasImage: false,
                time: new Date(payload.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                messages: []
            };
            setDetail(prev => [newOrder, ...prev]);
            toast.success(`Đơn mới: ${payload.address}`);
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
                            timer: orderToMove.timer
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
            { id: order.id, address: order.address, phone: order.phone, timer: order.timer },
        ]);
    };

    const handleSaveDetail = (updated: DetailOrder) => {
        setDetail((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    };

    return {
        queue,
        setQueue,
        detail,
        screen,
        loading,
        scrollContainerRef,
        scrollToScreen,
        handleScroll,
        handleMoveToQueue,
        handleSaveDetail,
        firstQueueOrder: queue[0]
    };
}
