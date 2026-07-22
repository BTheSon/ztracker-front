import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { address: string; phone: string }) => Promise<void>;
}

function formatPhoneInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0,4)}.${digits.slice(4)}`;
    return `${digits.slice(0,4)}.${digits.slice(4,7)}.${digits.slice(7,10)}`;
}

export default function CreateOrderModal({ isOpen, onClose, onCreate }: CreateOrderModalProps) {
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim() || !phone.trim()) return;
        setLoading(true);
        await onCreate({ address: address.trim(), phone: phone.trim() });
        setLoading(false);
        setAddress('');
        setPhone('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                        className="bg-white rounded-t-3xl shadow-2xl w-full max-w-lg z-10 pb-safe"
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-stone-200"/>
                        </div>

                        <div className="px-5 py-4 flex items-center justify-between border-b border-stone-100">
                            <h3 className="text-lg font-bold text-stone-800">Tạo đơn mới</h3>
                            <button onClick={onClose} className="p-2 text-stone-400 rounded-full hover:bg-stone-100 active:scale-95 transition">
                                <X size={20}/>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-stone-600">Địa chỉ giao hàng</label>
                                <input
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="VD: 18/1 Hàn Mặc Tử"
                                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition text-base"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-stone-600">Số điện thoại</label>
                                <input
                                    value={formatPhoneInput(phone)}
                                    onChange={handlePhoneChange}
                                    placeholder="VD: 0394.796.437"
                                    type="tel"
                                    inputMode="numeric"
                                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition text-base"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !address.trim() || !phone.trim()}
                                className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={20}/>
                                {loading ? 'Đang tạo...' : 'Tạo đơn'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
