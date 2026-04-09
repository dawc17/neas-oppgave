# Inventory Management System — Implementation Plan

## Context
Building a full-stack Inventory Management System on top of an existing Vue 3 + Vite + Tailwind v4 scaffold. The frontend is already set up at the project root. A Python/FastAPI backend and PostgreSQL database need to be added, both running in Docker locally and deployable to Azure.

**Stack:** Vue 3 + Tailwind v4 · Python FastAPI · PostgreSQL · Docker Compose · Azure (Container Apps + Azure Database for PostgreSQL)

**Features:** Item CRUD · Categories · Low-stock alerts · Dashboard stats

---

## File / Folder Structure

```
neas-oppgave/
├── src/
│   ├── main.js                     MODIFY - register router + pinia
│   ├── App.vue                     MODIFY - RouterView + AppShell
│   ├── assets/main.css             no change
│   ├── router/index.js             NEW
│   ├── stores/
│   │   ├── inventory.js            NEW
│   │   └── categories.js           NEW
│   ├── api/client.js               NEW - axios instance, baseURL /api
│   ├── pages/
│   │   ├── DashboardPage.vue       NEW
│   │   ├── InventoryPage.vue       NEW
│   │   ├── ItemDetailPage.vue      NEW
│   │   └── CategoriesPage.vue      NEW
│   └── components/
│       ├── layout/
│       │   ├── AppShell.vue        NEW
│       │   └── AppNav.vue          NEW
│       ├── dashboard/
│       │   ├── StatCard.vue        NEW
│       │   └── CategoryBreakdown.vue NEW
│       ├── inventory/
│       │   ├── ItemTable.vue       NEW
│       │   ├── ItemRow.vue         NEW
│       │   ├── ItemForm.vue        NEW (create/edit modal)
│       │   ├── ItemFilters.vue     NEW
│       │   └── LowStockBadge.vue   NEW
│       └── categories/
│           ├── CategoryList.vue    NEW
│           └── CategoryForm.vue    NEW
├── backend/
│   ├── Dockerfile                  NEW
│   ├── requirements.txt            NEW
│   ├── .env.example                NEW
│   ├── alembic.ini                 NEW
│   ├── alembic/env.py + versions/  NEW
│   └── app/
│       ├── main.py                 NEW - FastAPI entry, CORS, routers
│       ├── config.py               NEW - pydantic-settings
│       ├── database.py             NEW - SQLAlchemy engine + get_db
│       ├── models/category.py      NEW
│       ├── models/item.py          NEW
│       ├── schemas/category.py     NEW
│       ├── schemas/item.py         NEW
│       ├── crud/category.py        NEW
│       ├── crud/item.py            NEW (filtering/sorting/pagination)
│       └── routers/
│           ├── categories.py       NEW
│           ├── items.py            NEW
│           └── dashboard.py        NEW
├── docker-compose.yml              NEW
├── .env                            NEW (gitignored)
├── vite.config.js                  MODIFY - add /api proxy
└── package.json                    MODIFY - add vue-router, pinia, axios
```

---

## Database Schema

**categories**
```
id           SERIAL PRIMARY KEY
name         VARCHAR(100) NOT NULL UNIQUE
description  TEXT
created_at   TIMESTAMPTZ DEFAULT now()
updated_at   TIMESTAMPTZ DEFAULT now()
```

**items**
```
id                  SERIAL PRIMARY KEY
name                VARCHAR(200) NOT NULL
sku                 VARCHAR(100) NOT NULL UNIQUE
quantity            INTEGER NOT NULL DEFAULT 0   CHECK >= 0
price               NUMERIC(12,2) NOT NULL        CHECK >= 0
category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL
low_stock_threshold INTEGER NOT NULL DEFAULT 10   CHECK >= 0
created_at          TIMESTAMPTZ DEFAULT now()
updated_at          TIMESTAMPTZ DEFAULT now()
```

