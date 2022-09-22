import pg from "pg";

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "Noppasivut",
    password: "kakka",
    port: 5433,
});

const probtext =
    'CREATE TABLE IF NOT EXISTS public."Probs"("ID" "char" NOT NULL, "UserID" "char" NOT NULL, "AttackSkill" integer,"DefenceSkill" integer,"AttackRoll" integer,"DefenceRoll" integer,"Results" json[])';
const rolltext =
    'CREATE TABLE IF NOT EXISTS public."Rolls"("ID" "char" NOT NULL, "UserID" "char" NOT NULL, "AttackSkill" integer,"DefenceSkill" integer,"AttackRoll" integer,"DefenceRoll" integer,"Results" json[])';
const messagetext =
    'CREATE TABLE IF NOT EXISTS public."Messages"(message "char" NOT NULL)';

pool.connect();

pool.query(probtext, (err, res) => {
    console.log(err, res);
});

pool.query(rolltext, (err, res) => {
    console.log(err, res);
});

pool.query(messagetext, (err, res) => {
    console.log(err, res);
});
