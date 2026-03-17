# Skill: CI/CD (GitHub Actions)

## Khi nào dùng
Khi cần tạo pipeline tự động test + build + deploy mỗi khi push code.

## Bước thực hiện

### 1. Tạo file workflow cho Backend
Tạo `.github/workflows/backend-ci.yml`:
```yaml
name: Backend CI

on:
  push:
    paths: ['Backend/**']
  pull_request:
    paths: ['Backend/**']

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: test_password
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: Backend/package-lock.json

      - name: Cài dependencies
        run: npm ci
        working-directory: Backend

      - name: Tạo Prisma client
        run: npx prisma generate
        working-directory: Backend

      - name: Chạy migrations
        run: npx prisma migrate deploy
        working-directory: Backend
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db

      - name: Lint
        run: npm run lint:check
        working-directory: Backend

      - name: Typecheck
        run: npx tsc --noEmit
        working-directory: Backend

      - name: Unit tests
        run: npm run test
        working-directory: Backend
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db
          REDIS_HOST: localhost
          JWT_SECRET: test-secret

      - name: Build
        run: npm run build
        working-directory: Backend
```

### 2. Tạo file workflow cho Frontend
Tạo `.github/workflows/frontend-ci.yml`:
```yaml
name: Frontend CI

on:
  push:
    paths: ['Frontend/**']
  pull_request:
    paths: ['Frontend/**']

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: Frontend/package-lock.json

      - name: Cài dependencies
        run: npm ci
        working-directory: Frontend

      - name: Typecheck
        run: npx tsc --noEmit
        working-directory: Frontend

      - name: Lint
        run: npm run lint
        working-directory: Frontend

      - name: Build
        run: npm run build
        working-directory: Frontend
```

### 3. (Tuỳ chọn) Thêm job deploy tự động
```yaml
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Thêm bước deploy tùy theo hosting (Vercel, Docker, VPS)
```

## Kiểm tra
- Push code lên branch → vào tab Actions trên GitHub → thấy workflow chạy
- PR tạo mới → thấy check ✅/❌ trên PR

## Quy tắc
- CI PHẢI pass trước khi merge PR
- Không skip CI (`[skip ci]` chỉ dùng cho thay đổi docs thuần tuý)
- Nếu CI fail → sửa code, KHÔNG sửa CI để pass
- Secrets (DATABASE_URL, API keys) lưu trong GitHub Settings → Secrets

## KHÔNG ĐƯỢC
- Hardcode secrets trong file workflow
- Bỏ bước lint hoặc typecheck để CI chạy nhanh hơn
- Dùng `npm install` thay vì `npm ci` trong CI (ci nhanh hơn + deterministic)
- Deploy tự động từ branch khác main
