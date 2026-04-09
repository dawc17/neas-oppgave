IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories')
CREATE TABLE categories (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(100)  NOT NULL,
    description     NVARCHAR(MAX)  NULL,
    created_at      DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT uq_categories_name UNIQUE (name)
)
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'items')
CREATE TABLE items (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    name                NVARCHAR(200)  NOT NULL,
    sku                 NVARCHAR(100)  NOT NULL,
    quantity            INT            NOT NULL DEFAULT 0,
    price               DECIMAL(12,2)  NOT NULL,
    category_id         INT            NULL,
    low_stock_threshold INT            NOT NULL DEFAULT 10,
    created_at          DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at          DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT uq_items_sku      UNIQUE (sku),
    CONSTRAINT chk_items_qty     CHECK (quantity >= 0),
    CONSTRAINT chk_items_price   CHECK (price >= 0),
    CONSTRAINT chk_items_thresh  CHECK (low_stock_threshold >= 0),
    CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
)
GO

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_categories_updated_at')
EXEC('
CREATE TRIGGER trg_categories_updated_at ON categories AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON
    UPDATE categories SET updated_at = SYSDATETIMEOFFSET()
    FROM categories c INNER JOIN inserted i ON c.id = i.id
END
')
GO

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_items_updated_at')
EXEC('
CREATE TRIGGER trg_items_updated_at ON items AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON
    UPDATE items SET updated_at = SYSDATETIMEOFFSET()
    FROM items it INNER JOIN inserted ins ON it.id = ins.id
END
')
GO
