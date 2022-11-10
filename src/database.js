import pg from "pg";

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "Noppasivut",
    password: "kakka",
    port: 5433,
});

const probtext =
    'CREATE TABLE IF NOT EXISTS public."Probs"("ID" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default, "AttackSkill" integer,"DefenceSkill" integer,"AttackRoll" integer,"DefenceRoll" integer,"Results" json[])';
const rolltext =
    'CREATE TABLE IF NOT EXISTS public."Rolls"("ID" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default, "AttackSkill" integer,"DefenceSkill" integer,"AttackRoll" integer,"DefenceRoll" integer,"Results" json[])';
const messagetext =
    'CREATE TABLE IF NOT EXISTS public."Messages"("ID" SERIAL NOT NULL PRIMARY KEY, "time" timestamp without time zone default CURRENT_TIMESTAMP NOT NULL, "message" character(255) NOT NULL)';

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
        'INSERT INTO public."Probs"(AttackSkill, DefenceSkill, AttackRoll, DefenceRoll, Results) VALUES($1)';
    try {
        const res = await pool.query(probtext, [mess]);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readProbs = async () => {
    const probtext =
        'SELECT ID, time, AttackSkill, DefenceSkill, AttackRoll, DefenceRoll, Results FROM public."Probs"';
    try {
        const res = await pool.query(probtext);
        return res.rows;
    } catch (err) {
        console.log(err.stack);
    }
};

const sendRoll = async (mess) => {
    const rolltext =
        'INSERT INTO public."Rolls"(AttackSkill, DefenceSkill, AttackRoll, DefenceRoll, Results) VALUES($1)';
    try {
        const res = await pool.query(rolltext, [mess]);
        return res;
    } catch (err) {
        console.log(err.stack);
    }
};

const readRolls = async () => {
    const rolltext =
        'SELECT ID, time, AttackSkill, DefenceSkill, AttackRoll, DefenceRoll, Results FROM public."Rolls"';
    try {
        const res = await pool.query(rolltext);
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
