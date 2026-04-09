const sql = require('mssql')

const config = {
  server: process.env.SQL_SERVER || 'localhost',
  port: parseInt(process.env.SQL_PORT || '1433'),
  database: process.env.SQL_DATABASE || 'inventory',
  user: process.env.SQL_USER || 'sa',
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: process.env.SQL_ENCRYPT !== 'false',
    trustServerCertificate: process.env.SQL_TRUST_CERT === 'true',
  },
}

let pool = null

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config)
  }
  return pool
}

module.exports = { getPool, sql }
