import http from "http";
import { Server } from "socket.io";

import { pool, createDB, sendMessage, readMessages } from "./database.js";

pool.connect();
createDB();

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
        sendMessage(args);
        io.to("noppasivu").emit("messages-back", args);
    });
    socket.on("load-messages", async () => {
        const messages = await readMessages();
        io.to("noppasivu").emit("save-messages", messages);
    });
});

httpServer.listen(8000);
