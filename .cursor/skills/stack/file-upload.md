# Skill: Upload file (R2/S3)

## Khi nào dùng
Khi cần upload ảnh, file zip, hoặc tài liệu từ người dùng lên cloud storage.

## Kiến trúc

```
Frontend (form) → Backend (validate + stream) → Cloudflare R2 / AWS S3
                                                        ↓
                                              Trả về public URL lưu vào DB
```

## Bước thực hiện

### 1. Backend — Tạo storage module
```
src/modules/storage/
├── storage.module.ts
├── storage.service.ts        ← Upload/delete logic
└── storage.controller.ts     ← POST /storage/upload, DELETE /storage/:key
```

### 2. Backend — Storage service
```typescript
// Dùng @aws-sdk/client-s3 + @aws-sdk/lib-storage
// R2 tương thích S3 API, chỉ đổi endpoint

upload(file, folder):
  1. Validate: type (chỉ cho phép image/*, .zip, .pdf), size (tối đa 10MB)
  2. Tạo key: `{folder}/{timestamp}-{random}.{ext}`
  3. Upload bằng @aws-sdk/lib-storage (hỗ trợ multipart)
  4. Trả về: { url, key, size, type }

delete(key):
  1. Gọi DeleteObjectCommand
  2. Trả về: { success: true }
```

### 3. Backend — Controller
```typescript
@Post('upload')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'))
async upload(
  @UploadedFile() file: Express.Multer.File,
  @Query('folder') folder: string,  // 'templates', 'avatars', 'receipts'
) { ... }
```

### 4. Frontend — Upload component
```typescript
// Dùng input type="file" + FormData + apiClient.post
const uploadFile = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/storage/upload?folder=${folder}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (p) => setProgress(Math.round(p.loaded / p.total * 100)),
  });
};
```

### 5. Biến môi trường cần thêm
```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=        # URL công khai để truy cập file
R2_ENDPOINT=          # https://{account_id}.r2.cloudflarestorage.com
```

## Kiểm tra
```
curl -X POST http://localhost:3001/api/v1/storage/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@test.png" \
  -F "folder=test"
```
Kết quả mong đợi: `{ url: "https://cdn.example.com/test/123-abc.png", key: "test/123-abc.png" }`

## KHÔNG ĐƯỢC
- Lưu file vào ổ đĩa server (luôn dùng cloud storage)
- Cho upload không giới hạn kích thước (mặc định tối đa 10MB)
- Tin tưởng file extension từ client (kiểm tra magic bytes)
- Trả về internal S3 URL (luôn dùng public URL hoặc signed URL)
- Upload mà không gắn với user (phải có auth)
