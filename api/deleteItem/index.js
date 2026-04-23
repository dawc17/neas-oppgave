const { getPool, sql } = require("../db/connection")
const { verifyToken, requireRole } = require("../auth/middleware")

module.exports = async function (context, req) {
  try {
    const decoded = verifyToken(req)
    if (decoded.status) return decoded
    const err = requireRole(decoded, "admin")
    if (err) return err

    const pool = await getPool()
    const result = await pool
      .request()
      .input("id", sql.Int, parseInt(req.params.id))
      .query("DELETE FROM items WHERE id = @id")

    if (result.rowsAffected[0] === 0) {
      return { status: 404, body: { detail: "Item not found" } }
    }

    return { status: 204, body: null }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: "Internal server error" } }
  }
}
