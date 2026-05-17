import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

export function initSocket(server: http.Server) {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        console.log("[WS] client connected:", socket.id);
    });

    return io;
}

export function getIO() {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
}