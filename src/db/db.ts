import Dexie, { Table } from 'dexie';

export interface Order {
    id: string;
    address: string;
    phone: string;
    img_url?: string;
    createdAt: string; 
    status: 'detail' | 'queue' | 'called';
    orderIndex?: number; // Dùng để lưu thứ tự khi kéo thả trong hàng chờ
    time?: string;
}

export class ZTrackerDB extends Dexie {
    orders!: Table<Order, string>;

    constructor() {
        super('ZTrackerDB');
        // id là khóa chính, các trường khác là index để query nhanh
        this.version(1).stores({
            orders: 'id, status, createdAt, orderIndex' 
        });
    }
}

export const db = new ZTrackerDB();
