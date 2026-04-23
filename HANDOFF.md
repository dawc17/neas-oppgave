# Handoff Notes

## Where we left off

Auth is working — `register` and `login` both return a JWT. The item functions (`listItems`, `getItem`, `createItem`, `updateItem`, `deleteItem`) still have **no auth protection**. Next task is adding `verifyToken` + `requireRole` to each of them.

---

## Next immediate step — protect item functions

Add this to the top of each item function's `index.js`, right inside the `try` block before the DB call:

```js
const { verifyToken, requireRole } = require("../auth/middleware")

// inside the function:
const decoded = verifyToken(req)
if (decoded.status) return decoded

const err = requireRole(decoded, "admin", "employee") // adjust roles per function
if (err) return err
```

### Role rules (from PLAN.md)
| Function     | Allowed roles          |
| ------------ | ---------------------- |
| listItems    | admin, employee, guest |
| getItem      | admin, employee, guest |
| createItem   | admin, employee        |
| updateItem   | admin                  |
| deleteItem   | admin                  |

---

## After that — frontend

Install deps first:
```bash
bun add vue-router@4 pinia axios
```

Files to create (in order):
1. `src/api/client.js` — axios instance that reads JWT from localStorage and attaches it as `Authorization: Bearer <token>` header
2. `src/router/index.js` — routes for `/login` and `/inventory`, redirect to login if no token
3. `src/stores/auth.js` — pinia store for login/register, saves token to localStorage
4. `src/stores/inventory.js` — pinia store for item CRUD
5. `src/pages/LoginPage.vue`
6. `src/pages/InventoryPage.vue` + `src/components/ItemTable.vue` + `src/components/ItemForm.vue`
7. Update `src/main.js` and `src/App.vue`

---

## Useful commands

```bash
# Start local environment (SQL Server + Azurite + Functions)
docker-compose up

# Rebuild after code/package changes
docker-compose up --build

# Run DB migrations
node api/db/migrate.js

# Start frontend
bun dev

# Deploy to Azure
func azure functionapp publish testneas --javascript --build remote
```

Local functions: `http://localhost:7071/api/...`
Frontend dev server: `http://localhost:5173`

---

## How auth works

- `POST /api/auth/register` — creates user, returns JWT
- `POST /api/auth/login` — verifies password with bcrypt, returns JWT
- Token payload: `{ id, username, role }`, expires in 1 hour
- Send token on protected requests: `Authorization: Bearer <token>`
- Roles: `admin` (full access), `employee` (view + create), `guest` (view only)

---

## Environment variables

**Local** — stored in `.env` (gitignored, never commit):
- `SA_PASSWORD` — SQL Server SA password for Docker
- `SQL_SERVER`, `SQL_PORT`, `SQL_DATABASE`, `SQL_USER`, `SQL_PASSWORD` — DB connection
- `JWT_SECRET` — secret used to sign tokens

**Azure** — set in Function App > Settings > Environment variables (same names as above, plus `JWT_SECRET`)

---

## Key files

| File | Purpose |
| ---- | ------- |
| `api/db/connection.js` | Shared MSSQL connection pool |
| `api/db/migrate.js` | Runs all `.sql` files in `api/db/migrations/` |
| `api/auth/middleware.js` | `verifyToken` and `requireRole` helpers |
| `api/register/` | POST /api/auth/register |
| `api/login/` | POST /api/auth/login |
| `docker-compose.yml` | Local dev services |
| `vite.config.js` | Proxies `/api` → `http://localhost:7071` |
