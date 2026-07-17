import { useState, useEffect } from "react";

interface LiveTimerProps {
    createdAt: string;
}

export default function LiveTimer({ createdAt }: LiveTimerProps) {
    const [elapsed, setElapsed] = useState("");

    useEffect(() => {
        const calculate = () => {
            const diff = Date.now() - new Date(createdAt).getTime();
            const minutes = Math.floor(diff / 60000);
            if (minutes < 1) return "Vừa xong";
            if (minutes < 60) return `${minutes}p`;
            const hours = Math.floor(minutes / 60);
            return `${hours}h ${minutes % 60}p`;
        };

        setElapsed(calculate());
        const interval = setInterval(() => {
            setElapsed(calculate());
        }, 30000); // Cập nhật mỗi 30s để đảm bảo thời gian chạy mượt

        return () => clearInterval(interval);
    }, [createdAt]);

    return <span>{elapsed}</span>;
}
