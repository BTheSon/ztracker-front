export interface Order {
    id: string;
    address: string;
    phone: string;
    createdAt: string;
    called?: boolean;
}

export interface DetailOrder extends Order {
    time?: string;
    img_url?: string;
}

const now = Date.now();

const mockQueue: Order[] = [
    { id: "q1", address: "1 trần hưng đạo", phone: "0294976437", createdAt: new Date(now - 35 * 60000).toISOString() },
    { id: "q2", address: "2 trần hưng đạo", phone: "0294976431", createdAt: new Date(now - 12 * 60000).toISOString() },
    { id: "q3", address: "3 trần hưng đạo", phone: "0294976433", createdAt: new Date(now - 2 * 60000).toISOString() },
];

const mockDetail: DetailOrder[] = [
    {
        id: "d1",
        address: "18/1 Hàn Mặc Tử",
        phone: "0394796437",
        createdAt: new Date(now - 45 * 60000).toISOString(),
        img_url: "https://photo-stal-10.zdn.vn/gr/jpg/fecfbe5dcb730f2d5662/2aOboQjNE7tocbVYCPNuSrMFesUsTVrNzq03ACQa.jpg",
    },
    {
        id: "d2",
        address: "79 trần hưng đạo",
        phone: "0394796437",
        createdAt: new Date(now - 5 * 60000).toISOString(),
        time: "13:55",
        img_url: "https://photo-stal-9.zdn.vn/gr/jpg/65f6d1edc0c3049d5dd2/2aOboQjN3qfPd3YPQ4nZE5IjUSnIwTvbkuOMNY3M.jpg",
    },
];

export const orderApi = {
    getQueue: async (): Promise<Order[]> => {
        return new Promise((resolve) => setTimeout(() => resolve([...mockQueue]), 300));
    },
    getDetail: async (): Promise<DetailOrder[]> => {
        return new Promise((resolve) => setTimeout(() => resolve([...mockDetail]), 300));
    }
};
