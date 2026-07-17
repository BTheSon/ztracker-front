import { useState } from "react";
import { DetailOrder } from "../types/order";

export function useDetailCard(order: DetailOrder, onSave: (updated: DetailOrder) => void) {
    const [editing, setEditing] = useState(false);
    const [current, setCurrent] = useState<DetailOrder>(order);
    
    const [editAddress, setEditAddress] = useState(order.address);
    const [editPhone, setEditPhone] = useState(order.phone);

    const startEditing = () => {
        setEditAddress(current.address);
        setEditPhone(current.phone);
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
    };

    const handleSave = () => {
        const updated = { ...current, address: editAddress, phone: editPhone };
        setCurrent(updated);
        onSave(updated);
        setEditing(false);
    };

    return {
        editing,
        startEditing,
        cancelEditing,
        current,
        editAddress,
        setEditAddress,
        editPhone,
        setEditPhone,
        handleSave
    };
}
