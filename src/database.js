import pg from "pg";

const pool = new pg.Pool({
    user: "postgres",
    host: "noppa-db",
    database: "Noppasivut",
    password: "kakka",
    port: 5432,
});

const probtext =
    'CREATE TABLE IF NOT EXISTS public."Probs"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "attackskill" integer, "defenceskill" integer, "attackroll" integer, "defenceroll" integer, "result" json, "resultarray" json)';
const rolltext =
    'CREATE TABLE IF NOT EXISTS public."Rolls"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "attackskill" integer, "defenceskill" integer, "attackroll" integer, "defenceroll" integer, "result" json, "results" json[])';
const messagetext =
    'CREATE TABLE IF NOT EXISTS public."Messages"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "message" character(255) NOT NULL)';

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
};

const sendMessage = async (mess) => {
    const messtext = 'INSERT INTO public."Messages"(message) VALUES($1)';
    try {
        const res = await pool.query(messtext, [mess]);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readMessages = async () => {
    const messtext = 'SELECT time, message FROM public."Messages"';
    try {
        const res = await pool.query(messtext);
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
    ];

    let probtext =
        'INSERT INTO public."Probs"(attackskill, defenceskill, attackroll, defenceroll, result, resultarray) VALUES($1, $2, $3, $4, $5, $6)';

    if (Number(mess.id) !== 0) {
        probValues.push(Number(mess.id));
        probtext =
            'UPDATE public."Probs" SET "attackskill" = $1, "defenceskill" = $2, "attackroll" = $3, "defenceroll" = $4, "result" = $5, "resultarray" = $6 WHERE "id" = $7';
    }

    try {
        const res = await pool.query(probtext, probValues);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readProbs = async () => {
    const probtext =
        'SELECT id, time, attackskill, defenceskill, attackroll, defenceroll, result, resultarray FROM public."Probs"';
    try {
        const res = await pool.query(probtext);
        return res.rows;
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
    ];

    let rolltext =
        'INSERT INTO public."Rolls"(attackskill, defenceskill, attackroll, defenceroll, result, results) VALUES($1, $2, $3, $4, $5, $6)';

    if (Number(mess.id) !== 0) {
        rollValues.push(Number(mess.id));
        rolltext =
            'UPDATE public."Rolls" SET "attackskill" = $1, "defenceskill" = $2, "attackroll" = $3, "defenceroll" = $4, "result" = $5, "results" = $6 WHERE "id" = $7';
    }

    try {
        const res = await pool.query(rolltext, rollValues);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readRolls = async () => {
    const rolltext =
        'SELECT id, time, attackskill, defenceskill, attackroll, defenceroll, result, results FROM public."Rolls"';
    try {
        const res = await pool.query(rolltext);
        return res.rows;
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
};
