import { useState } from "react";
import { DetailOrder } from "../api/orderApi";

export function useDetailCard(order: DetailOrder, onSave: (updated: DetailOrder) => void) {
    const [editing, setEditing] = useState(false);
    const [current, setCurrent] = useState<DetailOrder>(order);

    const handleSave = (vals: { address: string; phone: string }) => {
        const updated = { ...current, ...vals };
        setCurrent(updated);
        onSave(updated);
        setEditing(false);
    };

    return {
        editing,
        setEditing,
        current,
        handleSave
    };
}
