import { useEffect } from "react";
import toast from "react-hot-toast";
import { createRealtimeClient } from "../api/socketClient";
import { orderRepository, mapSocketPayloadToOrder } from "../db/orderRepository";

export function useSocketEvents(onQr: (base64: string) => void) {
    useEffect(() => {
        let mounted = true;
        const client = createRealtimeClient();

        client.on("connect", () => console.log("Realtime client connected!"));

        client.on("login_qr", (payload: { qrcode_base64: string }) => {
            toast.success("Đăng nhập zalo để nhận đơn");
            if (payload?.qrcode_base64 && mounted) onQr(payload.qrcode_base64);
        });

        client.on("new_order", async (payload: any) => {
            await orderRepository.put(mapSocketPayloadToOrder(payload));
            toast.success(`Đơn mới: ${payload.address}`);
        });

        client.on("go_ship", async (payload: { msg_id: string }) => {
            await orderRepository.update(payload.msg_id, { status: 'queue', orderIndex: Date.now() });
            toast.success("Đã chuyển 1 đơn vào hàng chờ");
        });

        client.on("deleted_oder", async (payload: { msg_id: string }) => {
            await orderRepository.delete(payload.msg_id);
            toast.error("Một đơn hàng đã bị xóa");
        });

        client.on("server_message", (payload: { msg: string }) => {
            toast(payload.msg, { icon: "🔔" });
        });

        return () => {
            mounted = false;
            client.disconnect();
        };
    }, [onQr]);
}
