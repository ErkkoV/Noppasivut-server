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

    socket.on("probs-front", async (args) => {
        const probs = await readProbs(args);
        if (probs) {
            io.to("noppasivu").emit("probs-back", probs);
        }
    });

    socket.on("rolls-front", async (args) => {
        const rolls = await readRolls();
        if (rolls) {
            io.to("noppasivu").emit("rolls-back", rolls);
        }
    });

    socket.on("messages-front", async (args) => {
        const message = await sendMessage(args);
        if (message) {
            const messages = await readMessages();
            io.to("noppasivu").emit("messages-back", messages);
        }
    });

    socket.on("load-messages", async () => {
        const messages = await readMessages();
        io.to("noppasivu").emit("save-messages", messages);
    });
});

httpServer.listen(8000);
