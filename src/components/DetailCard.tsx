import React from "react";
import { Phone, Pencil, CornerUpLeft } from "lucide-react";
import EditForm from "./EditForm";
import { DetailOrder } from "../api/orderApi";
import { useDetailCard } from "../hooks/useDetailCard";
import LiveTimer from "./LiveTimer";

interface DetailCardProps {
    order: DetailOrder;
    onMoveToQueue: (order: DetailOrder) => void;
    onSave: (updated: DetailOrder) => void;
}

export default function DetailCard({ order, onMoveToQueue, onSave }: DetailCardProps) {
    const { editing, setEditing, current, handleSave } = useDetailCard(order, onSave);

    return (
        <div className="bg-white border-b border-stone-200">
            <div className="px-4 pt-4 pb-2 flex items-start justify-between">
                <div className="font-bold text-lg text-stone-800">{current.address}</div>
                <span className="text-red-500 font-medium text-sm">
                    <LiveTimer createdAt={current.createdAt} />
                </span>
            </div>
            <div className="px-4 pb-3 text-stone-500 text-sm flex items-center justify-between">
                <span>{current.phone}</span>
                {current.time && <span className="text-xs text-stone-400">{current.time}</span>}
            </div>

            {current.img_url && (
                <div className="px-4 pb-4">
                    <img 
                        src={current.img_url} 
                        alt="Hóa đơn" 
                        className="w-full h-auto object-cover rounded-lg border border-stone-200"
                        loading="lazy"
                    />
                </div>
            )}

            {editing ? (
                <EditForm
                    order={current}
                    onCancel={() => setEditing(false)}
                    onSave={handleSave}
                />
            ) : (
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditing(true)}
                            className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-100"
                            title="Sửa số điện thoại và địa chỉ"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => onMoveToQueue(current)}
                            className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-100"
                            title="Đưa đơn vào hàng chờ"
                        >
                            <CornerUpLeft size={16} />
                        </button>
                    </div>
                    <a
                        href={`tel:${current.phone}`}
                        className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600"
                        title={`Gọi ${current.phone}`}
                    >
                        <Phone size={18} />
                    </a>
                </div>
            )}
        </div>
    );
}
