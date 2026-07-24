import React from "react";
import { Phone, Pencil, CornerUpLeft, Check, X, Trash2 } from "lucide-react";
import { DetailOrder } from "../types/order";
import { useDetailCard } from "../hooks/useDetailCard";
import LiveTimer from "./LiveTimer";

interface DetailCardProps {
    order: DetailOrder;
    onMoveToQueue: (order: DetailOrder) => void;
    onSave: (updated: DetailOrder) => void;
    onDelete: (id: string) => void;
    onCall?: (phone: string) => void;
}

function formatPhone(phone: string) {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0,4)}.${cleaned.slice(4,7)}.${cleaned.slice(7)}`;
    }
    return phone;
}

// Format phone for input display: insert dots but let user type naturally
function formatPhoneInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0,4)}.${digits.slice(4)}`;
    return `${digits.slice(0,4)}.${digits.slice(4,7)}.${digits.slice(7,10)}`;
}

function unformatPhone(formatted: string): string {
    return formatted.replace(/\D/g, '');
}

export default function DetailCard({ order, onMoveToQueue, onSave, onDelete, onCall }: DetailCardProps) {
    const { 
        editing, startEditing, cancelEditing, current, 
        editAddress, setEditAddress, editPhone, setEditPhone, handleSave 
    } = useDetailCard(order, onSave);

    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawDigits = unformatPhone(e.target.value);
        setEditPhone(rawDigits);
    };

    return (
        <div className="bg-white border-b border-stone-200">
            <div className="px-4 pt-4 pb-2 flex items-start justify-between">
                {editing ? (
                    <input 
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        className="font-bold text-lg text-stone-800 border-b-2 border-emerald-400 focus:outline-none w-full mr-4 bg-emerald-50/50 px-1 py-0.5 rounded-t-sm transition-colors"
                        autoFocus
                    />
                ) : (
                    <div className="font-bold text-lg text-stone-800">{current.address}</div>
                )}
                <span className="text-red-500 font-medium text-sm flex-shrink-0">
                    <LiveTimer createdAt={current.createdAt} />
                </span>
            </div>
            
            <div className="px-4 pb-3 text-stone-500 text-sm flex items-center justify-between">
                {editing ? (
                    <input 
                        value={formatPhoneInput(editPhone)}
                        onChange={handlePhoneInputChange}
                        className="text-sm text-stone-800 border-b-2 border-emerald-400 focus:outline-none w-full mr-4 bg-emerald-50/50 px-1 py-0.5 rounded-t-sm transition-colors"
                        type="tel"
                        inputMode="numeric"
                    />
                ) : (
                    <span>{formatPhone(current.phone)}</span>
                )}
                {current.time && !editing && <span className="text-xs text-stone-400 flex-shrink-0">{current.time}</span>}
            </div>

            {(current.img_url || current.raw_text) && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                    {current.img_url && (
                        <img 
                            src={current.img_url} 
                            alt="Hóa đơn" 
                            className="w-full h-auto object-cover rounded-lg border border-stone-200"
                            loading="lazy"
                        />
                    )}
                    {current.raw_text && (
                        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Nội dung gốc</p>
                            <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{current.raw_text}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="px-4 py-3 flex items-center justify-between">
                {editing ? (
                    <div className="flex items-center gap-3 w-full justify-end">
                        <button
                            onClick={cancelEditing}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 font-medium text-sm transition active:scale-95"
                        >
                            <X size={16} /> Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 font-medium text-sm shadow-sm transition active:scale-95"
                        >
                            <Check size={16} /> Lưu
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => onCall ? onCall(current.phone) : window.location.href = `tel:${current.phone}`}
                            className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition active:scale-90"
                            title={`Gọi ${formatPhone(current.phone)}`}
                        >
                            <Phone size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={startEditing}
                                className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition active:scale-90 shadow-sm"
                                title="Sửa thông tin"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => onMoveToQueue(current)}
                                className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition active:scale-90 shadow-sm"
                                title="Đưa đơn vào hàng chờ"
                            >
                                <CornerUpLeft size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm("Bạn có chắc muốn xóa đơn này?")) {
                                        onDelete(current.id);
                                    }
                                }}
                                className="w-10 h-10 rounded-full border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition active:scale-90 shadow-sm ml-2"
                                title="Xóa đơn hàng"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
