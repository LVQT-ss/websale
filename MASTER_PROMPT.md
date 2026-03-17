# FLAVOR TEMPLATE — Master Prompt

Bạn là senior fullstack developer. Build cho tôi **FLAVOR TEMPLATE** — nền tảng bán template website chuyên nghiệp. Khách hàng có thể duyệt, xem demo, mua template, tải về source code, hoặc thuê team customize theo yêu cầu.

---

## Tổng quan sản phẩm

FLAVOR TEMPLATE giúp:
- Trưng bày và bán template website (Landing page, SaaS, E-commerce, Portfolio, Blog)
- Khách hàng xem live demo trước khi mua
- Thanh toán online (MoMo, chuyển khoản)
- Tải source code sau khi thanh toán
- Yêu cầu customize template (đổi màu, logo, nội dung, tính năng)
- Quản lý đơn hàng, doanh thu, khách hàng

---

## Tech Stack — BẮT BUỘC

```
Backend:   NestJS 10 + Prisma + PostgreSQL 16 + Redis 7
Frontend:  Next.js (latest) + React + Tailwind 4
Admin UI:  shadcn/ui (luôn luôn)
Trang khách hàng: Minimalism theme (sạch, chuyên nghiệp, nhiều khoảng trắng)
Auth:      JWT httpOnly cookies + refresh token
Thanh toán: MoMo + Chuyển khoản ngân hàng
Lưu trữ:  Cloudflare R2 (file template zip) hoặc S3
Email:     Resend hoặc SMTP (gửi link tải sau mua)
```

---

## RBAC — 3 Vai trò

```
ADMIN (Chủ shop template)
  ✅ Toàn quyền: templates, danh mục, đơn hàng, khách hàng, customize, tài chính, cài đặt
  ✅ Quản lý STAFF

STAFF (Nhân viên)
  ✅ Quản lý templates (thêm, sửa, upload file)
  ✅ Xử lý đơn customize
  ✅ Hỗ trợ khách hàng
  ❌ KHÔNG xem doanh thu, KHÔNG quản lý nhân viên, KHÔNG sửa cài đặt

CUSTOMER (Khách hàng)
  ✅ Duyệt template, xem demo, xem giá
  ✅ Mua template, tải source code
  ✅ Yêu cầu customize
  ✅ Xem lịch sử mua, đơn customize
  ❌ KHÔNG truy cập admin
```

---

## Database Schema — Prisma

