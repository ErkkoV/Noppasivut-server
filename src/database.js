import pg from "pg";

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "Noppasivut",
    password: "kakka",
    port: 5433,
});

pool.query("SELECT NOW()", (err, res) => {
    console.log(err, res);
    pool.end();
});

const client = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Noppasivut",
    password: "kakka",
    port: 5433,
});

client.connect();

client.query("SELECT NOW()", (err, res) => {
    console.log(err, res);
    client.end();
});
