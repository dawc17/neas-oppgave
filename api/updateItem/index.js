const { getPool, sql } = require("../db/connection")
const { verifyToken, requireRole } = require("../auth/middleware")

module.exports = async function (context, req) {
  const { name, sku, quantity, price } = req.body
  try {
    const decoded = verifyToken(req)
    if (decoded.status) return decoded
    const err = requireRole(decoded, "admin")
    if (err) return err

    const pool = await getPool()
    const result = await pool
      .request()
      .input("id", sql.Int, parseInt(req.params.id))
      .input("name", sql.NVarChar, name)
      .input("sku", sql.NVarChar, sku)
      .input("quantity", sql.Int, quantity)
      .input("price", sql.Decimal(12, 2), price)
      .query("UPDATE items SET name = @name, sku = @sku, quantity = @quantity, price = @price OUTPUT INSERTED.* WHERE id = @id")

    if (result.rowsAffected[0] === 0) return { status: 404, body: { detail: "Item not found" } }
    return { status: 200, body: { detail: result.recordset[0] } }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: "Internal server error" } }
  }
}
