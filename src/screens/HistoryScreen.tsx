import { Phone, CheckCircle2, Image as ImageIcon, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Order } from "../db/db";
import LiveTimer from "../components/LiveTimer";

interface HistoryScreenProps {
    isOpen: boolean;
    onClose: () => void;
    history: Order[];
    onCallOrder: (id: string, phone: string, isAlreadyCalled: boolean) => Promise<void>;
    onViewImage: (order: Order) => void;
}

function formatPhone(phone: string) {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0,4)}.${cleaned.slice(4,7)}.${cleaned.slice(7)}`;
    }
    return phone;
}

export default function HistoryScreen({ isOpen, onClose, history, onCallOrder, onViewImage }: HistoryScreenProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-stone-100">
                    {/* Header */}
                    <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
                        <h2 className="text-lg font-bold text-stone-800">Lịch sử gọi</h2>
                        <button onClick={onClose} className="p-2 text-stone-400 rounded-full hover:bg-stone-100 transition">
                            <X size={24} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto pb-safe">
                        {history.length === 0 ? (
                            <div className="text-center text-stone-400 text-sm py-10">Chưa có lịch sử gọi</div>
                        ) : (
                            <div className="flex flex-col">
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border-b border-stone-200 px-4 py-3 flex items-center justify-between bg-white"
                                    >
                                        <div className="flex items-center gap-2 mr-3 flex-shrink-0">
                                            <button
                                                onClick={() => onCallOrder(item.id, item.phone, true)}
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90 cursor-pointer pointer-events-auto bg-stone-300 hover:bg-stone-400"
                                                title="Gọi lại"
                                            >
                                                <Phone size={18} />
                                            </button>
                                            {(item.img_url || item.raw_text) && (
                                                <button
                                                    onClick={() => onViewImage(item)}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 shadow-md transition active:scale-90 cursor-pointer pointer-events-auto bg-stone-100 hover:bg-stone-200 border border-stone-200"
                                                    title="Xem nội dung"
                                                >
                                                    <ImageIcon size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="text-base text-stone-800 font-medium flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-stone-400 flex-shrink-0" />
                                                <span className="text-stone-700 truncate">{item.address}</span>
                                            </div>
                                            <div className="text-stone-500 text-sm mt-0.5 pl-6">{formatPhone(item.phone)}</div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className="text-stone-400 font-medium text-xs">
                                                    <LiveTimer createdAt={item.createdAt} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