```prisma
enum UserRole {
  ADMIN
  STAFF
  CUSTOMER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
}

enum TemplateCategory {
  LANDING_PAGE
  SAAS
  ECOMMERCE
  PORTFOLIO
  BLOG
  DASHBOARD
  OTHER
}

enum TemplateTech {
  NEXTJS
  REACT
  VUE
  HTML_CSS
  ASTRO
  WORDPRESS
}

enum OrderStatus {
  PENDING
  PAID
  COMPLETED
  CANCELLED
  REFUNDED
}

enum CustomizeStatus {
  PENDING
  QUOTED
  ACCEPTED
  IN_PROGRESS
  REVIEW
  REVISION
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  MOMO
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String?    @map("password_hash")
  fullName     String     @map("full_name")
  avatar       String?
  phone        String?
  role         UserRole   @default(CUSTOMER)
  status       UserStatus @default(ACTIVE)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  orders            Order[]
  payments          Payment[]
  customizeRequests CustomizeRequest[]
  reviews           TemplateReview[]
  downloads         DownloadLog[]
  wishlist          Wishlist[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @unique @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("refresh_tokens")
}

model Template {
  id          String @id @default(cuid())
  slug        String @unique
  name        String
  description String @db.Text
  shortDesc   String @map("short_desc")

  category TemplateCategory
  tech     TemplateTech

  price         Decimal  @db.Decimal(15, 2)
  originalPrice Decimal? @map("original_price") @db.Decimal(15, 2)
  currency      String   @default("VND")

  // Hình ảnh
  thumbnail   String
  images      String[]
  demoUrl     String   @map("demo_url")

  // File
  fileUrl     String  @map("file_url")      // URL tới file zip trên R2/S3
  fileSize    Int     @map("file_size")      // Kích thước bytes
  version     String  @default("1.0.0")

  // SEO
  metaTitle   String? @map("meta_title")
  metaDesc    String? @map("meta_desc")

  // Thông tin thêm
  features    String[]                        // ["Responsive", "Dark mode", "SEO ready"]
  pages       Int      @default(1)            // Số trang trong template
  isActive    Boolean  @default(true) @map("is_active")
  isFeatured  Boolean  @default(false) @map("is_featured")
  sortOrder   Int      @default(0) @map("sort_order")

  // Thống kê
  viewCount     Int @default(0) @map("view_count")
  purchaseCount Int @default(0) @map("purchase_count")
  avgRating     Decimal @default(0) @map("avg_rating") @db.Decimal(3, 2)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  orderItems        OrderItem[]
  reviews           TemplateReview[]
  customizeRequests CustomizeRequest[]
  wishlist          Wishlist[]
  downloads         DownloadLog[]

  @@index([category])
  @@index([tech])
  @@index([isActive])
  @@index([isFeatured])
  @@map("templates")
}

model Order {
  id          String @id @default(cuid())
  orderNumber String @unique @map("order_number")
  userId      String @map("user_id")

  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @map("total_amount") @db.Decimal(15, 2)
  currency    String      @default("VND")

  // Snapshot thông tin khách
  customerEmail String @map("customer_email")
  customerName  String @map("customer_name")

  paidAt      DateTime? @map("paid_at")
  completedAt DateTime? @map("completed_at")
  cancelledAt DateTime? @map("cancelled_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user     User        @relation(fields: [userId], references: [id])
  items    OrderItem[]
  payments Payment[]

  @@index([userId])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id         String @id @default(cuid())
  orderId    String @map("order_id")
  templateId String @map("template_id")

  // Snapshot tại thời điểm mua
  templateName String  @map("template_name")
  unitPrice    Decimal @map("unit_price") @db.Decimal(15, 2)

  order    Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  template Template @relation(fields: [templateId], references: [id])

  @@index([orderId])
  @@map("order_items")
}

model Payment {
  id      String @id @default(cuid())
  orderId String @map("order_id")
  userId  String @map("user_id")

  amount   Decimal       @db.Decimal(15, 2)
  method   PaymentMethod
  status   PaymentStatus @default(PENDING)
  currency String        @default("VND")

  // Gateway
  momoTransId    String? @map("momo_trans_id")
  bankTransRef   String? @map("bank_trans_ref")
  receiptImage   String? @map("receipt_image")

  // Xác nhận (cho chuyển khoản)
  confirmedById String?   @map("confirmed_by_id")
  confirmedAt   DateTime? @map("confirmed_at")

  paidAt    DateTime? @map("paid_at")
  createdAt DateTime  @default(now()) @map("created_at")

  order Order @relation(fields: [orderId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@index([orderId])
  @@index([status])
  @@map("payments")
}

model DownloadLog {
  id         String @id @default(cuid())
  userId     String @map("user_id")
  templateId String @map("template_id")
  orderId    String @map("order_id")

  ipAddress String @map("ip_address")
  userAgent String @map("user_agent")

  downloadedAt DateTime @default(now()) @map("downloaded_at")

  user     User     @relation(fields: [userId], references: [id])
  template Template @relation(fields: [templateId], references: [id])

  @@index([userId])
  @@index([templateId])
  @@map("download_logs")
}

model TemplateReview {
  id         String @id @default(cuid())
  userId     String @map("user_id")
  templateId String @map("template_id")

  rating  Int           // 1-5 sao
  content String @db.Text
  isApproved Boolean @default(false) @map("is_approved")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user     User     @relation(fields: [userId], references: [id])
  template Template @relation(fields: [templateId], references: [id])

  @@unique([userId, templateId])
  @@map("template_reviews")
}

model Wishlist {
  id         String @id @default(cuid())
  userId     String @map("user_id")
  templateId String @map("template_id")

  createdAt DateTime @default(now()) @map("created_at")

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  template Template @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@unique([userId, templateId])
  @@map("wishlists")
}

model CustomizeRequest {
  id            String @id @default(cuid())
  requestNumber String @unique @map("request_number")
  userId        String @map("user_id")
  templateId    String @map("template_id")

  // Yêu cầu
  requirements String @db.Text  // Mô tả chi tiết khách muốn sửa gì
  referenceUrls String[] @map("reference_urls")  // Link tham khảo

  // Báo giá
  quotedPrice Decimal? @map("quoted_price") @db.Decimal(15, 2)
  quotedDays  Int?     @map("quoted_days")   // Số ngày ước tính

  status CustomizeStatus @default(PENDING)

  // Giao hàng
  deliveryUrl  String? @map("delivery_url")
  deliveryNote String? @map("delivery_note") @db.Text

  // Admin
  assignedTo String? @map("assigned_to")
  adminNote  String? @map("admin_note") @db.Text

  completedAt DateTime? @map("completed_at")
  cancelledAt DateTime? @map("cancelled_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user     User     @relation(fields: [userId], references: [id])
  template Template @relation(fields: [templateId], references: [id])
  messages CustomizeMessage[]

  @@index([userId])
  @@index([status])
  @@map("customize_requests")
}

model CustomizeMessage {
  id        String @id @default(cuid())
  requestId String @map("request_id")
  senderId  String @map("sender_id")
  senderType String @map("sender_type")  // CUSTOMER, STAFF, ADMIN

  content     String @db.Text
  attachments Json?

  createdAt DateTime @default(now()) @map("created_at")

  request CustomizeRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@index([requestId])
  @@map("customize_messages")
}

model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value Json

  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("settings")
}
```

