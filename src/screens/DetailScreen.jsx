import React from "react";
import DetailCard from "../components/DetailCard";

export default function DetailScreen({ orders, onMoveToQueue, onSave }) {
    return (
        <div className="flex flex-col h-full bg-stone-100 overflow-y-auto pb-32">
            {orders.map((o) => (
                <DetailCard key={o.id} order={o} onMoveToQueue={onMoveToQueue} onSave={onSave} />
            ))}
            {orders.length === 0 && (
                <div className="text-center text-stone-400 text-sm py-10">Không còn đơn nào</div>
            )}
        </div>
    );
}
