// Creates and exports the MySQL database connection using mysql2

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bs_albums",
    port: 3306,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the bs_albums database");
});

module.exports = db;