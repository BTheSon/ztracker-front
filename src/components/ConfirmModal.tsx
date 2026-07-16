import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, confirmText = "Đồng ý", cancelText = "Hủy", isDanger = false, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10"
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
                            <p className="text-stone-500 text-sm leading-relaxed">{message}</p>
                        </div>
                        <div className="flex border-t border-stone-100 bg-stone-50/50">
                            <button onClick={onCancel} className="flex-1 py-4 text-stone-500 font-medium hover:bg-stone-100 transition active:bg-stone-200">
                                {cancelText}
                            </button>
                            <div className="w-[1px] bg-stone-200" />
                            <button onClick={onConfirm} className={`flex-1 py-4 font-bold transition active:bg-stone-200 ${isDanger ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
