# Inventory Management System — MVP Plan

## Stack
- **Frontend:** Vue 3 + Vite + Tailwind CSS v4
- **Backend:** Azure Functions v3 (Node.js, folder-per-function model)
- **Database:** Azure SQL (MSSQL) — local dev uses SQL Server in Docker
- **Local dev:** Docker Compose (SQL Server + Azurite + Azure Functions)
- **Deployment:** Azure Function App "testneas" + Azure SQL server "inventoryneas"

---

## What's done

| Item | Status |
|------|--------|
| `api/db/connection.js` — shared MSSQL connection pool | ✅ |
| `api/db/migrate.js` + `api/db/migrations/001_initial.sql` — DB setup script | ✅ |
| `api/listItems` — `GET /api/items` | ✅ |
| `api/getItem` — `GET /api/items/{id}` | ✅ |
| `docker-compose.yml` — SQL Server + Azurite + Functions | ✅ |
| Azure SQL database created and migrated | ✅ |
| Function App deployed to Azure | ✅ |
| Vite proxy `/api` → `http://localhost:7071` | ✅ |
| ESLint ignores `api/**` | ✅ |

---

## Database schema (already in Azure SQL)

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
```

---

## MVP API — remaining functions to write

Each function = a new folder under `api/` with `function.json` + `index.js`.

| Function folder | Method | Route | Status |
|-----------------|--------|-------|--------|
| `listItems` | GET | `/api/items` | ✅ done |
| `getItem` | GET | `/api/items/{id}` | ✅ done |
| `createItem` | POST | `/api/items` | ⬜ next |
| `updateItem` | PUT | `/api/items/{id}` | ⬜ |
| `deleteItem` | DELETE | `/api/items/{id}` | ⬜ |

### createItem
- Read `name`, `sku`, `quantity`, `price` from `req.body`
- `INSERT INTO items ... OUTPUT INSERTED.*`
- Return 201 with the new row

### updateItem
- Read `id` from `req.params.id`
- Read fields from `req.body`
- `UPDATE items SET ... OUTPUT INSERTED.* WHERE id = @id`
- Return 200 with updated row, or 404 if no rows affected

### deleteItem
- Read `id` from `req.params.id`
- `DELETE FROM items WHERE id = @id`
- Return 204 (no body), or 404 if no rows affected

---

## MVP Frontend

Minimal — just enough to show the data and add items.

```
src/
├── api/client.js          NEW — axios instance (baseURL '/api')
├── router/index.js        NEW — two routes: / and /inventory
├── stores/inventory.js    NEW — pinia store, calls the API
├── pages/
│   └── InventoryPage.vue  NEW — table of items + add form
├── components/
│   ├── ItemTable.vue      NEW — renders the rows
│   └── ItemForm.vue       NEW — create/edit form (modal or inline)
├── App.vue                MODIFY — add <RouterView>
└── main.js                MODIFY — register router + pinia
```

Install: `bun add vue-router@4 pinia axios`

### InventoryPage features (MVP only)
- Table: name, SKU, quantity, price
- "Add item" button → opens ItemForm
- Click a row → opens ItemForm pre-filled for editing
- Delete button per row

---

## Implementation order

### Step 1 — remaining API functions (you write, guided)
1. `createItem` — `function.json` then `index.js`
2. `updateItem`
3. `deleteItem`
4. Test all five endpoints in Postman

### Step 2 — frontend wiring
5. `bun add vue-router@4 pinia axios`
6. `src/api/client.js` + `src/router/index.js`
7. Update `main.js` and `App.vue`
8. `src/stores/inventory.js` — `fetchItems`, `createItem`, `updateItem`, `deleteItem`
9. `ItemTable.vue` + `ItemForm.vue` + `InventoryPage.vue`

### Step 3 — deploy
10. `func azure functionapp publish testneas --javascript --build remote`
11. Verify on the live Azure URL

---

## Local dev commands

```bash
# Start everything (SQL Server + Azurite + Functions)
docker-compose up

# Run migration (first time or after schema changes)
node api/db/migrate.js

# Start frontend
bun dev

# Re-deploy functions after changes
func azure functionapp publish testneas --javascript --build remote
```

Functions run at `http://localhost:7071/api/...`
Vite dev server at `http://localhost:5173` (proxies `/api` → Functions)
