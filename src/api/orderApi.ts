export interface Order {
    id: string;
    address: string;
    phone: string;
    timer: string;
}

export interface Message {
    from: "me" | "them";
    text: string;
    link?: boolean;
    avatar?: boolean;
    name?: string;
}

export interface DetailOrder extends Order {
    hasImage: boolean;
    time?: string;
    messages?: Message[];
}

const mockQueue: Order[] = [
    { id: "q1", address: "109 trần hưng đạo", phone: "0294976437", timer: "30p" },
    { id: "q2", address: "109 trần hưng đạo", phone: "0294976437", timer: "30p" },
    { id: "q3", address: "109 trần hưng đạo", phone: "0294976437", timer: "30p" },
];

const mockDetail: DetailOrder[] = [
    {
        id: "d1",
        address: "18/1 Hàn Mặc Tử",
        phone: "0394796437",
        timer: "30p",
        hasImage: true,
        messages: [],
    },
    {
        id: "d2",
        address: "79 trần hưng đạo",
        phone: "0394796437",
        timer: "30p",
        hasImage: false,
        time: "13:55",
        messages: [
            { from: "them", text: "Cho e 2 ly trà sữa lắc trà lài ( 1 ly ngọt nhiều )" },
            { from: "them", text: "Ship qua 405A Nguyễn Huệ nha" },
            { from: "them", text: "0934814300", link: true, avatar: true },
            { from: "me", text: "Dạ, mình bổ sung thêm size ha", name: "Quốc Đạt" },
            { from: "them", text: "Lấy e size M nha chị", avatar: true },
        ],
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
