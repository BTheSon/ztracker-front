import { io } from "socket.io-client";
import { BASE_URL } from "../config";

export interface IRealtimeClient {
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback?: (...args: any[]) => void): void;
    connect(): void;
    disconnect(): void;
}

export function createRealtimeClient(): IRealtimeClient {
    const socket = io(BASE_URL);
    
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
