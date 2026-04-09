const { require: req } = global || {}
const sql = require('mssql')
const fs = require('fs')
const path = require('path')

async function migrate() {
  const dbName = process.env.SQL_DATABASE || 'inventory'

  const config = {
    server: process.env.SQL_SERVER || 'localhost',
    port: parseInt(process.env.SQL_PORT || '1433'),
    database: 'master',
    user: process.env.SQL_USER || 'sa',
    password: process.env.SQL_PASSWORD || 'changeme',
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  }

  console.log('Connecting to SQL Server...')
  const masterPool = await sql.connect(config)

  console.log(`Creating database '${dbName}' if it does not exist...`)
  await masterPool
    .request()
    .query(`IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}') CREATE DATABASE [${dbName}]`)
  await masterPool.close()

  console.log('Running migration script...')
  const dbPool = await sql.connect({ ...config, database: dbName })
  const script = fs.readFileSync(path.join(__dirname, 'migrations', '001_initial.sql'), 'utf8')

  const batches = script.split(/^\s*GO\s*$/im).filter((b) => b.trim())
  for (const batch of batches) {
    await dbPool.request().query(batch)
    process.stdout.write('.')
  }

  console.log('\nDone.')
  await dbPool.close()
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
