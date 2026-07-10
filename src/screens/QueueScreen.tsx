import React from "react";
import { GripVertical } from "lucide-react";
import { Reorder } from "framer-motion";
import { Order } from "../api/orderApi";
import LiveTimer from "../components/LiveTimer";

interface QueueScreenProps {
    queue: Order[];
    onReorder: (queue: Order[]) => void;
}

export default function QueueScreen({ queue, onReorder }: QueueScreenProps) {
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
                                    "bg-white border-b border-stone-200 px-4 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing",
                                    isFirst ? "border-t-2 border-b-2 border-t-emerald-500 border-b-emerald-500" : "",
                                ].join(" ")}
                            >
                                <div>
                                    <div className="text-lg text-stone-800">{item.address}</div>
                                    <div className="text-stone-500 text-sm mt-0.5">{item.phone}</div>
                                </div>
                                <div className="flex items-center gap-3 pointer-events-none">
                                    <span className={isFirst ? "text-blue-600 font-medium" : "text-red-500 font-medium"}>
                                        <LiveTimer createdAt={item.createdAt} />
                                    </span>
                                    <div className="text-stone-400 p-1">
                                        <GripVertical size={20} />
                                    </div>
                                </div>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
                {queue.length === 0 && (
                    <div className="text-center text-stone-400 text-sm py-10">Chưa có đơn trong hàng chờ</div>
                )}
            </div>
        </div>
    );
}
