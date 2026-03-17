# Luồng nghiệp vụ — FLAVOR TEMPLATE

---

## Luồng 1: Mua template

```
Khách duyệt templates → Chọn template → Thêm giỏ hàng
  → Giỏ hàng (có thể thêm nhiều template)
  → Bấm "Thanh toán" → Chuyển sang trang Checkout
  → Chọn phương thức thanh toán:

  [MoMo]
    → Tạo Payment (status: PENDING, method: MOMO)
    → Redirect tới MoMo gateway
    → Khách thanh toán trên MoMo
    → MoMo gọi callback webhook
    → Nếu thành công:
      → Payment.status = SUCCESS
      → Order.status = PAID
      → Order.paidAt = now()
      → Template.purchaseCount += 1 (cho mỗi template trong đơn)
      → Gửi email xác nhận + link tải
    → Nếu thất bại:
      → Payment.status = FAILED
      → Order giữ PENDING
      → Hiện thông báo lỗi cho khách

  [Chuyển khoản ngân hàng]
    → Tạo Payment (status: PENDING, method: BANK_TRANSFER)
    → Tạo Order (status: PENDING)
    → Hiện thông tin chuyển khoản (số TK, ngân hàng, nội dung CK)
    → Khách chuyển khoản → Upload biên lai (receiptImage)
    → Admin/Staff vào /admin/payments → Thấy đơn chờ xác nhận
    → Admin/Staff bấm "Xác nhận":
      → Payment.status = SUCCESS
      → Payment.confirmedById = admin/staff ID
      → Payment.confirmedAt = now()
      → Order.status = PAID
      → Order.paidAt = now()
      → Template.purchaseCount += 1
      → Gửi email xác nhận + link tải
    → Admin/Staff bấm "Từ chối":
      → Payment.status = FAILED
      → Order giữ PENDING
      → Gửi email thông báo cho khách

Trường hợp đặc biệt:
  - Khách mua template đã mua trước đó → Chặn, hiện "Bạn đã sở hữu template này"
  - Đơn PENDING quá 48h không thanh toán → Tự động hủy (CANCELLED)
```

---

## Luồng 2: Tải template

```
Khách đăng nhập → Vào /account/downloads
  → Hiện danh sách tất cả template đã mua (từ Order có status PAID/COMPLETED)
  → Bấm "Tải về" trên template cụ thể

Backend xử lý:
  1. Kiểm tra authentication (phải đăng nhập)
  2. Kiểm tra Order: có đơn PAID/COMPLETED cho template này không?
  3. Nếu KHÔNG → 403 Forbidden "Bạn chưa mua template này"
  4. Nếu đơn REFUNDED → 403 Forbidden "Đơn hàng đã hoàn tiền"
  5. Nếu OK:
     → Tạo signed URL từ R2/S3 (hết hạn sau 1 giờ)
     → Ghi DownloadLog (userId, templateId, orderId, ipAddress, userAgent)
     → Redirect khách tới signed URL → Bắt đầu tải

Trường hợp đặc biệt:
  - Signed URL hết hạn → Khách bấm tải lại → Tạo signed URL mới
  - Template bị ADMIN gỡ (isActive = false) → Khách vẫn tải được (đã mua rồi)
  - Giới hạn tải: Không giới hạn số lần (khách mua = sở hữu vĩnh viễn)
```

---

## Luồng 3: Yêu cầu Customize

```
Khách vào trang chi tiết template → Bấm "Yêu cầu Customize"
  → Chuyển tới /account/customize/new
  → Điền form:
    - Chọn template gốc
    - Mô tả yêu cầu chi tiết (requirements)
    - Đính kèm link tham khảo (referenceUrls)
  → Submit → Tạo CustomizeRequest (status: PENDING)

[PENDING → QUOTED]
  Admin/Staff nhận yêu cầu mới
  → Vào /admin/customize/[id]
  → Đọc yêu cầu, trao đổi qua chat nếu cần
  → Báo giá: nhập quotedPrice + quotedDays (số ngày ước tính)
  → Status chuyển sang QUOTED
  → Gửi notification cho khách

[QUOTED → ACCEPTED]
  Khách xem báo giá tại /account/customize/[id]
  → Đồng ý → Status = ACCEPTED
  → Không đồng ý → Có thể chat thương lượng hoặc CANCEL

[ACCEPTED → IN_PROGRESS]
  Admin assign cho Staff (assignedTo)
  → Staff bắt đầu làm → Status = IN_PROGRESS

[IN_PROGRESS → REVIEW]
  Staff hoàn thành → Upload deliveryUrl + deliveryNote
  → Status = REVIEW
  → Gửi notification cho khách xem kết quả

[REVIEW → COMPLETED hoặc REVISION]
  Khách xem kết quả:
  → Hài lòng → Bấm "Duyệt" → Status = COMPLETED → completedAt = now()
  → Cần sửa → Bấm "Yêu cầu sửa" → Status = REVISION
    → Mô tả cần sửa gì
    → Staff sửa → Gửi lại → REVIEW
    → Lặp lại (tối đa 3 lần REVISION miễn phí)
    → Lần thứ 4+ → Tính phí thêm (báo giá mới)

[CANCEL]
  Khách hoặc Admin có thể hủy bất cứ lúc nào trước COMPLETED
  → Status = CANCELLED → cancelledAt = now()

Chat:
  - Cả 2 bên (CUSTOMER + STAFF/ADMIN) có thể gửi tin nhắn bất cứ lúc nào
  - Tin nhắn hỗ trợ đính kèm (attachments: JSON)
  - Hiển thị theo thứ tự thời gian tại /admin/customize/[id] và /account/customize/[id]
```

