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
    loginCheck,
    createUser,
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

const loginUser = async (user, pass) => {
    console.log(user, pass);
    if (user === "noppa" && pass === "noppa") {
        return "noppa";
    } else {
        const res = await loginCheck(user, pass);
        console.log(res);
        if (res === "wrong password") {
            return "random";
        } else if (res === "user does not exist") {
            return "random";
        } else {
            return res;
        }
    }
};

const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(async (socket, next) => {
    const user = await socket.user;
    if (!user || socket.handshake.auth.username !== user) {
        socket.user = await loginUser(
            socket.handshake.auth.username,
            socket.handshake.auth.password
        );
    }
    if (socket.user === "random") {
        socket.emit("create-back", "Login failed");
    }
    if (socket.user !== "noppa" && socket.user !== "random") {
        socket.emit("create-back", "Login succeeded");
    }

    console.log(socket.user);
    next();
});

io.on("connection", (socket) => {
    const session = socket.request.session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();

    socket.join("noppasivu");

    socket.on("create-user", async (args) => {
        const user = await createUser(args.username, args.password);
        if (user) {
            socket.emit("create-back", user);
        }
    });
    socket.on("probs-front", async (args) => {
        console.log(socket.user);
        console.log(socket.id);
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
