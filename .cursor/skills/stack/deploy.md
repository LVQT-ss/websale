# Deploy

## Purpose
Deploy backend (Docker) and frontend (Vercel or static) with safety checks and rollback plan.

## Pre-Deploy Checklist
- [ ] All tests pass (`run-tests` skill)
- [ ] Build succeeds locally
- [ ] `.env.production` configured and reviewed
- [ ] Migrations ready (`npx prisma migrate status`)
- [ ] Git tag created: `git tag -a v{X.Y.Z} -m "Release v{X.Y.Z}"`

## Backend Deploy

### 1. Build & Push Image
```bash
cd Backend
docker build -t {registry}/{app}-api:v{X.Y.Z} .
docker push {registry}/{app}-api:v{X.Y.Z}
```

### 2. Run Migrations on Production DB
```bash
DATABASE_URL="{prod_url}" npx prisma migrate deploy
```

### 3. Deploy Container
```bash
docker pull {registry}/{app}-api:v{X.Y.Z}
docker compose -f docker-compose.prod.yml up -d api
```

### 4. Post-Deploy Verification
```bash
# Health check (retry up to 30s)
for i in $(seq 1 6); do
  curl -sf https://{api-domain}/health && echo "✅ Healthy" && break
  sleep 5
done

# Monitor logs for 5 minutes
docker logs -f --since 5m {container_name}
```

## Frontend Deploy

### Option A: Vercel
```bash
cd Frontend
vercel --prod
```

### Option B: Static/Docker
```bash
cd Frontend
npm run build
# Upload .next/static or deploy via container
```

## Post-Deploy Verify
```bash
curl -sf https://{api-domain}/health           # → 200
curl -sf https://{app-domain}                  # → page loads
# Test login flow manually
# Check error monitoring dashboard (Sentry, etc.)
# Watch logs for 5 minutes for unexpected errors
```

## Rollback
```bash
# 1. Revert code
git revert HEAD
# 2. Rebuild + redeploy previous version
docker compose -f docker-compose.prod.yml up -d api
# 3. If migration caused issues: restore DB backup FIRST, then redeploy
```

## Verify
- Health endpoint returns 200
- Login flow works end-to-end
- Key API endpoints respond correctly
- Error logs clean for 5 minutes post-deploy

## NEVER
- Deploy without running migrations first
- Skip health check after deploy
- Deploy on Friday evening or before holidays
- Deploy without a DB backup
- Run `prisma migrate dev` on production (use `migrate deploy`)
- Deploy frontend and backend simultaneously — deploy backend first
