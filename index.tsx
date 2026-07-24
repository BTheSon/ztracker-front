import { useState } from "react";
import { Phone, Menu, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import QueueScreen from "./src/screens/QueueScreen";
import DetailScreen from "./src/screens/DetailScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import { useApp } from "./src/hooks/useApp";
import { usePWAInstall } from "./src/hooks/usePWAInstall";
import Sidebar from "./src/components/Sidebar";
import ConfirmModal, { ConfirmModalProps } from "./src/components/ConfirmModal";
import CreateOrderModal from "./src/components/CreateOrderModal";
import ImageModal from "./src/components/ImageModal";
import { Order } from "./src/db/db";

export default function App() {
    const {
        queue,
        setQueue,
        calledQueue,
        allCalledOrders,
        detail,
        screen,
        scrollContainerRef,
        scrollToScreen,
        handleScroll,
        handleMoveToQueue,
        handleMoveToDetail,
        handleSaveDetail,
        handleCallQueueOrder,
        firstUncalledOrder,
        qrBase64,
        clearQr,
        requestNotificationPermission,
        handleDeleteOrder,
        handleClearHistory,
        handleResetAll,
        handleCreateOrder
    } = useApp();

    const { isInstallable, install } = usePWAInstall();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [imageOrder, setImageOrder] = useState<Order | null>(null);

    const handleViewImage = (order: Order) => {
        setImageOrder(order);
        setIsImageOpen(true);
    };
    const [modalConfig, setModalConfig] = useState<ConfirmModalProps & { isOpen: boolean }>({
        isOpen: false, title: "", message: "", onConfirm: () => {}, onCancel: () => {}
    });

    const confirmClearHistory = () => {
        setModalConfig({
            isOpen: true,
            title: "Dọn dẹp lịch sử",
            message: "Bạn có chắc muốn xóa vĩnh viễn các đơn hàng đã gọi? Hành động này không thể hoàn tác.",
            confirmText: "Xóa",
            isDanger: true,
            onConfirm: () => { handleClearHistory(); setModalConfig(prev => ({ ...prev, isOpen: false })); },
            onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    const confirmResetAll = () => {
        setModalConfig({
            isOpen: true,
            title: "Xóa toàn bộ dữ liệu",
            message: "⚠️ NGUY HIỂM: Tất cả dữ liệu hàng chờ, chi tiết và lịch sử sẽ bị xóa vĩnh viễn khỏi thiết bị này!",
            confirmText: "Xóa trắng",
            isDanger: true,
            onConfirm: () => { handleResetAll(); setModalConfig(prev => ({ ...prev, isOpen: false })); },
            onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    return (
        <div className="h-[100dvh] w-full bg-stone-100 flex flex-col overflow-hidden">
            <Toaster position="top-center" />
            {qrBase64 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-4 rounded-lg max-w-sm w-full flex flex-col items-center">
                        <div className="text-sm text-stone-600 mb-2">Quét mã QR để đăng nhập</div>
                        <img src={`data:image/png;base64,${qrBase64}`} alt="Login QR" className="w-64 h-64 object-contain" />
                        <button onClick={clearQr} className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded">Đóng</button>
                    </div>
                </div>
            )}
            {/* Tabs Indicator */}
            <div className="flex bg-white border-b border-stone-200 z-10 shadow-sm relative items-center justify-center">
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="absolute left-3 p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition shadow-sm active:scale-95"
                    title="Menu"
                >
                    <Menu size={22} />
                </button>
                <button 
                    onClick={() => scrollToScreen("queue")}
                    className={`flex-1 py-4 text-sm font-bold tracking-wide transition ${screen === "queue" ? "text-emerald-600" : "text-stone-400"}`}
                >
                    Hàng chờ
                </button>
                <button 
                    onClick={() => scrollToScreen("detail")}
                    className={`flex-1 py-4 text-sm font-bold tracking-wide transition ${screen === "detail" ? "text-emerald-600" : "text-stone-400"}`}
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
                        <QueueScreen 
                            queue={queue} 
                            calledQueue={calledQueue}
                            onReorder={setQueue} 
                            onCallOrder={handleCallQueueOrder}
                            onMoveToDetail={handleMoveToDetail}
                            onViewImage={handleViewImage}
                        />
                    </div>
                    <div className="w-full h-full flex-shrink-0 snap-start overflow-hidden">
                        <DetailScreen orders={detail} onMoveToQueue={handleMoveToQueue} onSave={handleSaveDetail} onDelete={handleDeleteOrder} />
                    </div>
                </div>
            </div>

            {/* FAB: Gọi đơn đầu tiên (giữa) + Tạo đơn mới (phải) */}
            <div
                className="absolute bottom-6 left-0 right-0 z-50 pointer-events-none flex items-center justify-center"
                style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
            >
                {/* Nút Tạo đơn mới */}
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="absolute right-5 w-12 h-12 rounded-full bg-white border border-stone-200 shadow-lg flex items-center justify-center text-emerald-600 pointer-events-auto transition active:scale-95 hover:bg-emerald-50"
                    title="Tạo đơn mới"
                >
                    <Plus size={22} />
                </button>

                {/* Nút Gọi đơn FAB chính giữa */}
                <button
                    disabled={!firstUncalledOrder}
                    onClick={() => {
                        if (firstUncalledOrder) handleCallQueueOrder(firstUncalledOrder.id, firstUncalledOrder.phone, false);
                    }}
                    className={[
                        "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto transition-transform active:scale-95",
                        firstUncalledOrder ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" : "bg-stone-300 opacity-60 cursor-not-allowed",
                    ].join(" ")}
                    title={firstUncalledOrder ? `Gọi ${firstUncalledOrder.phone}` : "Không có đơn cần gọi"}
                >
                    <Phone size={26} />
                </button>
            </div>

            <Sidebar 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)}
                onRequestNotification={requestNotificationPermission}
                onDownload={install}
                isInstallable={isInstallable}
                onClearHistory={confirmClearHistory}
                onReset={confirmResetAll}
                onOpenHistory={() => setIsHistoryOpen(true)}
            />

            <ConfirmModal {...modalConfig} />

            <CreateOrderModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreateOrder}
            />

            <HistoryScreen
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={allCalledOrders}
                onCallOrder={handleCallQueueOrder}
                onViewImage={handleViewImage}
            />

            <ImageModal
                isOpen={isImageOpen}
                onClose={() => setIsImageOpen(false)}
                img_url={imageOrder?.img_url}
                raw_text={imageOrder?.raw_text}
            />
        </div>
    );
}