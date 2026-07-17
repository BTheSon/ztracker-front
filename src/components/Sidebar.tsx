import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Download, Trash2, RotateCcw, X } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestNotification: () => void;
    onDownload: () => void;
    isInstallable: boolean;
    onClearHistory: () => void;
    onReset: () => void;
}

export default function Sidebar({ isOpen, onClose, onRequestNotification, onDownload, isInstallable, onClearHistory, onReset }: SidebarProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]" onClick={onClose}
                    />
                    <motion.div 
                        initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl z-[90] flex flex-col"
                    >
                        <div className="p-5 flex items-center justify-between border-b border-stone-100 bg-emerald-50/50">
                            <h2 className="text-lg font-bold text-emerald-600">ZTracker Menu</h2>
                            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200 active:scale-95 transition">
                                <X size={20}/>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto py-3 space-y-1">
                            <button onClick={() => { onClose(); onRequestNotification(); }} className="w-full flex items-center gap-4 px-6 py-4 text-left text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition">
                                <Bell size={22} className="text-emerald-500"/>
                                <span className="font-medium">Bật thông báo</span>
                            </button>
                            
                            {isInstallable && (
                                <button onClick={() => { onClose(); onDownload(); }} className="w-full flex items-center gap-4 px-6 py-4 text-left text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition">
                                    <Download size={22} className="text-emerald-500"/>
                                    <span className="font-medium">Cài đặt ứng dụng</span>
                                </button>
                            )}

                            <div className="my-2 border-t border-stone-100 mx-4" />

                            <button onClick={() => { onClose(); onClearHistory(); }} className="w-full flex items-center gap-4 px-6 py-4 text-left text-stone-700 hover:bg-orange-50 active:bg-orange-100 transition">
                                <Trash2 size={22} className="text-orange-500"/>
                                <span className="font-medium">Dọn dẹp đơn đã gọi</span>
                            </button>
                            
                            <button onClick={() => { onClose(); onReset(); }} className="w-full flex items-center gap-4 px-6 py-4 text-left text-red-600 hover:bg-red-50 active:bg-red-100 transition mt-auto">
                                <RotateCcw size={22} className="text-red-500"/>
                                <span className="font-medium">Xóa trắng dữ liệu</span>
                            </button>
                        </div>
                        
                        <div className="p-4 text-center text-xs font-medium text-stone-400 border-t border-stone-100 bg-stone-50">
                            Phiên bản 1.0 (Offline-First)
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
