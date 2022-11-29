import pg from "pg";
import bcrypt from "bcrypt";

const hashStuff = async (pass) => {
    const saltRounds = 12;
    const hash = bcrypt.hashSync(pass, saltRounds);
    return hash;
};

const checkPass = async (pass, hash) => {
    const result = bcrypt.compareSync(pass, hash);
    return result;
};

const pool = new pg.Pool({
    user: "postgres",
    host: "noppa-db",
    database: "Noppasivut",
    password: "kakka",
    port: 5432,
});

const probtext =
    'CREATE TABLE IF NOT EXISTS public."Probs"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "attackskill" integer, "defenceskill" integer, "attackroll" integer, "defenceroll" integer, "result" json, "resultarray" json, "session" varchar(255) NOT NULL)';
const rolltext =
    'CREATE TABLE IF NOT EXISTS public."Rolls"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "attackskill" integer, "defenceskill" integer, "attackroll" integer, "defenceroll" integer, "result" json, "results" json[], "session" varchar(255) NOT NULL)';
const messagetext =
    'CREATE TABLE IF NOT EXISTS public."Messages"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "username" varchar(255) NOT NULL, "message" varchar(1000) NOT NULL, "session" varchar(255) NOT NULL)';
const usertext =
    'CREATE TABLE IF NOT EXISTS public."Users"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "username" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "sessions" text[])';
const sessionsText =
    'CREATE TABLE IF NOT EXISTS public."Sessions"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "name" varchar(255) NOT NULL, "owner" text NOT NULL, "admins" text[], "users" text[], "private" BOOLEAN NOT NULL)';

const createDB = () => {
    pool.query(probtext, (err, res) => {
        console.log(err, res);
    });
    pool.query(rolltext, (err, res) => {
        console.log(err, res);
    });
    pool.query(messagetext, (err, res) => {
        console.log(err, res);
    });
    pool.query(usertext, (err, res) => {
        console.log(err, res);
    });
    pool.query(sessionsText, (err, res) => {
        console.log(err, res);
    });
};

const userListing = async () => {
    const userText = 'SELECT username FROM public."Users"';
    try {
        const res = await pool.query(userText);
        const list = res.rows.map((name) => name.username);
        return list;
    } catch (err) {
        console.log(err);
    }
};

const createUser = async (user, password) => {
    const findText = 'SELECT username FROM public."Users" WHERE username = $1';
    try {
        const res = await pool.query(findText, [user]);
        if (res.rows[0].username) {
            return "Username in use";
        }
    } catch {
        console.log("Name not used");
    }

    const createtext =
        'INSERT INTO public."Users"(username, password) VALUES($1, $2)';
    try {
        const cryptedPass = await hashStuff(password);
        const res = await pool.query(createtext, [user, cryptedPass]);
        console.log(res);
    } catch {
        return "Failed to add user";
    }
    try {
        const createText =
            'INSERT INTO public."Sessions"(name, owner, users, admins, private) VALUES($1, $2, $3, $4, $5)';
        const res = await pool.query(createText, [
            user,
            user,
            [user],
            [user],
            true,
        ]);
        console.log("SESSION", res);
        return "User added";
    } catch (err) {
        console.log(err);
    }
};

const loginCheck = async (user, password) => {
    const logintext = 'SELECT password FROM public."Users" WHERE username = $1';
    if (user === "noppa" || user === "random") {
        return "random";
    }
    try {
        const res = await pool.query(logintext, [user]);
        const check = await checkPass(password, res.rows[0].password);
        console.log(check);
        if (check) {
            return user;
        } else {
            return "wrong password";
        }
    } catch (err) {
        console.log(err);
        return "user does not exist";
    }
};

const readSocks = async (session) => {
    const sessText =
        'SELECT owner, admins, users FROM public."Sessions" WHERE "name" = $1';
    try {
        const res = await pool.query(sessText, [session]);
        if (res.rows.length > 0) {
            return res.rows[0];
        } else {
            return "Default user";
        }
    } catch (err) {
        console.log(err);
    }
};

const sessionList = async (user) => {
    const sessionText =
        'SELECT name, users, owner, private, admins FROM public."Sessions" WHERE $1 = ANY(users)';
    try {
        const res = await pool.query(sessionText, [user]);
        return res.rows;
    } catch (err) {
        console.log(err);
    }
};

const sessionFind = async (session, user) => {
    const findText =
        'SELECT users, private FROM public."Sessions" WHERE "name" = $1';
    const sessionText =
        'UPDATE public."Sessions" SET "users" = $2 WHERE "name" = $1';
    try {
        const userlist = await pool.query(findText, [session]);
        if (userlist.rows[0].private) {
            return "Private session";
        }
        console.log(userlist);
        const Users = userlist.rows[0].users;
        if (!Users.includes(user)) {
            Users.push(user);
        }
        const res = await pool.query(sessionText, [session, Users]);
        if (res) {
            return Users;
        }
    } catch (err) {
        console.log(err);
    }
};

