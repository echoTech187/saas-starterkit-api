require('dotenv').config();
module.exports = {
  development: {
    username: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_NAME,
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT,
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        ca: process.env.TIDB_CA_CERT?.replace(/\\n/gm, '\n'),
      },
    },
    dialect: "mysql"
  },
  test: {
    username: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_NAME,
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT,
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        ca: process.env.TIDB_CA_CERT?.replace(/\\n/gm, '\n'),
      },
    },
    dialect: "mysql"
  },
  production: {
    username: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_NAME,
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT,
    dialectOptions: {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        ca: process.env.TIDB_CA_CERT?.replace(/\\n/gm, '\n'),
      },
    },
    dialect: "mysql"
  }
}
