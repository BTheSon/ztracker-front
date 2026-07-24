import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    img_url?: string;
    raw_text?: string;
}

export default function ImageModal({ isOpen, onClose, img_url, raw_text }: ImageModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!img_url && !raw_text) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0" onClick={onClose}
                    />
                    
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-black/50 rounded-full transition active:scale-95"
                    >
                        <X size={24}/>
                    </button>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
                    >
                        {img_url && (
                            <div className="w-full h-full pointer-events-auto flex items-center justify-center overflow-auto p-4">
                                <img 
                                    src={img_url} 
                                    alt="Hóa đơn" 
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg"
                                />
                            </div>
                        )}
                        {raw_text && (
                            <div className="w-full pointer-events-auto mt-4 px-4">
                                <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 shadow-xl max-h-[40vh] overflow-y-auto">
                                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Nội dung gốc</p>
                                    <p className="text-sm text-stone-200 whitespace-pre-wrap leading-relaxed">{raw_text}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
