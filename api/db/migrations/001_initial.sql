IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories')
CREATE TABLE categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100)  NOT NULL,
    description NVARCHAR(MAX)  NULL,
    created_at  DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at  DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
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
