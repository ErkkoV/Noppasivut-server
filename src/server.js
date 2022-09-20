import http from "http";
import { Server } from "socket.io";

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://10.201.204.39:3000",
        // origin: "http://10.69.168.88:3000",
    },
});

io.on("connection", (socket) => {
    socket.join("noppasivu");

    socket.on("probs-front", (args) => {
        io.to("noppasivu").emit("probs-back", args);
    });
    socket.on("rolls-front", (args) => {
        io.to("noppasivu").emit("rolls-back", args);
    });
    socket.on("messages-front", (args) => {
        io.to("noppasivu").emit("messages-back", args);
    });
});

httpServer.listen(8000);