const sessionLeave = async (session, user) => {
    const findText = 'SELECT users FROM public."Sessions" WHERE "name" = $1';
    const sessionText =
        'UPDATE public."Sessions" SET "users" = $2, WHERE "name" = $1';
    try {
        const userlist = await pool.query(findText, [session]);
        const Users = userlist.rows[0].users;
        Users.filter((name) => name !== user);
        const res = await pool.query(sessionText, [session, Users]);
        return res.rows;
    } catch (err) {
        console.log(err);
    }
};

const sessionCreate = async (session, user) => {
    const findText = 'SELECT users FROM public."Sessions" WHERE "name" = $1';
    try {
        const res = await pool.query(findText, [session]);
        if (res.rows.length < 1) {
            const createText =
                'INSERT INTO public."Sessions"(name, owner, users, admins, private) VALUES($1, $2, $3, $4, $5)';
            const sess = await pool.query(createText, [
                session,
                user,
                [user],
                [user],
                false,
            ]);
            console.log("SESSION", sess);
            return "Session added";
        }
        return "Session-name in use";
    } catch (err) {
        console.log(err);
    }
};

const sendMessage = async (mess) => {
    const messtext =
        'INSERT INTO public."Messages"(username, message, session) VALUES($1, $2, $3)';
    try {
        const res = await pool.query(messtext, mess);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readMessages = async (session) => {
    const messtext =
        'SELECT id, time, username, message, session FROM public."Messages" WHERE "session" = $1 ORDER BY id DESC LIMIT 15';
    try {
        const res = await pool.query(messtext, [session]);
        return res.rows;
    } catch (err) {
        console.log(err.stack);
    }
};

const sendProb = async (mess) => {
    const probValues = [
        mess.attackskill,
        mess.defenceskill,
        mess.attackroll,
        mess.defenceroll,
        mess.result,
        mess.resultarray,
        mess.session,
    ];

    let probtext =
        'INSERT INTO public."Probs"(attackskill, defenceskill, attackroll, defenceroll, result, resultarray, session) VALUES($1, $2, $3, $4, $5, $6, $7)';

    if (Number(mess.id) !== 0) {
        probValues.push(Number(mess.id));
        probtext =
            'UPDATE public."Probs" SET "attackskill" = $1, "defenceskill" = $2, "attackroll" = $3, "defenceroll" = $4, "result" = $5, "resultarray" = $6, "session" = $7 WHERE "id" = $8';
    }

    try {
        const res = await pool.query(probtext, probValues);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readProbs = async (session) => {
    const probtext =
        'SELECT id, time, attackskill, defenceskill, attackroll, defenceroll, result, resultarray, session FROM public."Probs" WHERE "session" = $1';
    try {
        const res = await pool.query(probtext, [session]);
        return [session, res.rows];
    } catch (err) {
        console.log(err.stack);
    }
};

const delProb = async (mess) => {
    try {
        const res = await pool.query(
            'DELETE FROM public."Probs" WHERE "id" = $1',
            [mess.id]
        );
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const sendRoll = async (mess) => {
    const rollValues = [
        mess.attackskill,
        mess.defenceskill,
        mess.attackroll,
        mess.defenceroll,
        mess.result,
        mess.results,
        mess.session,
    ];

    let rolltext =
        'INSERT INTO public."Rolls"(attackskill, defenceskill, attackroll, defenceroll, result, results, session) VALUES($1, $2, $3, $4, $5, $6, $7)';

    if (Number(mess.id) !== 0) {
        rollValues.push(Number(mess.id));
        rolltext =
            'UPDATE public."Rolls" SET "attackskill" = $1, "defenceskill" = $2, "attackroll" = $3, "defenceroll" = $4, "result" = $5, "results" = $6, "session" = $7 WHERE "id" = $8';
    }

    try {
        const res = await pool.query(rolltext, rollValues);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readRolls = async (session) => {
    const rolltext =
        'SELECT id, time, attackskill, defenceskill, attackroll, defenceroll, result, results, session FROM public."Rolls" WHERE "session" = $1';
    try {
        const res = await pool.query(rolltext, [session]);
        return [session, res.rows];
    } catch (err) {
        console.log(err.stack);
    }
};

const delRoll = async (mess) => {
    try {
        const res = await pool.query(
            'DELETE FROM public."Rolls" WHERE "id" = $1',
            [mess.id]
        );
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

export {
    sendMessage,
    pool,
    createDB,
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
};
