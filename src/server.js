import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import session from "express-session";

import {
    pool,
    createDB,
    sendMessage,
    readMessages,
    readProbs,
    readRolls,
    sendRoll,
    sendProb,
    delRoll,
    delProb,
} from "./database.js";

pool.connect();
createDB();

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
    secret: "nopat",
    resave: false,
    saveUninitialized: false,
});

const io = new Server(httpServer, {
    cors: {
        // origin: "https://noppasivut-fro-prod-noppasivut-s5xa1s.mo5.mogenius.io:3000",
        origin: `http://localhost`,
        // origin: "http://10.69.168.88:3000",
    },
});

const loginUser = (user, pass) => {
    if (user === "noppa" && pass === "noppa") {
        return user;
    } else {
        return "noppa1";
    }
};

const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use((socket, next) => {
    if (
        !socket.request.user ||
        socket.handshake.auth.username !== socket.request.user
    ) {
        socket.request.user = loginUser(
            socket.handshake.auth.username,
            socket.handshake.auth.password
        );
    }
    next();
});

io.on("connection", (socket) => {
    console.log(socket.request.user);
    const session = socket.request.session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();

    socket.join("noppasivu");

    socket.on("probs-front", async (args) => {
        const prob = await sendProb(args);
        if (prob) {
            const probs = await readProbs();
            io.to("noppasivu").emit("probs-back", probs);
        }
    });

    socket.on("rolls-front", async (args) => {
        const roll = await sendRoll(args);
        if (roll) {
            const rolls = await readRolls();
            io.to("noppasivu").emit("rolls-back", rolls);
        }
    });

    socket.on("rolls-front-del", async (args) => {
        const roll = await delRoll(args);
        if (roll) {
            const rolls = await readRolls();
            io.to("noppasivu").emit("rolls-back", rolls);
        }
    });

    socket.on("probs-front-del", async (args) => {
        const prob = await delProb(args);
        if (prob) {
            const probs = await readProbs();
            io.to("noppasivu").emit("probs-back", probs);
        }
    });

    socket.on("load-data", async () => {
        const probs = await readProbs();
        const rolls = await readRolls();
        io.to("noppasivu").emit("rolls-back", rolls);
        io.to("noppasivu").emit("probs-back", probs);
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
