# Docker Setup

## Purpose
Configure Docker for dev (DB + cache only) and production (full stack).

## Dev Setup (docker-compose.yml)
Backend runs locally for hot reload. Only infra services in Docker.

```yaml
# docker-compose.yml (dev)
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5433:5432"]
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-appdb}
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

## Production Setup (docker-compose.prod.yml)
```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      retries: 5

  api:
    build: ./Backend
    ports: ["3001:3001"]
    env_file: .env.production
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }

volumes:
  pgdata:
```

## Dockerfile (Backend — multi-stage)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/main"]
```

## .dockerignore
```
node_modules
dist
.git
.env
*.md
```

## Verify
```bash
docker compose up -d
docker compose ps                                    # both healthy
curl http://localhost:3001/health                     # after starting backend
docker compose down -v                               # clean shutdown
```

## NEVER
- Run backend in Docker during development (kills hot reload)
- Expose Postgres port 5432 in dev (use 5433 to avoid conflicts)
- Store secrets in docker-compose files — use `.env`
- Skip health checks — services must be healthy before dependents start
- Use `latest` tag for postgres/redis images — pin major versions
