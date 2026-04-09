const ITEM_SELECT = `
  SELECT i.id, i.name, i.sku, i.quantity, i.price,
         i.category_id, c.name AS category_name,
         i.low_stock_threshold,
         CAST(CASE WHEN i.quantity < i.low_stock_threshold THEN 1 ELSE 0 END AS BIT) AS is_low_stock,
         CAST(i.quantity * i.price AS DECIMAL(12,2)) AS total_value,
         i.created_at, i.updated_at
  FROM items i
  LEFT JOIN categories c ON c.id = i.category_id
`

module.exports = { ITEM_SELECT }
