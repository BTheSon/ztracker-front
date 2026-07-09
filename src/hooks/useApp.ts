import { useState, useRef, useEffect } from "react";
import { orderApi, Order, DetailOrder } from "../api/orderApi";

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
        return () => { mounted = false; };
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
