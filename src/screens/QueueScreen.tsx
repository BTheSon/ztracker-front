import React from "react";
import { GripVertical, Phone, CheckCircle2 } from "lucide-react";
import { Reorder } from "framer-motion";
import { Order } from "../api/orderApi";
import LiveTimer from "../components/LiveTimer";

interface QueueScreenProps {
    queue: Order[];
    calledQueue: Order[];
    onReorder: (queue: Order[]) => void;
    onCallOrder: (id: string, isAlreadyCalled: boolean) => void;
}

export default function QueueScreen({ queue, calledQueue, onReorder, onCallOrder }: QueueScreenProps) {
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
                                    "border-b border-stone-200 px-4 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing bg-white",
                                    isFirst ? "border-t-2 border-b-2 border-t-emerald-500 border-b-emerald-500" : "",
                                ].join(" ")}
                            >
                                <div className="flex-1">
                                    <div className="text-lg text-stone-800 font-medium flex items-center gap-2">
                                        <span>{item.address}</span>
                                    </div>
                                    <div className="text-stone-500 text-sm mt-0.5">{item.phone}</div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={isFirst ? "text-emerald-600 font-medium" : "text-stone-500 font-medium"}>
                                            <LiveTimer createdAt={item.createdAt} />
                                        </span>
                                        <a
                                            href={`tel:${item.phone}`}
                                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
                                            onClick={() => onCallOrder(item.id, false)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition active:scale-90 cursor-pointer pointer-events-auto bg-emerald-500 hover:bg-emerald-600"
                                            title="Gọi điện"
                                        >
                                            <Phone size={14} />
                                        </a>
                                    </div>
                                    
                                    <div className="text-stone-400 p-1 pointer-events-auto">
                                        <GripVertical size={20} />
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
                                    className="border-b border-stone-200 px-4 py-4 flex items-center justify-between bg-stone-100/70 opacity-75 grayscale-[20%]"
                                >
                                    <div className="flex-1">
                                        <div className="text-lg text-stone-800 font-medium flex items-center gap-2">
                                            <CheckCircle2 size={18} className="text-stone-400" />
                                            <span className="line-through text-stone-500">{item.address}</span>
                                        </div>
                                        <div className="text-stone-500 text-sm mt-0.5">{item.phone}</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-stone-500 font-medium">
                                                <LiveTimer createdAt={item.createdAt} />
                                            </span>
                                            <a
                                                href={`tel:${item.phone}`}
                                                onClick={() => onCallOrder(item.id, true)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition active:scale-90 cursor-pointer pointer-events-auto bg-stone-300"
                                                title="Gọi lại"
                                            >
                                                <Phone size={14} />
                                            </a>
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
