const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'member_db',
    port: process.env.DB_HOST ? 3306 : 3307,
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