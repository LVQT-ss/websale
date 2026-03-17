# Skill: SEO tối ưu cho Next.js

## Khi nào dùng
Khi tạo trang mới, thêm sản phẩm, hoặc cần cải thiện thứ hạng tìm kiếm.

## Checklist bắt buộc cho MỌI trang

### 1. Meta tags — dùng generateMetadata (App Router)
```typescript
// app/(customer)/templates/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const template = await getTemplate(params.slug);
  return {
    title: `${template.name} | Flavor Template`,          // Tối đa 60 ký tự
    description: template.shortDesc,                        // Tối đa 160 ký tự
    keywords: [template.category, template.tech, 'template', 'website'],
    openGraph: {
      title: template.name,
      description: template.shortDesc,
      images: [{ url: template.thumbnail, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: template.name,
      description: template.shortDesc,
      images: [template.thumbnail],
    },
    alternates: {
      canonical: `https://example.com/templates/${params.slug}`,
    },
  };
}
```

### 2. Structured Data — JSON-LD
```typescript
// Cho trang sản phẩm
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: template.name,
  description: template.shortDesc,
  image: template.thumbnail,
  offers: {
    '@type': 'Offer',
    price: template.price,
    priceCurrency: 'VND',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: template.avgRating > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: template.avgRating,
    reviewCount: template.reviewCount,
  } : undefined,
}) }} />

// Cho trang chủ
{ '@type': 'WebSite', name: 'Flavor Template', url: 'https://example.com' }

// Cho bài blog
{ '@type': 'Article', headline: post.title, datePublished: post.createdAt, author: { '@type': 'Person', name: post.author } }
```

### 3. Sitemap — tự động generate
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const templates = await templatesApi.getAll();
  const posts = await blogApi.getAll();

  return [
    { url: 'https://example.com', changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://example.com/templates', changeFrequency: 'daily', priority: 0.9 },
    ...templates.map(t => ({
      url: `https://example.com/templates/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...posts.map(p => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
```

### 4. robots.txt
```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/account/', '/api/'] },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

### 5. Hình ảnh — next/image bắt buộc
```typescript
// ĐÚNG
<Image src={thumbnail} alt="Tên sản phẩm cụ thể" width={600} height={400} />

// SAI
<img src={thumbnail} />                    // Không tối ưu, không lazy load
<Image src={thumbnail} alt="" />           // Alt trống = mất SEO hình ảnh
<Image src={thumbnail} alt="image" />      // Alt chung chung = vô nghĩa
```

### 6. Heading hierarchy — mỗi trang chỉ 1 thẻ h1
```
h1: Tên trang / Tên sản phẩm (1 cái duy nhất)
  h2: Các section chính
    h3: Các mục con
```

### 7. Core Web Vitals
```
LCP (Largest Contentful Paint) < 2.5s
  → Dùng priority trên ảnh hero: <Image priority />
  → Preload font: <link rel="preload" href="/fonts/inter.woff2" as="font" />

CLS (Cumulative Layout Shift) < 0.1
  → Luôn set width + height cho Image
  → Dùng Skeleton khi loading (giữ nguyên kích thước)

FID (First Input Delay) < 100ms
  → Lazy load component nặng: dynamic(() => import('./HeavyChart'), { ssr: false })
  → Tránh blocking JS trên main thread
```

### 8. URL chuẩn SEO
```
ĐÚNG: /templates/saas-starter           (slug ngắn, có nghĩa)
SAI:   /templates/clm8x9abc000012345    (ID dài, vô nghĩa)
SAI:   /templates?id=123                (query param, khó index)
```

## Kiểm tra

```bash
# Kiểm tra meta tags
curl -s http://localhost:3000/templates/saas-starter | grep -E '<title>|og:|twitter:'

# Kiểm tra sitemap
curl http://localhost:3000/sitemap.xml

# Kiểm tra robots
curl http://localhost:3000/robots.txt

# Kiểm tra structured data — dán URL vào:
# https://search.google.com/test/rich-results
```

## KHÔNG ĐƯỢC
- Trang không có thẻ title hoặc description
- Dùng `<img>` thay vì `next/image`
- Alt ảnh để trống hoặc viết chung chung ("image", "photo")
- Nhiều hơn 1 thẻ h1 trên 1 trang
- URL chứa ID thay vì slug
- Quên sitemap.xml hoặc robots.txt
- Render nội dung quan trọng chỉ bằng client-side (Google không thấy)
- Ảnh hero không có `priority` (gây LCP chậm)
