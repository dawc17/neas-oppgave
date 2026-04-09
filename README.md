# Inventory Management System

## Running locally

**Prerequisites:** Docker Desktop

1. Start the containers:
   ```bash
   docker-compose up --build
   ```

2. Run the database migration (first time only):
   ```bash
   docker-compose exec api node db/migrate.js
   ```

3. Start the frontend:
   ```bash
   bun dev
   ```

API is available at `http://localhost:7071/api`  
Frontend is available at `http://localhost:5173`

---

## Deploying to Azure

**Prerequisites:** [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) and [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)

1. Log in to Azure:
   ```bash
   az login
   ```

2. Deploy the API:
   ```bash
   cd api
   func azure functionapp publish testneas --javascript --build remote
   ```

---

## Environment variables

For local development, set these in `docker-compose.yml`. For Azure, set them in the Function App's Environment Variables in the Azure portal.

| Variable | Description |
|----------|-------------|
| `SQL_SERVER` | SQL Server hostname |
| `SQL_PORT` | SQL Server port (default: 1433) |
| `SQL_DATABASE` | Database name |
| `SQL_USER` | SQL login username |
| `SQL_PASSWORD` | SQL login password |
