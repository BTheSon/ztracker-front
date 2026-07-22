import toast from "react-hot-toast";
import { orderRepository } from "../db/orderRepository";
import { DetailOrder } from "../types/order";

export function useOrderActions() {
    const handleMoveToQueue = async (order: DetailOrder) => {
        await orderRepository.update(order.id, { status: 'queue', orderIndex: Date.now() });
    };

    const handleMoveToDetail = async (id: string) => {
        await orderRepository.update(id, { status: 'detail' });
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

    const handleCreateOrder = async (data: { address: string; phone: string }) => {
        const now = new Date();
        const id = `manual-${Date.now()}`;
        const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await orderRepository.put({
            id,
            address: data.address,
            phone: data.phone,
            createdAt: now.toISOString(),
            status: 'detail',
            time: timeFormatted,
            orderIndex: Date.now(),
        });
        toast.success('Đã tạo đơn hàng mới');
    };

    return {
        handleMoveToQueue,
        handleMoveToDetail,
        handleSaveDetail,
        handleDeleteOrder,
        handleCallQueueOrder,
        handleClearHistory,
        handleResetAll,
        handleCreateOrder
    };
}
