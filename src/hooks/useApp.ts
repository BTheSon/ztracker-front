import { useState, useCallback } from "react";
import { useOrderData } from "./useOrderData";
import { useSocketEvents } from "./useSocketEvents";
import { useNotification } from "./useNotification";
import { useScreenNav } from "./useScreenNav";
import { useOrderActions } from "./useOrderActions";

export function useApp() {
    const [qrBase64, setQrBase64] = useState<string | null>(null);
    const clearQr = () => setQrBase64(null);

    const orderData = useOrderData();
    const nav = useScreenNav();
    const actions = useOrderActions();
    const { requestNotificationPermission } = useNotification();
    
    const handleQr = useCallback((base64: string) => {
        setQrBase64(base64);
    }, []);
    
    useSocketEvents(handleQr);

    return {
        ...orderData,
        ...nav,
        ...actions,
        qrBase64,
        clearQr,
        requestNotificationPermission
    };
}