---

## Tất cả trang cần build

### Admin Panel — prefix `/admin`

```
/admin                           Dashboard (doanh thu, đơn hôm nay, top templates)
/admin/templates                 Quản lý templates (CRUD + upload file + upload ảnh)
/admin/templates/new             Thêm template mới
/admin/templates/[id]/edit       Sửa template
/admin/orders                    Tất cả đơn hàng
/admin/orders/[id]               Chi tiết đơn hàng
/admin/payments                  Thanh toán (xác nhận chuyển khoản)
/admin/customize                 Yêu cầu customize từ khách
/admin/customize/[id]            Chi tiết + chat + báo giá + giao hàng
/admin/reviews                   Duyệt đánh giá
/admin/customers                 Danh sách khách hàng
/admin/reports                   Báo cáo doanh thu, top templates
/admin/staff                     Quản lý nhân viên
/admin/settings                  Cài đặt (tên shop, logo, bank, email)
```

### Trang khách hàng — giao diện Minimalism

```
/                                Trang chủ (hero, featured, danh mục, CTA)
/templates                       Duyệt templates (filter category, tech, giá)
/templates/[slug]                Chi tiết template (ảnh, demo, features, giá, reviews)
/templates/[slug]/demo           Iframe xem demo live
/cart                            Giỏ hàng
/checkout                        Thanh toán (MoMo / chuyển khoản)
/login                           Đăng nhập
/register                        Đăng ký
/forgot-password                 Quên mật khẩu
/account                         Dashboard khách hàng
/account/orders                  Lịch sử mua + nút tải về
/account/orders/[id]             Chi tiết đơn + link tải
/account/downloads               Tất cả template đã mua (tải lại)
/account/customize               Yêu cầu customize đã gửi
/account/customize/new           Tạo yêu cầu customize mới
/account/customize/[id]          Chi tiết + chat với team
/account/wishlist                Danh sách yêu thích
/account/profile                 Hồ sơ cá nhân
```

---

## Logic nghiệp vụ

### Luồng 1: Mua template
```
Khách chọn template → Thêm giỏ hàng → Checkout
  → Chọn thanh toán: MoMo hoặc Chuyển khoản
  → MoMo: Redirect → callback → Tạo đơn PAID → Mở link tải
  → Chuyển khoản: Tạo đơn PENDING → Upload biên lai → Admin xác nhận → PAID → Mở link tải
  → Khi PAID: tăng template.purchaseCount, gửi email kèm link tải
```

### Luồng 2: Tải template
```
Khách vào /account/downloads → Thấy danh sách template đã mua
  → Bấm "Tải về" → Backend kiểm tra: đơn PAID? → Tạo signed URL (hết hạn 1 giờ) → Redirect tải
  → Ghi DownloadLog (ip, user-agent, thời gian)
  → KHÔNG cho tải nếu đơn chưa PAID hoặc bị REFUNDED
```

### Luồng 3: Customize
```
Khách chọn template → Bấm "Yêu cầu customize"
  → Mô tả yêu cầu + đính kèm ảnh tham khảo
  → STAFF nhận → Báo giá (quotedPrice + quotedDays)
  → Khách đồng ý → Thanh toán → STAFF làm → Gửi review → Khách duyệt
  → Nếu cần sửa → REVISION (tối đa 3 lần miễn phí)
  → Khách OK → COMPLETED → Giao link + file
```

