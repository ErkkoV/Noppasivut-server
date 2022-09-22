import pg from "pg";

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "Noppasivut",
    password: "kakka",
    port: 5433,
});

const probtext =
    'CREATE TABLE IF NOT EXISTS public."Probs"("ID" character(255) NOT NULL, "UserID" character(255) NOT NULL, "AttackSkill" integer,"DefenceSkill" integer,"AttackRoll" integer,"DefenceRoll" integer,"Results" json[])';
const rolltext =
    'CREATE TABLE IF NOT EXISTS public."Rolls"("ID" character(255) NOT NULL, "UserID" character(255) NOT NULL, "AttackSkill" integer,"DefenceSkill" integer,"AttackRoll" integer,"DefenceRoll" integer,"Results" json[])';
const messagetext =
    'CREATE TABLE IF NOT EXISTS public."Messages"(message character(255) NOT NULL)';

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

const sendMessage = (mess) => {
    const messtext = 'INSERT INTO public."Messages"(message) VALUES($1)';
    pool.query(messtext, [mess], (err, res) => {
        console.log(err, res);
    });
};

const readMessages = async () => {
    const messtext = 'SELECT message FROM public."Messages"';
    try {
        const res = await pool.query(messtext);
        return res.rows;
    } catch (err) {
        console.log(err.stack);
    }
};

export { sendMessage, pool, createDB, readMessages };
