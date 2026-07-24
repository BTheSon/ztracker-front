
import { GripVertical, Phone, CheckCircle2, CornerDownLeft, Image as ImageIcon } from "lucide-react";
import { Reorder } from "framer-motion";
import { Order } from "../db/db";
import LiveTimer from "../components/LiveTimer";

interface QueueScreenProps {
    queue: Order[];
    calledQueue: Order[];
    onReorder: (queue: Order[]) => void;
    onCallOrder: (id: string, phone: string, isAlreadyCalled: boolean) => Promise<void>;
    onMoveToDetail: (id: string) => void;
    onViewImage?: (order: Order) => void;
}

function formatPhone(phone: string) {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0,4)}.${cleaned.slice(4,7)}.${cleaned.slice(7)}`;
    }
    return phone;
}

export default function QueueScreen({ queue, calledQueue, onReorder, onCallOrder, onMoveToDetail, onViewImage }: QueueScreenProps) {
    return (
        <div className="flex flex-col h-full bg-stone-100">
            <div className="flex-1 overflow-y-auto pb-32">
                <Reorder.Group axis="y" values={queue} onReorder={onReorder} className="flex flex-col">
                    {queue.map((item, idx) => {
                        const isFirst = idx === 0;
                        return (
                            <Reorder.Item
                                key={item.id}
                                value={item}
                                className={[
                                    "border-b border-stone-200 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing bg-white",
                                    isFirst ? "border-t-2 border-b-2 border-t-emerald-500 border-b-emerald-500" : "",
                                ].join(" ")}
                            >
                                <div className="flex items-center gap-2 mr-3 flex-shrink-0">
                                    <div className="text-stone-300 p-1 pointer-events-auto cursor-grab active:cursor-grabbing">
                                        <GripVertical size={20} />
                                    </div>
                                    <button
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={() => onCallOrder(item.id, item.phone, false)}
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90 cursor-pointer pointer-events-auto bg-emerald-500 hover:bg-emerald-600 flex-shrink-0"
                                        title="Gọi điện"
                                    >
                                        <Phone size={18} />
                                    </button>
                                    {(item.img_url || item.raw_text) && onViewImage && (
                                        <button
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onClick={() => onViewImage(item)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-emerald-600 shadow-md transition active:scale-90 cursor-pointer pointer-events-auto bg-emerald-50 hover:bg-emerald-100 flex-shrink-0 border border-emerald-200"
                                            title="Xem nội dung"
                                        >
                                            <ImageIcon size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-base text-stone-800 font-semibold truncate">{item.address}</div>
                                    <div className="text-stone-400 text-sm mt-0.5">{formatPhone(item.phone)}</div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className={isFirst ? "text-emerald-600 font-medium text-xs" : "text-stone-400 font-medium text-xs"}>
                                            <LiveTimer createdAt={item.createdAt} />
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onClick={() => onMoveToDetail(item.id)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 border border-stone-200 bg-white hover:bg-stone-50 transition active:scale-90"
                                                title="Chuyển về Chi tiết"
                                            >
                                                <CornerDownLeft size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
                
                {queue.length === 0 && calledQueue.length === 0 && (
                    <div className="text-center text-stone-400 text-sm py-10">Chưa có đơn trong hàng chờ</div>
                )}

                {calledQueue.length > 0 && (
                    <div className="mt-4">
                        <div className="px-4 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wider bg-stone-200/50">
                            Đơn đã gọi
                        </div>
                        <div className="flex flex-col border-t border-stone-200">
                            {calledQueue.map((item) => (
                                <div
                                    key={item.id}
                                    className="border-b border-stone-200 px-4 py-3 flex items-center justify-between bg-stone-100/70 opacity-75 grayscale-[20%]"
                                >
                                    <div className="flex items-center gap-2 mr-3 flex-shrink-0">
                                        <button
                                            onClick={() => onCallOrder(item.id, item.phone, true)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition active:scale-90 cursor-pointer pointer-events-auto bg-stone-300 hover:bg-stone-400"
                                            title="Gọi lại"
                                        >
                                            <Phone size={18} />
                                        </button>
                                        {(item.img_url || item.raw_text) && onViewImage && (
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
                                            <span className="line-through text-stone-500 truncate">{item.address}</span>
                                        </div>
                                        <div className="text-stone-400 text-sm mt-0.5 pl-6">{formatPhone(item.phone)}</div>
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
                    </div>
                )}
            </div>
        </div>
    );
}
