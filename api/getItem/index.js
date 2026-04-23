const { getPool, sql } = require("../db/connection")
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
      .input("id", sql.Int, parseInt(req.params.id))
      .query("SELECT * FROM items WHERE id = @id")

    if (!result.recordset.length) {
      return { status: 404, body: { detail: "Item not found" } }
    }

    return { status: 200, body: result.recordset[0] }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: "Internal server error" } }
  }
}
