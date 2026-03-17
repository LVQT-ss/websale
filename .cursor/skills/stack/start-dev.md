# Start Dev Environment

## Purpose
Start the full development environment: Docker services → Backend → Frontend.

## Steps

### 1. Start Docker Services
```bash
docker compose up -d
```
Wait for health checks:
```bash
# Postgres
until docker compose exec postgres pg_isready -U postgres; do sleep 1; done
# Redis
until docker compose exec redis redis-cli ping | grep PONG; do sleep 1; done
```

### 2. Start Backend
```bash
cd Backend
npm run start:dev
```
Verify:
```bash
curl -s http://localhost:3001/health | grep -q "ok" && echo "✅ Backend up" || echo "❌ Backend down"
```

### 3. Start Frontend
```bash
cd Frontend
npm run dev
```
Verify: open `http://localhost:3000` — page loads without errors.

### 4. Quick Smoke Test
```bash
curl -s http://localhost:3001/health   # → { "status": "ok" }
curl -s http://localhost:3000          # → HTML response
```

## Troubleshooting
| Problem | Fix |
|---------|-----|
| Port 3001 in use | `lsof -i :3001` → kill process or change `PORT` in `.env` |
| Port 3000 in use | `lsof -i :3000` → kill process |
| Prisma client error | `cd Backend && npx prisma generate` |
| DB empty / seed needed | `cd Backend && npx prisma migrate reset --force` (runs seed) |
| Redis connection refused | Check `docker compose ps` — redis must be healthy |
| `Cannot find module` | `rm -rf node_modules && npm install` in affected dir |

## Verify
- `docker compose ps` shows postgres + redis healthy
- Backend `/health` returns 200
- Frontend homepage loads in browser

## NEVER
- Run `docker compose up` without `-d` (blocks terminal)
- Skip health checks — start backend before DB is ready
- Use `npm start` instead of `npm run start:dev` (no hot reload)
- Run backend inside Docker during development (kills hot reload)