### Luồng 4: Đánh giá
```
Chỉ khách đã mua mới được đánh giá (kiểm tra có order PAID cho template này)
  → Gửi đánh giá (1-5 sao + nội dung)
  → Admin/Staff duyệt (isApproved = true) → Hiển thị trên trang template
  → Cập nhật template.avgRating
```

### Luồng 5: Wishlist
```
Khách bấm ♡ trên template → Toggle wishlist
  → Đã thích → bỏ thích (xóa record)
  → Chưa thích → thêm thích (tạo record)
  → Xem tất cả ở /account/wishlist
```

---

## API Endpoints

### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
```

### Templates (public + admin)
```
GET    /templates                   (public: filter category, tech, giá, tìm kiếm)
GET    /templates/:slug             (public: chi tiết)
GET    /templates/featured          (public: templates nổi bật)
POST   /templates                   (ADMIN/STAFF: tạo mới)
PATCH  /templates/:id               (ADMIN/STAFF: sửa)
DELETE /templates/:id               (ADMIN: xóa)
POST   /templates/:id/upload-file   (ADMIN/STAFF: upload zip)
POST   /templates/:id/upload-images (ADMIN/STAFF: upload ảnh)
```

### Orders
```
POST   /orders                      (CUSTOMER: tạo đơn từ giỏ hàng)
GET    /orders                      (CUSTOMER: đơn của mình / ADMIN: tất cả)
GET    /orders/:id                  (chi tiết)
GET    /orders/:id/download/:templateId  (CUSTOMER: lấy link tải)
```

### Payments
```
POST   /payments/momo               (tạo thanh toán MoMo)
POST   /payments/momo/callback      (webhook MoMo)
POST   /payments/bank-transfer      (ghi nhận chuyển khoản + upload biên lai)
PATCH  /payments/:id/confirm        (ADMIN/STAFF: xác nhận)
```

### Reviews
```
GET    /templates/:id/reviews       (public: đánh giá đã duyệt)
POST   /templates/:id/reviews       (CUSTOMER: gửi đánh giá — phải đã mua)
PATCH  /reviews/:id/approve         (ADMIN/STAFF: duyệt)
DELETE /reviews/:id                  (ADMIN: xóa)
```

### Wishlist
```
GET    /wishlist                     (CUSTOMER: danh sách yêu thích)
POST   /wishlist/:templateId         (CUSTOMER: thêm)
DELETE /wishlist/:templateId         (CUSTOMER: bỏ)
```

### Customize
```
POST   /customize                    (CUSTOMER: tạo yêu cầu)
GET    /customize                    (CUSTOMER: của mình / ADMIN: tất cả)
GET    /customize/:id                (chi tiết)
PATCH  /customize/:id/quote          (STAFF: báo giá)
PATCH  /customize/:id/accept         (CUSTOMER: đồng ý báo giá)
PATCH  /customize/:id/deliver        (STAFF: giao hàng)
PATCH  /customize/:id/approve        (CUSTOMER: duyệt xong)
PATCH  /customize/:id/revision       (CUSTOMER: yêu cầu sửa)
PATCH  /customize/:id/cancel         (hủy)
POST   /customize/:id/messages       (gửi tin nhắn)
GET    /customize/:id/messages       (lịch sử chat)
```

### Reports (ADMIN)
```
GET    /reports/revenue              (doanh thu theo khoảng thời gian)
GET    /reports/templates            (top templates bán chạy)
GET    /reports/customers            (top khách hàng)
```

### Settings (ADMIN)
```
GET    /settings
PATCH  /settings
```

### Staff (ADMIN)
```
GET    /staff
POST   /staff
PATCH  /staff/:id
DELETE /staff/:id
```

---

## Dữ liệu mẫu (Seed)

```typescript
// Tài khoản
{ email: "admin@flavor.vn", fullName: "Admin Flavor", role: "ADMIN", password: "Admin@123" }
{ email: "staff@flavor.vn", fullName: "Nhân viên 1", role: "STAFF", password: "Staff@123" }
{ email: "khach@gmail.com", fullName: "Nguyễn Văn Khách", role: "CUSTOMER", password: "Customer@123" }

