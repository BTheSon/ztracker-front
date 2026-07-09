import React from "react";
import { Phone, Download } from "lucide-react";
import { motion } from "framer-motion";
import QueueScreen from "./src/screens/QueueScreen";
import DetailScreen from "./src/screens/DetailScreen";
import { useApp } from "./src/hooks/useApp";
import { usePWAInstall } from "./src/hooks/usePWAInstall";

export default function App() {
    const {
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
        firstQueueOrder
    } = useApp();

    const { isInstallable, install } = usePWAInstall();

    if (loading) {
        return <div className="h-[100dvh] w-full flex items-center justify-center bg-stone-100 text-stone-500">Đang tải...</div>;
    }

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
                {isInstallable && (
                    <button 
                        onClick={install}
                        className="absolute right-3 p-2 text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition shadow-sm active:scale-95"
                        title="Tải ứng dụng về máy"
                    >
                        <Download size={18} />
                    </button>
                )}
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