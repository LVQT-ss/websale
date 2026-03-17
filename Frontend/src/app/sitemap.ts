import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic: all template pages
  let templatePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/templates?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const templates: { slug: string; updatedAt: string }[] =
        json.data?.data ?? [];
      templatePages = templates.map((t) => ({
        url: `${SITE_URL}/templates/${t.slug}`,
        lastModified: new Date(t.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Sitemap generation should not fail if API is down
  }

  return [...staticPages, ...templatePages];
}
