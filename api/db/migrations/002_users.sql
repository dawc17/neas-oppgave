IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
CREATE TABLE users (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    username   NVARCHAR(100)  NOT NULL,
    email      NVARCHAR(200)  NOT NULL,
    name       NVARCHAR(200)  NOT NULL,
    password   NVARCHAR(255)  NOT NULL,
    role       NVARCHAR(20)   NOT NULL DEFAULT 'guest',
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT chk_users_role    CHECK (role IN ('admin', 'employee', 'guest'))
)
GO
