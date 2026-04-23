const sql = require("mssql")

const config = {
  server: process.env.SQL_SERVER,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

let pool = null

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config)
  }
  return pool
}

module.exports = { getPool, sql }

