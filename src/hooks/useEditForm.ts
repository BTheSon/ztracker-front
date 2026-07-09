import { useState } from "react";
import { DetailOrder } from "../api/orderApi";

export function useEditForm(order: DetailOrder, onSave: (vals: { address: string; phone: string }) => void) {
    const [address, setAddress] = useState(order.address);
    const [phone, setPhone] = useState(order.phone);

    const submit = () => {
        onSave({ address, phone });
    };

    return {
        address,
        setAddress,
        phone,
        setPhone,
        submit
    };
}