Computed at query time (not stored): `is_low_stock`, `total_value`, `category_name`.
`updated_at` maintained via PostgreSQL trigger.

---

## API Endpoints

All prefixed `/api`.

### Categories
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List all |
| POST | `/api/categories` | Create |
| GET | `/api/categories/{id}` | Get one |
| PUT | `/api/categories/{id}` | Update |
| DELETE | `/api/categories/{id}` | Delete (items become uncategorized) |

### Items
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/items` | List with `?search`, `?category_id`, `?low_stock`, `?sort_by`, `?sort_dir`, `?page`, `?page_size` |
| POST | `/api/items` | Create |
| GET | `/api/items/{id}` | Get one |
| PUT | `/api/items/{id}` | Full update |
| PATCH | `/api/items/{id}/quantity` | Adjust quantity only |
| DELETE | `/api/items/{id}` | Delete |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Totals: item count, quantity, inventory value, low-stock count, per-category breakdown |

---

## Frontend Routes

```
/           → redirect to /dashboard
/dashboard  → DashboardPage
/inventory  → InventoryPage
/inventory/:id → ItemDetailPage
/categories → CategoriesPage
```

---

## Docker Setup

**docker-compose.yml** — two services: `db` (postgres:16-alpine) and `backend` (built from `./backend`).
- `backend` depends on `db` with healthcheck
- Volume-mount `./backend:/app` for hot reload in dev (`--reload` flag)
- `POSTGRES_PASSWORD` read from `.env` at root

**vite.config.js proxy:**
```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:8000', changeOrigin: true }
  }
}
```
This routes all `/api` calls from the browser through Vite, avoiding CORS issues in dev.

**FastAPI CORS** still configured for direct API access (Postman, production).

---

## Implementation Order

### Phase 1 — Backend foundation
1. Create `backend/` directory + all files (`config.py`, `database.py`, models, bare `main.py` with `/api/health`)
2. Write `Dockerfile`, `docker-compose.yml`, `.env`
3. `docker-compose up --build` → verify health endpoint

### Phase 2 — DB migrations
4. Init Alembic, configure `env.py` to use `Base.metadata`
5. Write initial migration (both tables + `updated_at` trigger)
6. `docker-compose exec backend alembic upgrade head`

### Phase 3 — Backend CRUD
7. Schemas → CRUD functions → routers for **categories** (register in `main.py`, test in Postman)
8. Schemas → CRUD functions → routers for **items** (filtering/sorting/pagination in `crud/item.py`)
9. Dashboard aggregation endpoint

### Phase 4 — Frontend infrastructure
10. `bun add vue-router@4 pinia axios`
11. `src/router/index.js`, empty store stubs, `api/client.js`
12. Update `main.js`, `App.vue`, `vite.config.js` (proxy)
13. `AppShell.vue` + `AppNav.vue` with nav links
14. Verify routing works + `/api/health` proxy call succeeds

### Phase 5 — Categories UI
15. Implement `categories.js` store actions
16. Build `CategoryForm`, `CategoryList`, `CategoriesPage`

### Phase 6 — Inventory UI
17. Implement `inventory.js` store actions
18. Build `LowStockBadge` → `ItemRow` → `ItemTable` → `ItemFilters` → `ItemForm` → `InventoryPage` → `ItemDetailPage`

### Phase 7 — Dashboard UI
19. Build `StatCard`, `CategoryBreakdown`, `DashboardPage`
20. Add low-stock count badge to `AppNav`

### Phase 8 — Polish
21. Loading skeletons, empty states, error handling (axios interceptor → toast)
22. Inline 409 errors on `ItemForm` (duplicate SKU) and `CategoryForm` (duplicate name)
23. Update `index.html` title

---

## Verification
- `docker-compose up` → backend healthy at `http://localhost:8000/api/health`
- Postman: full CRUD for categories and items, dashboard stats, filtering/pagination
- `bun dev` → all four pages load, proxy routes `/api` correctly
- Create a category, add items to it, verify low-stock badge appears, check dashboard totals update
