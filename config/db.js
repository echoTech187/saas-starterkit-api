const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool({
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_NAME,
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

if (process.env.NODE_ENV !== 'production') {
    pool.on('connection', () => {
        console.log('Connected to MySQL database');
    });
}

module.exports = pool;