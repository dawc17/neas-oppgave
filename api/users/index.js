const { getPool, sql } = require("../db/connection")
const { verifyToken, requireRole } = require("../auth/middleware")

const ALLOWED_ROLES = new Set(["admin", "employee", "guest"])

module.exports = async function (context, req) {
  try {
    const decoded = verifyToken(req)
    if (decoded.status) return decoded

    const err = requireRole(decoded, "admin")
    if (err) return err

    const pool = await getPool()

    if (req.method === "GET") {
      const result = await pool.request().query(
        "SELECT id, username, email, name, role, created_at FROM users ORDER BY created_at DESC"
      )
      return { status: 200, body: result.recordset }
    }

    if (req.method === "PUT") {
      const { id, role } = req.body || {}

      if (!Number.isInteger(Number(id))) {
        return { status: 400, body: { detail: "Invalid user id" } }
      }
      if (!ALLOWED_ROLES.has(role)) {
        return { status: 400, body: { detail: "Invalid role" } }
      }

      const result = await pool
        .request()
        .input("id", sql.Int, Number(id))
        .input("role", sql.NVarChar, role)
        .query("UPDATE users SET role = @role OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.name, INSERTED.role, INSERTED.created_at WHERE id = @id")

      if (result.rowsAffected[0] === 0) {
        return { status: 404, body: { detail: "User not found" } }
      }

      return { status: 200, body: result.recordset[0] }
    }

    return { status: 405, body: { detail: "Method not allowed" } }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: "Internal server error" } }
  }
}