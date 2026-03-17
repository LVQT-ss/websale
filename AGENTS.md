# FLAVOR TEMPLATE

Nền tảng bán template website chuyên nghiệp. Khách hàng mua template, tải về, hoặc thuê team customize.

## Vai trò
- ADMIN — Quản lý toàn bộ: templates, đơn hàng, khách hàng, tài chính, nhân viên
- STAFF — Xử lý đơn customize, hỗ trợ khách hàng, quản lý templates
- CUSTOMER — Duyệt template, mua, tải về, yêu cầu customize

## Quy tắc
- Đọc skill phù hợp TRƯỚC khi làm bất kỳ task nào
- Chạy `pre-commit-check` trước MỌI commit
- KHÔNG BAO GIỜ commit khi test hoặc lint fail
- KHÔNG dùng `any` type, KHÔNG dùng `@ts-ignore`
- KHÔNG commit `.env`, secrets, hoặc `console.log`
- Hỏi trước khi xóa dữ liệu hoặc sửa schema
- Cập nhật PROGRESS.md sau mỗi bước hoàn thành
- Ghi DECISIONS.md khi gặp quyết định kỹ thuật (>1 cách làm)

## Skills — Chung
- `global/safe-commit` — Quy trình commit an toàn
- `global/pre-commit-check` — Cổng chất lượng trước commit
- `global/auto-fix` — Tự sửa lỗi lint/type (tối đa 3 lần)
- `global/progress-log` — Ghi tiến độ vào PROGRESS.md
- `global/decision-log` — Phân tích pros/cons → ghi DECISIONS.md
- `global/write-tests` — Viết test + edge cases
- `global/self-review` — Tự review code trước commit
- `global/error-handling` — Xử lý lỗi Backend + Frontend
- `global/security-checklist` — Kiểm tra bảo mật
- `global/performance` — Tối ưu hiệu năng
- `global/refactoring` — Khi nào và cách refactor
- `global/git-strategy` — Quy tắc branch + commit
- `rules/never-do` — 16 điều KHÔNG BAO GIỜ làm

## Skills — Stack
- `stack/start-dev` — Khởi động Docker + Backend + Frontend
- `stack/add-api-endpoint` — Tạo endpoint NestJS
- `stack/add-page` — Tạo trang Next.js
- `stack/database-migration` — Prisma migrate
- `stack/connect-api` — Tầng API với React Query
- `stack/docker-setup` — Docker compose
- `stack/run-tests` — Chạy tests
- `stack/seed-data` — Dữ liệu mẫu
- `stack/deploy` — Deploy + rollback
- `stack/admin-ui` — Admin dùng shadcn/ui
- `stack/theme-switching` — Đổi giao diện
- `stack/ci-cd` — CI/CD pipeline setup
- `stack/file-upload` — Upload file (ảnh, zip) lên R2/S3
- `stack/monitoring` — Giám sát hệ thống + logging
- `stack/seo` — Tối ưu SEO (meta tags, sitemap, structured data)
- `ui-theme` — Giao diện minimalism cho trang khách hàng

## Specs
Xem `MASTER_PROMPT.md` — toàn bộ: RBAC, schema, trang, API, luồng, dữ liệu mẫu.

## KHÔNG BAO GIỜ
- Deploy mà chưa chạy test
- Sửa file migration đã tạo
- Dùng `db push` trên production
- Trộn component shadcn vào trang khách hàng
- Commit mật khẩu hoặc dữ liệu thật
- Dùng `git push --force`
- Bỏ qua bước cập nhật PROGRESS.md
- Cho phép tải file mà chưa kiểm tra thanh toán
