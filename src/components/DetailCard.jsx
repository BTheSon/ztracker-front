import React, { useState } from "react";
import { Phone, Pencil, CornerUpLeft } from "lucide-react";
import ReceiptPlaceholder from "./ReceiptPlaceholder";
import EditForm from "./EditForm";

export default function DetailCard({ order, onMoveToQueue, onSave }) {
    const [editing, setEditing] = useState(false);
    const [current, setCurrent] = useState(order);

    return (
        <div className="bg-white border-b border-stone-200">
            <div className="px-4 pt-4 pb-2 flex items-start justify-between">
                <div className="font-bold text-lg text-stone-800">{current.address}</div>
                <span className="text-red-500 font-medium text-sm">{current.timer}</span>
            </div>
            <div className="px-4 pb-3 text-stone-500 text-sm">{current.phone}</div>

            {current.hasImage && <ReceiptPlaceholder />}

            {current.messages && current.messages.length > 0 && (
                <div className="px-4 py-3 space-y-2">
                    {current.time && <div className="text-center text-xs text-stone-400 mb-1">{current.time}</div>}
                    {current.messages.map((m, i) =>
                        m.from === "me" ? (
                            <div key={i} className="flex flex-col items-end">
                                {m.name && <div className="text-xs text-stone-400 mb-0.5">{m.name}</div>}
                                <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%] text-sm">
                                    {m.text}
                                </div>
                            </div>
                        ) : (
                            <div key={i} className="flex items-end gap-2">
                                {m.avatar && (
                                    <div className="w-7 h-7 rounded-full bg-stone-300 flex-shrink-0" title="avatar" />
                                )}
                                <div
                                    className={[
                                        "bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] text-sm text-stone-800",
                                        m.link ? "underline text-blue-600" : "",
                                    ].join(" ")}
                                >
                                    {m.text}
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {editing ? (
                <EditForm
                    order={current}
                    onCancel={() => setEditing(false)}
                    onSave={(vals) => {
                        const updated = { ...current, ...vals };
                        setCurrent(updated);
                        onSave(updated);
                        setEditing(false);
                    }}
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
