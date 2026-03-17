# Skill: Monitoring & Logging (Sentry + Structured Logging)

## Khi nào dùng
Khi cần theo dõi lỗi production realtime và ghi log có cấu trúc để debug.

## Bước thực hiện

### 1. Backend — Structured logging với nestjs-pino

Đã có sẵn trong stack. Cấu hình trong `app.module.ts`:
```typescript
import { LoggerModule } from 'nestjs-pino';

LoggerModule.forRoot({
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, userId: req.user?.id }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  },
}),
```

Trong service, dùng logger:
```typescript
import { Logger } from '@nestjs/common';

private readonly logger = new Logger(OrdersService.name);

async createOrder(dto) {
  this.logger.log({ shopId: dto.shopId, items: dto.items.length }, 'Tạo đơn hàng mới');
  // ...
  this.logger.warn({ shopId, currentDebt, creditLimit }, 'Vượt hạn mức nợ');
  this.logger.error({ orderId, error: err.message }, 'Lỗi tạo đơn hàng');
}
```

### 2. Backend — Sentry cho error tracking

Cài đặt:
```bash
cd Backend
npm install @sentry/node
```

Thêm vào `main.ts` (trước mọi thứ khác):
```typescript
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}
```

Tạo global exception filter:
```typescript
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (!(exception instanceof HttpException) || (exception as HttpException).getStatus() >= 500) {
      Sentry.captureException(exception);
    }
    // ... trả về response bình thường
  }
}
```

### 3. Frontend — Sentry cho error tracking

Cài đặt:
```bash
cd Frontend
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Tạo `sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01, // Ghi lại 1% session
});
```

### 4. Biến môi trường cần thêm
```
# Backend
SENTRY_DSN=                             # Lấy từ Sentry dashboard
LOG_LEVEL=info                          # debug, info, warn, error

# Frontend
NEXT_PUBLIC_SENTRY_DSN=                 # Lấy từ Sentry dashboard
```

### 5. Quy tắc logging

| Mức | Khi nào dùng | Ví dụ |
|-----|-------------|-------|
| `debug` | Chi tiết chỉ cần khi debug | Query params, cache hit/miss |
| `info` | Sự kiện nghiệp vụ bình thường | Đơn hàng tạo, thanh toán thành công |
| `warn` | Bất thường nhưng không lỗi | Vượt hạn mức, retry lần 2 |
| `error` | Lỗi thật sự | Exception, timeout, kết nối DB mất |

### 6. Health check endpoint

Đã có sẵn trong stack. Verify:
```bash
curl http://localhost:3001/api/v1/health
```

Cho production, thêm kiểm tra DB + Redis:
```typescript
@Get('health')
async health() {
  const dbOk = await this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  const redisOk = await this.redis.ping().then(() => true).catch(() => false);
  return {
    status: dbOk && redisOk ? 'ok' : 'degraded',
    db: dbOk ? 'connected' : 'disconnected',
    redis: redisOk ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  };
}
```

## Kiểm tra
- Cố ý throw error → kiểm tra Sentry dashboard có nhận được không
- Kiểm tra log output có đúng format JSON trong production
- Gọi `/health` → trả về trạng thái DB + Redis

## KHÔNG ĐƯỢC
- Dùng `console.log` trong production (dùng Logger)
- Log dữ liệu nhạy cảm (mật khẩu, token, số thẻ)
- Gửi MỌI exception lên Sentry (chỉ gửi 5xx, bỏ qua 4xx)
- Để `tracesSampleRate: 1.0` trên production (tốn quota, dùng 0.1)
- Bỏ qua health check — đây là cách monitoring biết service còn sống
