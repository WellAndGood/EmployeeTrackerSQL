const mysql = require('mysql');
require('dotenv').config()

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'workplace_db', // process.env.DB_NAME,
    user: 'root', // process.env.DB_USER,
    password: 'Appl35&Orang35' // process.env.DB_PASSWORD,
    
}); 

module.exports = connection;