# RBAC — Bảng quyền chi tiết

## Vai trò

| Vai trò | Mô tả |
|---------|-------|
| ADMIN | Chủ shop template — toàn quyền |
| STAFF | Nhân viên — xử lý đơn, hỗ trợ khách, quản lý templates |
| CUSTOMER | Khách hàng — duyệt, mua, tải, yêu cầu customize |

---

## Bảng quyền

### Templates

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Xem danh sách templates (public) | ✅ | ✅ | ✅ |
| Xem chi tiết template (public) | ✅ | ✅ | ✅ |
| Xem demo template | ✅ | ✅ | ✅ |
| Tạo template mới | ✅ | ✅ | ❌ |
| Sửa template | ✅ | ✅ | ❌ |
| Xóa template | ✅ | ❌ | ❌ |
| Upload file zip | ✅ | ✅ | ❌ |
| Upload ảnh template | ✅ | ✅ | ❌ |

### Đơn hàng (Orders)

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Tạo đơn hàng | ❌ | ❌ | ✅ |
| Xem tất cả đơn hàng | ✅ | ✅ | ❌ |
| Xem đơn hàng của mình | ❌ | ❌ | ✅ |
| Xem chi tiết đơn hàng | ✅ | ✅ | ✅ (chỉ đơn của mình) |
| Tải template đã mua | ❌ | ❌ | ✅ (chỉ đơn PAID) |

### Thanh toán (Payments)

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Tạo thanh toán MoMo | ❌ | ❌ | ✅ |
| Upload biên lai chuyển khoản | ❌ | ❌ | ✅ |
| Xác nhận thanh toán chuyển khoản | ✅ | ✅ | ❌ |
| Xem tất cả thanh toán | ✅ | ✅ | ❌ |

### Đánh giá (Reviews)

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Xem đánh giá đã duyệt (public) | ✅ | ✅ | ✅ |
| Gửi đánh giá | ❌ | ❌ | ✅ (chỉ khi đã mua template) |
| Duyệt đánh giá | ✅ | ✅ | ❌ |
| Xóa đánh giá | ✅ | ❌ | ❌ |

### Wishlist

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Xem wishlist của mình | ❌ | ❌ | ✅ |
| Thêm vào wishlist | ❌ | ❌ | ✅ |
| Xóa khỏi wishlist | ❌ | ❌ | ✅ |

### Customize

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Tạo yêu cầu customize | ❌ | ❌ | ✅ |
| Xem tất cả yêu cầu customize | ✅ | ✅ | ❌ |
| Xem yêu cầu customize của mình | ❌ | ❌ | ✅ |
| Báo giá | ✅ | ✅ | ❌ |
| Đồng ý báo giá | ❌ | ❌ | ✅ |
| Giao hàng (deliver) | ✅ | ✅ | ❌ |
| Duyệt hoàn thành (approve) | ❌ | ❌ | ✅ |
| Yêu cầu sửa (revision) | ❌ | ❌ | ✅ (tối đa 3 lần miễn phí) |
| Hủy yêu cầu | ✅ | ✅ | ✅ (chỉ đơn của mình) |
| Gửi tin nhắn | ✅ | ✅ | ✅ |
| Xem lịch sử chat | ✅ | ✅ | ✅ (chỉ đơn của mình) |
| Assign staff xử lý | ✅ | ❌ | ❌ |

### Báo cáo (Reports)

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Xem doanh thu | ✅ | ❌ | ❌ |
| Xem top templates | ✅ | ❌ | ❌ |
| Xem top khách hàng | ✅ | ❌ | ❌ |

### Quản lý nhân viên (Staff)

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Xem danh sách nhân viên | ✅ | ❌ | ❌ |
| Thêm nhân viên | ✅ | ❌ | ❌ |
| Sửa nhân viên | ✅ | ❌ | ❌ |
| Xóa nhân viên | ✅ | ❌ | ❌ |

### Cài đặt (Settings)

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Xem cài đặt | ✅ | ❌ | ❌ |
| Sửa cài đặt | ✅ | ❌ | ❌ |

### Khách hàng (Customers)

| Hành động | ADMIN | STAFF | CUSTOMER |
|-----------|-------|-------|----------|
| Xem danh sách khách hàng | ✅ | ✅ | ❌ |
| Xem hồ sơ cá nhân | ❌ | ❌ | ✅ (chỉ của mình) |
| Sửa hồ sơ cá nhân | ❌ | ❌ | ✅ (chỉ của mình) |
| Ban/Unban khách hàng | ✅ | ❌ | ❌ |

---

## Ghi chú

- STAFF không được xem doanh thu, không quản lý nhân viên, không sửa cài đặt hệ thống
- CUSTOMER chỉ truy cập được dữ liệu của chính mình (đơn hàng, downloads, customize, wishlist)
- Tải template chỉ được phép khi đơn hàng có trạng thái PAID hoặc COMPLETED
- Đánh giá chỉ được gửi khi khách đã có đơn PAID cho template đó
- Revision customize miễn phí tối đa 3 lần, sau đó tính phí thêm
