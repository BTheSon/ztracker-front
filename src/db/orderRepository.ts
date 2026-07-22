import { db, Order } from "./db";

export interface NewOrderPayload {
    id: string;
    address: string;
    phone: string;
    img_url?: string;
    raw_text?: string;
    createdAt: string | Date;
}

export function mapSocketPayloadToOrder(payload: NewOrderPayload): Order {
    const timeFormatted = new Date(payload.createdAt)
        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
        id: payload.id,
        address: payload.address,
        phone: payload.phone,
        img_url: payload.img_url,
        raw_text: payload.raw_text,
        createdAt: new Date(payload.createdAt).toISOString(),
        status: 'detail',
        time: timeFormatted,
        orderIndex: Date.now(),
    };
}

export interface IOrderRepository {
    getByStatus(status: Order['status']): Promise<Order[]>;
    put(order: Order): Promise<void>;
    update(id: string, changes: Partial<Order>): Promise<void>;
    delete(id: string): Promise<void>;
    bulkDelete(ids: string[]): Promise<void>;
    clear(): Promise<void>;
}

export const orderRepository: IOrderRepository = {
    getByStatus: (status) => db.orders.where('status').equals(status).toArray(),
    put: (order) => db.orders.put(order).then(() => {}),
    update: (id, changes) => db.orders.update(id, changes).then(() => {}),
    delete: (id) => db.orders.delete(id),
    bulkDelete: (ids) => db.orders.bulkDelete(ids),
    clear: () => db.orders.clear(),
};
