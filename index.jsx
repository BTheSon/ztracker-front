import React, { useState, useRef } from "react";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import QueueScreen from "./src/screens/QueueScreen";
import DetailScreen from "./src/screens/DetailScreen";
import { initialQueue, initialDetail } from "./src/data/mockData";

export default function App() {
    const [queue, setQueue] = useState(initialQueue);
    const [detail, setDetail] = useState(initialDetail);
    const [screen, setScreen] = useState("queue"); // "queue" | "detail"

    const scrollContainerRef = useRef(null);

    const scrollToScreen = (scr) => {
        setScreen(scr);
        if (scrollContainerRef.current) {
            const index = scr === "queue" ? 0 : 1;
            scrollContainerRef.current.scrollTo({
                left: index * window.innerWidth,
                behavior: "smooth"
            });
        }
    };

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const width = e.target.clientWidth;
        if (width === 0) return;
        const index = Math.round(scrollLeft / width);
        const newScreen = index === 0 ? "queue" : "detail";
        if (newScreen !== screen) {
            setScreen(newScreen);
        }
    };

    const handleMoveToQueue = (order) => {
        setDetail((prev) => prev.filter((o) => o.id !== order.id));
        setQueue((prev) => [
            ...prev,
            { id: order.id, address: order.address, phone: order.phone, timer: order.timer },
        ]);
    };

    const handleSaveDetail = (updated) => {
        setDetail((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    };

    const firstQueueOrder = queue[0];

    return (
        <div className="h-[100dvh] w-full bg-stone-100 flex flex-col overflow-hidden">
            {/* Tabs Indicator */}
            <div className="flex bg-white border-b border-stone-200 z-10 shadow-sm relative">
                <button 
                    onClick={() => scrollToScreen("queue")}
                    className={`flex-1 py-3 text-sm font-medium text-center transition ${screen === "queue" ? "text-emerald-600" : "text-stone-400"}`}
                >
                    Hàng chờ
                </button>
                <button 
                    onClick={() => scrollToScreen("detail")}
                    className={`flex-1 py-3 text-sm font-medium text-center transition ${screen === "detail" ? "text-emerald-600" : "text-stone-400"}`}
                >
                    Chi tiết
                </button>
                <motion.div 
                    className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-emerald-500"
                    animate={{ x: screen === "queue" ? "0%" : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>

            <div className="flex-1 overflow-hidden relative">
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    <div className="w-full h-full flex-shrink-0 snap-start overflow-hidden">
                        <QueueScreen queue={queue} onReorder={setQueue} />
                    </div>
                    <div className="w-full h-full flex-shrink-0 snap-start overflow-hidden">
                        <DetailScreen orders={detail} onMoveToQueue={handleMoveToQueue} onSave={handleSaveDetail} />
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div 
                className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            >
                <a
                    href={firstQueueOrder ? `tel:${firstQueueOrder.phone}` : undefined}
                    className={[
                        "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto transition-transform active:scale-95",
                        firstQueueOrder ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" : "bg-stone-300 pointer-events-none",
                    ].join(" ")}
                    title={firstQueueOrder ? `Gọi ${firstQueueOrder.phone}` : "Không có đơn đầu tiên"}
                >
                    <Phone size={26} />
                </a>
            </div>
        </div>
    );
}