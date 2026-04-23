const { getPool, sql } = require("../db/connection")
const { verifyToken, requireRole } = require("../auth/middleware")

module.exports = async function (context, req) {
  const { name, sku, quantity, price } = req.body
  try {
    const decoded = verifyToken(req)
    if (decoded.status) return decoded
    const err = requireRole(decoded, "admin", "employee")
    if (err) return err

    const pool = await getPool()
    const result = await pool
      .request()
      // TODO: understand this.
      .input("name", sql.NVarChar, name)
      .input("sku", sql.NVarChar, sku)
      .input("quantity", sql.Int, quantity)
      .input("price", sql.Decimal(12, 2), price)
      .query("INSERT INTO items (name, sku, quantity, price) OUTPUT INSERTED.* VALUES (@name, @sku, @quantity, @price)")

    return { status: 201, body: result.recordset[0] }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: "Internal server error. " } }
  }
}
