require('dotenv').config();
module.exports = {
  development: {
    username: process.env.DB_USER || "administrator",
    password: process.env.DB_PASSWORD || "echoAdza32",
    database: process.env.DB_NAME || "member_db",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_HOST ? 3306 : 3307,
    dialect: "mysql"
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "member_db",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "member_db",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql"
  }
}
