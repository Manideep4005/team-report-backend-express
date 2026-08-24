import http from "http";
import { Server } from "socket.io";

import app from "./app";
import { env } from "./config/env";
import { AuthenticatedSocket, authenticateSocket, registerChatSocketEvents } from "./chat/chat.socket";
import { allowedOrigins } from "./config/cors";

console.log("Process ID:", process.pid);
console.log("Started at:", new Date().toISOString());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

io.use(authenticateSocket);

io.on("connection", (socket) => {
    const authenticatedSocket =
        socket as AuthenticatedSocket;

    console.log(
        `💬 Chat socket connected: ${authenticatedSocket.userName} (${authenticatedSocket.userId})`
    );

    registerChatSocketEvents(
        io,
        authenticatedSocket
    );

    socket.on("disconnect", () => {
        console.log(
            `💬 Chat socket disconnected: ${authenticatedSocket.userName}`
        );
    });
});

httpServer.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
});