// Templates (8 mẫu)
{ name: "SaaS Starter", category: "SAAS", tech: "NEXTJS", price: 499000, features: ["Responsive", "Dark mode", "Auth", "Dashboard", "Pricing page"] }
{ name: "Portfolio Minimal", category: "PORTFOLIO", tech: "NEXTJS", price: 299000, features: ["Responsive", "Animation", "Contact form"] }
{ name: "E-Shop Pro", category: "ECOMMERCE", tech: "NEXTJS", price: 799000, features: ["Cart", "Checkout", "Admin", "SEO", "i18n"] }
{ name: "Blog Clean", category: "BLOG", tech: "ASTRO", price: 199000, features: ["MDX", "SEO", "RSS", "Dark mode"] }
{ name: "Landing Starter", category: "LANDING_PAGE", tech: "HTML_CSS", price: 149000, features: ["Responsive", "Fast", "SEO ready"] }
{ name: "Admin Dashboard", category: "DASHBOARD", tech: "REACT", price: 599000, features: ["Charts", "Tables", "RBAC", "Dark mode"] }
{ name: "Agency Landing", category: "LANDING_PAGE", tech: "NEXTJS", price: 349000, isFeatured: true, features: ["Parallax", "Animation", "CMS"] }
{ name: "Vue Commerce", category: "ECOMMERCE", tech: "VUE", price: 699000, features: ["Vuex", "Cart", "Stripe", "Admin"] }

// Đơn hàng mẫu (đủ trạng thái)
{ orderNumber: "FT-20260316-001", status: "COMPLETED", customer: "khach@gmail.com", template: "SaaS Starter" }
{ orderNumber: "FT-20260316-002", status: "PENDING", customer: "khach@gmail.com", template: "Blog Clean" }

// Đánh giá mẫu
{ template: "SaaS Starter", user: "khach@gmail.com", rating: 5, content: "Template rất đẹp, code sạch", isApproved: true }

// Yêu cầu customize mẫu
{ template: "E-Shop Pro", user: "khach@gmail.com", status: "IN_PROGRESS", requirements: "Đổi màu sang xanh, thêm trang About" }
```

---

## Thứ tự build

```
Phase 1: Nền tảng
  1. Init Backend (NestJS + Prisma + PostgreSQL)
  2. Init Frontend (Next.js + Tailwind + shadcn cho admin)
  3. Database schema + migrations + seed
  4. Auth (đăng ký, đăng nhập, JWT, RBAC guards)
  5. Layout: Admin (shadcn) + Trang khách (Minimalism)

Phase 2: Sản phẩm
  6. Templates CRUD (admin)
  7. Upload file zip + ảnh (R2/S3)
  8. Trang duyệt templates (khách)
  9. Trang chi tiết + iframe demo
  10. Tìm kiếm + filter

Phase 3: Mua bán
  11. Giỏ hàng (Zustand store)
  12. Checkout + thanh toán MoMo
  13. Thanh toán chuyển khoản + admin xác nhận
  14. Tải template (signed URL + download log)
  15. Email xác nhận mua hàng

Phase 4: Tương tác
  16. Đánh giá (chỉ khách đã mua)
  17. Wishlist
  18. Yêu cầu customize + chat + báo giá

Phase 5: Vận hành
  19. Dashboard admin (biểu đồ, thống kê)
  20. Dashboard khách hàng
  21. Báo cáo doanh thu + top templates
  22. Cài đặt hệ thống

Phase 6: Hoàn thiện
  23. SEO (meta tags, sitemap, structured data)
  24. Mobile responsive
  25. Performance (lazy load, image optimization)
  26. Kiểm tra bảo mật
```

---

## Phong cách giao diện

```
Admin:  shadcn/ui (luôn luôn)
Khách:  Minimalism theme
  - Màu chính: Đen (#000) + Trắng (#FFF) + 1 accent (Indigo #4F46E5)
  - Font: Inter, light weight, nhiều khoảng trắng
  - Card: Viền mỏng 1px, không shadow, padding lớn
  - Nút: Outlined hoặc ghost, hover đổi màu nhẹ
  - Ảnh: Rounded nhẹ (rounded-lg), không bóng đổ
  - Khoảng cách: Rộng rãi, thoáng, section padding 80-120px
  - Tham khảo: Linear.app, Vercel.com, Notion.so
```
