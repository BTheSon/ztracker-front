
import DetailCard from "../components/DetailCard";
import { DetailOrder } from "../types/order";

interface DetailScreenProps {
    orders: DetailOrder[];
    onMoveToQueue: (order: DetailOrder) => void;
    onSave: (updated: DetailOrder) => void;
    onDelete: (id: string) => void;
}

export default function DetailScreen({ orders, onMoveToQueue, onSave, onDelete }: DetailScreenProps) {
    return (
        <div className="flex flex-col h-full bg-stone-100 overflow-y-auto pb-32">
            {orders.map((o) => (
                <DetailCard key={o.id} order={o} onMoveToQueue={onMoveToQueue} onSave={onSave} onDelete={onDelete} />
            ))}
            {orders.length === 0 && (
                <div className="text-center text-stone-400 text-sm py-10">Không còn đơn nào</div>
            )}
        </div>
    );
}
