# Add API Endpoint

## Purpose
Create a new NestJS REST endpoint with DTOs, validation, RBAC, pagination, and error handling.

## Steps

### 1. Generate Module + Controller + Service
```bash
cd Backend
nest g module {name}
nest g controller {name}
nest g service {name}
```

### 2. Create DTOs with Validation
```typescript
// src/{name}/dto/create-{name}.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateNameDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### 3. Create Controller with RBAC + Pagination
```typescript
@Controller('{name}')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NameController {
  constructor(private readonly service: NameService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateNameDto, @CurrentUser() user: UserPayload) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.service.findAll({ skip: (page - 1) * limit, take: limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateNameDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

### 4. Service with Error Handling
```typescript
@Injectable()
export class NameService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const item = await this.prisma.name.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`${id} not found`);
    return item;
  }

  async create(dto: CreateNameDto, userId: string) {
    const exists = await this.prisma.name.findFirst({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Already exists');
    return this.prisma.name.create({ data: { ...dto, createdById: userId } });
  }
}
```

### 5. Register in AppModule
Add `NameModule` to `imports` array in `app.module.ts`.

## Verify
```bash
npm run build                                    # compiles
curl -X POST http://localhost:3001/{name} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"test"}'                          # → 201
curl http://localhost:3001/{name}?page=1&limit=10 # → paginated list
```

## NEVER
- Skip DTO validation — always use class-validator
- Return raw Prisma errors to client
- Forget RBAC guard on mutation endpoints
- Use `@Query() query: any` — always type + validate query params
- Hardcode pagination defaults above 50
