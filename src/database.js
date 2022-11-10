import pg from "pg";

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "Noppasivut",
    password: "kakka",
    port: 5433,
});

const probtext =
    'CREATE TABLE IF NOT EXISTS public."Probs"("id" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "attackskill" integer, "defenceskill" integer, "attackroll" integer, "defenceroll" integer, "result" json, "results" json[])';
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
    const probtext =
        'INSERT INTO public."Probs"(attackskill, defenceskill, attackroll, defenceroll, result, results) VALUES($1, $2, $3, $4, $5, $6)';
    try {
        const res = await pool.query(probtext, [
            mess[0].attackskill,
            mess[0].defenceskill,
            mess[0].attackroll,
            mess[0].defenceroll,
            mess[0].result,
            mess[0].results,
        ]);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readProbs = async () => {
    const probtext =
        'SELECT id, time, attackskill, defenceskill, attackroll, defenceroll, result, results FROM public."Probs"';
    try {
        const res = await pool.query(probtext);
        return res.rows;
    } catch (err) {
        console.log(err.stack);
    }
};

const sendRoll = async (mess) => {
    const rolltext =
        'INSERT INTO public."Rolls"(attackskill, defenceskill, attackroll, defenceroll, result, results) VALUES($1, $2, $3, $4, $5, $6)';
    try {
        const res = await pool.query(rolltext, [
            mess[0].attackskill,
            mess[0].defenceskill,
            mess[0].attackroll,
            mess[0].defenceroll,
            mess[0].result,
            mess[0].results,
        ]);
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
        console.log(res);
        return res.rows;
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
};
