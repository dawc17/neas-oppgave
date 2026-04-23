# Inventory Management System — MVP Plan

## Stack

- **Frontend:** Vue 3 + Vite + Tailwind CSS v4
- **Backend:** Azure Functions v3 (Node.js, folder-per-function model)
- **Database:** Azure SQL (MSSQL) — local dev uses SQL Server in Docker
- **Local dev:** Docker Compose (SQL Server + Azurite + Azure Functions)
- **Deployment:** Azure Function App "testneas" + Azure SQL server "inventoryneas"

---

## What's done

| Item                                                                        | Status |
| --------------------------------------------------------------------------- | ------ |
| `api/db/connection.js` — shared MSSQL connection pool                       | ✅     |
| `api/db/migrate.js` + `api/db/migrations/001_initial.sql` — DB setup script | ✅     |
| `api/listItems` — `GET /api/items`                                          | ✅     |
| `api/getItem` — `GET /api/items/{id}`                                       | ✅     |
| `api/createItem` — `POST /api/items`                                        | ✅     |
| `api/updateItem` — `PUT /api/items/{id}`                                    | ✅     |
| `api/deleteItem` — `DELETE /api/items/{id}`                                 | ✅     |
| `docker-compose.yml` — SQL Server + Azurite + Functions                     | ✅     |
| Azure SQL database created and migrated                                     | ✅     |
| Function App deployed to Azure                                              | ✅     |
| Vite proxy `/api` → `http://localhost:7071`                                 | ✅     |
| ESLint ignores `api/**`                                                     | ✅     |

---

## Database schema

```sql
CREATE TABLE items (
  id          INT IDENTITY(1,1) PRIMARY KEY,
  name        NVARCHAR(200) NOT NULL,
  sku         NVARCHAR(100) NOT NULL UNIQUE,
  quantity    INT NOT NULL DEFAULT 0,
  price       DECIMAL(12,2) NOT NULL,
  created_at  DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
  updated_at  DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
)

CREATE TABLE users (
  id           INT IDENTITY(1,1) PRIMARY KEY,
  username     NVARCHAR(100) NOT NULL UNIQUE,
  email        NVARCHAR(200) NOT NULL UNIQUE,
  name         NVARCHAR(200) NOT NULL,
  password     NVARCHAR(255) NOT NULL,  -- bcrypt hash, never plain text
  role         NVARCHAR(20) NOT NULL DEFAULT 'guest',  -- 'admin', 'employee', 'guest'
  created_at   DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
)
```

---

## API

### Items

| Function      | Method | Route             | Allowed roles          |
| ------------- | ------ | ----------------- | ---------------------- |
| `listItems`   | GET    | `/api/items`      | admin, employee, guest |
| `getItem`     | GET    | `/api/items/{id}` | admin, employee, guest |
| `createItem`  | POST   | `/api/items`      | admin, employee        |
| `updateItem`  | PUT    | `/api/items/{id}` | admin                  |
| `deleteItem`  | DELETE | `/api/items/{id}` | admin                  |

### Auth

| Function   | Method | Route                | Notes                          |
| ---------- | ------ | -------------------- | ------------------------------ |
| `register` | POST   | `/api/auth/register` | Hashes password, returns JWT   |
| `login`    | POST   | `/api/auth/login`    | Verifies password, returns JWT |

---

## Auth design

### JWT
- Signed with `JWT_SECRET` env var
- Payload: `{ id, username, role }`
- Expires after **1 hour**

### Roles
| Role       | Can do                           |
| ---------- | -------------------------------- |
| `admin`    | Everything (full CRUD)           |
| `employee` | View items + create items        |
| `guest`    | View items only                  |

### Shared helper — `api/auth/middleware.js`
Not a function folder — just a module imported by other functions:
- `verifyToken(req)` — reads `Authorization: Bearer <token>`, verifies JWT, returns decoded payload or throws 401
- `requireRole(decoded, ...roles)` — checks `decoded.role` against allowed list, throws 403 if not allowed

### Register flow
1. Read `username`, `email`, `name`, `password` from `req.body`
2. Hash password with `bcrypt.hash(password, 10)`
3. INSERT into users table
4. Sign JWT, return 201 with token

### Login flow
1. Read `username`, `password` from `req.body`
2. Fetch user by username
3. `bcrypt.compare(password, user.password)` — if false → 401
4. Sign JWT, return 200 with token

### Protecting existing endpoints
Add at the top of each function's try block:
```js
const { verifyToken, requireRole } = require("../auth/middleware")
const decoded = verifyToken(req)           // returns 401 if missing/invalid
requireRole(decoded, "admin", "employee")  // returns 403 if wrong role
```

### New packages needed
```bash
cd api && npm install jsonwebtoken bcrypt
```
Add `JWT_SECRET` to `.env` (local) and Azure App Settings (production).

---

## MVP Frontend

```
src/
├── api/client.js          NEW — axios instance, attaches JWT from localStorage
├── router/index.js        NEW — routes: /, /inventory, /login
├── stores/
│   ├── auth.js            NEW — login/register actions, stores token
│   └── inventory.js       NEW — fetchItems, createItem, updateItem, deleteItem
├── pages/
│   ├── LoginPage.vue      NEW — login form
│   └── InventoryPage.vue  NEW — table + add/edit/delete
├── components/
│   ├── ItemTable.vue      NEW
│   └── ItemForm.vue       NEW — create/edit modal
├── App.vue                MODIFY — RouterView
└── main.js                MODIFY — register router + pinia
```

Install: `bun add vue-router@4 pinia axios`

---

## Implementation order

### Step 1 — Auth backend
1. New migration `api/db/migrations/002_users.sql`, run it with `node api/db/migrate.js`
2. `cd api && npm install jsonwebtoken bcrypt`
3. Write `api/auth/middleware.js`
4. Write `api/register/` (function.json + index.js)
5. Write `api/login/` (function.json + index.js)
6. Test register + login in Postman, verify JWT returned
7. Add `verifyToken` + `requireRole` to existing item functions
8. Test role enforcement in Postman

### Step 2 — Frontend
9. `bun add vue-router@4 pinia axios`
10. `src/api/client.js` — axios with JWT header
11. `src/router/index.js` — routes + redirect unauthenticated to /login
12. `src/stores/auth.js` + `src/stores/inventory.js`
13. `LoginPage.vue` — login form, saves token, redirects to /inventory
14. `ItemTable.vue` + `ItemForm.vue` + `InventoryPage.vue`
15. Hide add/edit/delete buttons based on role from auth store

### Step 3 — Deploy
16. Add `JWT_SECRET` to Azure App Settings
17. `func azure functionapp publish testneas --javascript --build remote`
18. Verify on live Azure URL

---

## Local dev commands

```bash
# Start everything (SQL Server + Azurite + Functions)
docker-compose up

# Run a migration
node api/db/migrate.js

# Start frontend
bun dev

# Deploy functions
func azure functionapp publish testneas --javascript --build remote
```

Functions: `http://localhost:7071/api/...`
Frontend: `http://localhost:5173` (proxies `/api` → Functions)
