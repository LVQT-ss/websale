# Seed Data

## Purpose
Create realistic, comprehensive seed data covering all roles, statuses, and edge cases.

## Rules
Every seed MUST include:
- **1 user per role** (admin, staff, customer, etc.)
- **1 record per status enum** (ACTIVE, INACTIVE, ARCHIVED, etc.)
- **Edge case data**: zero values, max length strings, empty optional fields
- **Relationships**: records linked to different users/parents

## Template Structure
```typescript
// Backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Clean (reverse dependency order)
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users — one per role
  const hashedPassword = await bcrypt.hash('Test1234!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@test.com',
      name: 'Staff User',
      password: hashedPassword,
      role: 'STAFF',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      name: 'Customer User',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  });

  // 3. Records — one per status, linked to different users
  await prisma.product.createMany({
    data: [
      { name: 'Active Product', price: 100000, status: 'ACTIVE', createdById: admin.id },
      { name: 'Inactive Product', price: 0, status: 'INACTIVE', createdById: staff.id },
      { name: 'Archived Product', price: 999999999, status: 'ARCHIVED', createdById: admin.id },
      { name: '', price: 1, status: 'ACTIVE', createdById: staff.id }, // edge: empty name
    ],
  });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

## When to Update Seed
- After adding a new model → add seed data for it
- After adding a new enum value → add a record with that value
- After adding a new role → add a user with that role
- After changing required fields → update existing seed records

## Verify
```bash
cd Backend
npx prisma migrate reset --force   # drops DB + migrates + seeds
npx prisma studio                  # visual check: all tables populated
npm run test                       # tests pass with fresh seed
```

## NEVER
- Hardcode IDs (use cuid or let Prisma auto-generate)
- Use real emails, passwords, or phone numbers
- Skip edge case data (0 values, empty strings, max values)
- Leave seed out of sync with schema
- Use `upsert` in seed — always clean + recreate
- Forget to hash passwords with bcrypt
