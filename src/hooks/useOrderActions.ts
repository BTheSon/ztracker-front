import toast from "react-hot-toast";
import { orderRepository } from "../db/orderRepository";
import { DetailOrder } from "../types/order";

export function useOrderActions() {
    const handleMoveToQueue = async (order: DetailOrder) => {
        await orderRepository.update(order.id, { status: 'queue', orderIndex: Date.now() });
    };

    const handleSaveDetail = async (updated: DetailOrder) => {
        await orderRepository.update(updated.id, { ...updated });
    };

    const handleDeleteOrder = async (id: string) => {
        await orderRepository.delete(id);
    };

    const handleCallQueueOrder = async (id: string, isAlreadyCalled: boolean) => {
        if (isAlreadyCalled) return; // Dial native phone app, no state update needed
        await orderRepository.update(id, { status: 'called' });
    };

    const handleClearHistory = async () => {
        const calledOrders = await orderRepository.getByStatus('called');
        const ids = calledOrders.map(o => o.id);
        await orderRepository.bulkDelete(ids);
        toast.success("Đã dọn dẹp lịch sử đơn gọi");
    };

    const handleResetAll = async () => {
        await orderRepository.clear();
        toast.success("Đã xóa trắng toàn bộ dữ liệu");
    };

    return {
        handleMoveToQueue,
        handleSaveDetail,
        handleDeleteOrder,
        handleCallQueueOrder,
        handleClearHistory,
        handleResetAll
    };
}
