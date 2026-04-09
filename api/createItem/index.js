const { getPool, sql } = require('../db/connection')
const { ITEM_SELECT } = require('../db/queries')

module.exports = async (context, req) => {
  try {
    const { name, sku, quantity = 0, price, category_id = null, low_stock_threshold = 10 } = req.body || {}
    if (!name || !sku || price == null)
      return { status: 400, body: { detail: 'name, sku, and price are required' } }

    const pool = await getPool()
    try {
      const inserted = await pool
        .request()
        .input('name', sql.NVarChar(200), name)
        .input('sku', sql.NVarChar(100), sku)
        .input('quantity', sql.Int, quantity)
        .input('price', sql.Decimal(12, 2), price)
        .input('category_id', sql.Int, category_id)
        .input('low_stock_threshold', sql.Int, low_stock_threshold)
        .query(`
          INSERT INTO items (name, sku, quantity, price, category_id, low_stock_threshold)
          OUTPUT INSERTED.id
          VALUES (@name, @sku, @quantity, @price, @category_id, @low_stock_threshold)
        `)

      const id = inserted.recordset[0].id
      const result = await pool.request().input('id', sql.Int, id).query(`${ITEM_SELECT} WHERE i.id = @id`)
      return { status: 201, body: result.recordset[0] }
    } catch (err) {
      if (err.number === 2627 || err.number === 2601)
        return { status: 409, body: { detail: 'SKU already exists' } }
      throw err
    }
  } catch (err) {
    context.log.error(err)
    return { status: 500, body: { detail: 'Internal server error' } }
  }
}
