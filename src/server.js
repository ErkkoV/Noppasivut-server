import http from "http";
import { Server } from "socket.io";

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    socket.on("testi", (args) => {
        socket.emit("data", `test${args}`);
    });
});

httpServer.listen(8000);
