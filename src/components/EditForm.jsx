import React, { useState } from "react";
import { X, Check } from "lucide-react";

export default function EditForm({ order, onCancel, onSave }) {
    const [address, setAddress] = useState(order.address);
    const [phone, setPhone] = useState(order.phone);
    return (
        <div className="px-4 pb-4 space-y-2 bg-amber-50/60 border-t border-amber-200">
            <div className="pt-3">
                <label className="text-xs font-medium text-stone-500">Địa chỉ</label>
                <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full mt-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
            </div>
            <div>
                <label className="text-xs font-medium text-stone-500">Số điện thoại</label>
                <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
            </div>
            <div className="flex justify-end gap-2 pt-1">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200"
                >
                    <X size={14} /> Huỷ
                </button>
                <button
                    onClick={() => onSave({ address, phone })}
                    className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                >
                    <Check size={14} /> Lưu
                </button>
            </div>
        </div>
    );
}
