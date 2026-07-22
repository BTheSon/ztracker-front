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
    raw_text?: string;
}
