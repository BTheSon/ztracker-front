import { io } from "socket.io-client";
import { BASE_URL } from "../config";

export interface IRealtimeClient {
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback?: (...args: any[]) => void): void;
    connect(): void;
    disconnect(): void;
}

export function createRealtimeClient(): IRealtimeClient {
    const socket = io(BASE_URL, {
        autoConnect: false,            // Không tự động kết nối ngay
        transports: ['websocket'],     // Bỏ qua HTTP long-polling, dùng thẳng WebSocket
        reconnectionDelay: 2000,       // Chờ 2s trước khi reconnect
    });
    
    return {
        on: (event, callback) => {
            socket.on(event, callback);
        },
        off: (event, callback) => {
            if (callback) {
                socket.off(event, callback);
            } else {
                socket.off(event);
            }
        },
        connect: () => {
            if (!socket.connected) {
                socket.connect();
            }
        },
        disconnect: () => {
            socket.disconnect();
        }
    };
}
