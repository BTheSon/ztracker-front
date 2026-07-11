import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../config";

export function createSocket(): Socket {
    return io(BASE_URL);
}
