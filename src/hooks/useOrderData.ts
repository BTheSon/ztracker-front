import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Order as DbOrder } from "../db/db";
import { DetailOrder } from "../types/order";

export function useOrderData() {
    const detailLive = useLiveQuery(() => db.orders.where('status').equals('detail').sortBy('createdAt')) || [];
    const detail = [...detailLive].reverse() as DetailOrder[];
    
    const calledLive = useLiveQuery(() => db.orders.where('status').equals('called').sortBy('createdAt')) || [];
    const allCalledOrders = [...calledLive].reverse();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const calledQueue = allCalledOrders.filter(order => new Date(order.createdAt) >= today);
    
    const queueLive = useLiveQuery(() => db.orders.where('status').equals('queue').sortBy('orderIndex')) || [];
    const [queue, setQueueLocal] = useState<DbOrder[]>([]);

    useEffect(() => {
        setQueueLocal(queueLive);
    }, [queueLive]);

    const setQueue = (newQ: DbOrder[]) => {
        setQueueLocal(newQ);
        db.transaction('rw', db.orders, async () => {
            for (let i = 0; i < newQ.length; i++) {
                await db.orders.update(newQ[i].id, { orderIndex: i });
            }
        });
    };

    return {
        detail,
        calledQueue,
        allCalledOrders,
        queue,
        setQueue,
        firstUncalledOrder: queue[0],
    };
}