---

## Luồng 4: Đánh giá template

```
Điều kiện: Khách phải có Order PAID/COMPLETED chứa template này
  → Kiểm tra: SELECT FROM orders JOIN order_items WHERE userId = ? AND templateId = ? AND status IN ('PAID', 'COMPLETED')

Khách vào trang chi tiết template → Phần đánh giá
  → Nếu chưa mua → Ẩn form, hiện "Mua template để đánh giá"
  → Nếu đã mua + đã đánh giá → Hiện đánh giá của mình (không cho đánh giá lại)
  → Nếu đã mua + chưa đánh giá → Hiện form:
    - Rating: 1-5 sao
    - Nội dung (content)
  → Submit → Tạo TemplateReview (isApproved: false)

Admin/Staff duyệt:
  → Vào /admin/reviews → Thấy danh sách đánh giá chờ duyệt
  → Đọc nội dung → Bấm "Duyệt" → isApproved = true
  → Hoặc "Xóa" nếu spam/vi phạm (chỉ ADMIN)

Sau khi duyệt:
  → Đánh giá hiển thị trên trang chi tiết template
  → Cập nhật template.avgRating = AVG(rating) từ tất cả review đã duyệt

Trường hợp đặc biệt:
  - Mỗi khách chỉ đánh giá 1 lần/template (unique constraint: userId + templateId)
  - Đánh giá chưa duyệt không hiển thị public
```

---

## Luồng 5: Wishlist

```
Khách đăng nhập → Vào trang duyệt templates hoặc trang chi tiết

[Thêm vào wishlist]
  → Bấm icon ♡ (trái tim rỗng) trên template card hoặc trang chi tiết
  → Tạo Wishlist record (userId + templateId)
  → Icon chuyển thành ♥ (trái tim đầy)

[Bỏ khỏi wishlist]
  → Bấm icon ♥ (trái tim đầy)
  → Xóa Wishlist record
  → Icon chuyển lại ♡

[Xem wishlist]
  → Vào /account/wishlist
  → Hiện danh sách template đã yêu thích
  → Mỗi card có nút "Thêm giỏ hàng" và nút ♥ để bỏ thích

Trường hợp đặc biệt:
  - Khách chưa đăng nhập bấm ♡ → Redirect tới /login
  - Template bị gỡ (isActive = false) → Tự động xóa khỏi wishlist (onDelete: Cascade)
  - Unique constraint: userId + templateId → Không thêm trùng
```

---

## Luồng 6: Xác thực (Auth)

```
[Đăng ký]
  → /register → Nhập email, fullName, password, phone (optional)
  → Backend: kiểm tra email chưa tồn tại → Hash password → Tạo User (role: CUSTOMER)
  → Tự động đăng nhập → Trả JWT access token + refresh token (httpOnly cookie)

[Đăng nhập]
  → /login → Nhập email + password
  → Backend: kiểm tra email tồn tại → So sánh password hash
  → Nếu user.status = BANNED → 403 "Tài khoản bị khóa"
  → Nếu OK → Tạo access token (15 phút) + refresh token (7 ngày)
  → Lưu refresh token vào DB (RefreshToken table) + httpOnly cookie

[Refresh token]
  → Access token hết hạn → Frontend tự gọi POST /auth/refresh
  → Backend: kiểm tra refresh token hợp lệ + chưa hết hạn
  → Tạo access token mới + refresh token mới (xoay token)
  → Xóa refresh token cũ trong DB

[Đăng xuất]
  → POST /auth/logout
  → Xóa refresh token trong DB
  → Xóa httpOnly cookie

[Lấy thông tin user]
  → GET /auth/me (cần access token)
  → Trả về user info (id, email, fullName, role, avatar, phone)

Trường hợp đặc biệt:
  - ADMIN và STAFF được tạo bởi ADMIN (không tự đăng ký)
  - Refresh token chỉ cho 1 device (userId: @unique)
  - Quên mật khẩu → /forgot-password → Gửi email reset link
```

---

## Luồng 7: Quản lý nhân viên

```
Chỉ ADMIN mới truy cập được

[Thêm nhân viên]
  → /admin/staff → Bấm "Thêm nhân viên"
  → Nhập: email, fullName, phone, password tạm
  → Tạo User (role: STAFF, status: ACTIVE)
  → Gửi email thông báo cho nhân viên mới

[Sửa nhân viên]
  → Sửa thông tin (fullName, phone, status)
  → Chuyển status INACTIVE = vô hiệu hóa (không xóa dữ liệu)

[Xóa nhân viên]
  → Soft delete: chuyển status = INACTIVE
  → KHÔNG hard delete (giữ lại lịch sử xử lý đơn)
```

---

## Luồng 8: Dashboard & Báo cáo

```
[Admin Dashboard — /admin]
  → Tổng doanh thu hôm nay / tuần / tháng
  → Số đơn hàng mới (PENDING)
  → Số yêu cầu customize chờ xử lý
  → Top 5 templates bán chạy
  → Biểu đồ doanh thu 7 ngày gần nhất

[Báo cáo doanh thu — /admin/reports]
  → Filter theo khoảng thời gian
  → Biểu đồ doanh thu theo ngày/tuần/tháng
  → Tổng hợp: tổng đơn, tổng doanh thu, đơn trung bình

[Top templates — /admin/reports]
  → Sắp xếp theo: doanh thu, số lượt mua, lượt xem, rating
  → Filter theo category, tech

[Top khách hàng — /admin/reports]
  → Sắp xếp theo: tổng chi tiêu, số đơn hàng
```
