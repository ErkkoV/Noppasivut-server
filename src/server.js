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
    sessionList,
    sessionFind,
    sessionLeave,
    sessionCreate,
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
        // origin: `http://10.201.204.40`,
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

const socketCheck = async (sock, user) => {
    const socketList = await sessionList(user);
    if (socketList) {
        socketList.forEach(async (each) => {
            console.log(each);
            sock.join(each.name);
            sock.emit("join", each.name);
            sock.emit("users", each.users);
            sock.emit("owner", each.owner);
            sock.emit("admins", each.admins);
            sock.emit("private", each.private);
        });
        const allSocks = socketList.map((each) => each.name);
        sock.emit("sessions", allSocks);
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
    next();
});

io.on("connection", (socket) => {
    const session = socket.request.session;
    session.socketId = socket.id;
    session.save();

    socket.emit("user", socket.user);

    if (socket.user !== "noppa" && socket.user !== "random") {
        socketCheck(socket, socket.user);
    }

    socket.on("join-session", async (args) => {
        console.log("Joining", args);
        const session = await sessionFind(args, socket.user);
        if (session && session !== "Private session") {
            console.log(session);
            socket.join(args);
            socket.emit("join", args);
            socket.to(args).emit("users", session);
            socketCheck(socket, socket.user);
        } else {
            socket.emit("join", session);
        }
    });

    socket.on("leave-session", async (args) => {
        const session = await sessionLeave(args, socket.user);
        if (session) {
            socket.leave(args);
            socket.to(args).emit("users", session);
        }
    });

    socket.on("create-session", async (args) => {
        const session = await sessionCreate(args, socket.user);
        socket.emit("add-session", session);
        if (session === "Session added") {
            socketCheck(socket, socket.user);
        }
    });

    socket.on("invite", (args) => {
        // add a check if arg.inv exists
        socket.to(args.inv).emit("invited-to", [args.session, args.user]);
    });

    socket.on("create-user", async (args) => {
        const user = await createUser(args.username, args.password);
        if (user) {
            socket.emit("create-back", user);
        }
    });

    socket.on("probs-front", async (args) => {
        const prob = await sendProb(args[1]);
        if (prob) {
            const probs = await readProbs(args[0]);
            io.to(args[0]).emit("probs-back", probs);
        }
    });

    socket.on("rolls-front", async (args) => {
        const roll = await sendRoll(args[1]);
        if (roll) {
            const rolls = await readRolls(args[0]);
            io.to(args[0]).emit("rolls-back", rolls);
        }
    });

    socket.on("rolls-front-del", async (args) => {
        const roll = await delRoll(args[1]);
        if (roll) {
            const rolls = await readRolls(args[0]);
            io.to(args[0]).emit("rolls-back", rolls);
        }
    });

    socket.on("probs-front-del", async (args) => {
        const prob = await delProb(args[1]);
        if (prob) {
            const probs = await readProbs(args[0]);
            io.to(args[0]).emit("probs-back", probs);
        }
    });

    socket.on("load-data", async (args) => {
        const probs = await readProbs(args);
        const rolls = await readRolls(args);
        io.to(args).emit("rolls-back", rolls);
        io.to(args).emit("probs-back", probs);
    });

    socket.on("messages-front", async (args) => {
        const message = await sendMessage(args[1]);
        if (message) {
            const messages = await readMessages(args[0]);
            io.to(args[0]).emit("messages-back", messages);
        }
    });

    socket.on("load-messages", async (args) => {
        const messages = await readMessages(args);
        if (messages) {
            io.to(args).emit("messages-back", messages);
        }
    });
});

httpServer.listen(8000);
