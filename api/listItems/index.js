const { getPool } = require("../db/connection")

module.exports = async function (context, req) {
  try {
    const pool = await getPool()
    const result = await pool
      .request()
      .query("SELECT * FROM items")

    return { status: 200, body: result.recordset }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: "Internal server error " } }
  }
}
