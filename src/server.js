import http from "http";
import { Server } from "socket.io";

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    socket.on("probs-front", (args) => {
        socket.emit("probs-back", args);
    });
    socket.on("rolls-front", (args) => {
        socket.emit("rolls-back", args);
    });
});

httpServer.listen(8000);
