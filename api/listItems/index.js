const { getPool } = require("../db/connection")
const { verifyToken, requireRole } = require("../auth/middleware")

module.exports = async function (context, req) {
  try {
    const decoded = verifyToken(req)
    if (decoded.status) return decoded
    const err = requireRole(decoded, "admin", "employee", "guest")
    if (err) return err

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
