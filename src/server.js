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
    userListing,
    readSocks,
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
    perMessageDeflate: false,
});

const allUsers = async (sock) => {
    const userlist = await userListing();
    const sockets = await io.fetchSockets();
    const online = sockets.map((so) => so.user);
    const onlineUsers = userlist.map((user) => {
        if (online.includes(user)) {
            return [user, true];
        } else {
            return [user, false];
        }
    });
    sock.emit("all-users", onlineUsers);
    sock.broadcast.emit("all-users", onlineUsers);
};

const loginUser = async (user, pass) => {
    if (user === "noppa" && pass === "noppa") {
        return "noppa";
    } else {
        const res = await loginCheck(user, pass);
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
            sock.join(each.name);
            if ((each.name = user)) {
                sock.emit("join", each.name);
            }
        });

        const allSocks = socketList.map((each) => each.name);
        sock.emit("sessions", allSocks);
        allUsers(sock);
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

    allUsers(socket);

    socket.on("join-session", async (args) => {
        const session = await sessionFind(args, socket.user);
        if (session && session !== "Private session") {
            socket.join(args);
            socket.emit("join", args);
            socket.to(args).emit("users", session);
            socketCheck(socket, socket.user);
        } else {
            socket.emit("join", session.name);
        }
    });

    socket.on("leave-session", async (args) => {
        console.log(args);
        const session = await sessionLeave(args.session, args.user);
        if (session) {
            console.log(session);
            socket.leave(args.session);
            socket.to(args).emit("users", session);
            socketCheck(socket, socket.user);

            if (socket.user !== args.user) {
                socket.to(args.user).emit("kicked", args.session);
            }
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
        // add online check? or add way to check existing invites on join
        socket.to(args.inv).emit("invited-to", [args.session, args.user]);
    });

    socket.on("invite-answer", (args) => {
        socket.to(args[1]).emit("answer", [args[0], socket.user, args[2]]);
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
        const socks = await readSocks(args);

        io.to(args).emit("rolls-back", rolls);
        io.to(args).emit("probs-back", probs);

        if (socks !== "Default user") {
            io.to(args).emit("users", socks);
        }
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
