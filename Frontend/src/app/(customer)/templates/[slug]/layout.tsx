import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

interface TemplateData {
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  category: string;
  tech: string;
  thumbnail: string;
  price: number;
  avgRating: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/templates/${slug}`, {
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      return { title: 'Template Not Found' };
    }

    const json = await res.json();
    const template: TemplateData = json.data;

    const title = `${template.name} — ${template.category} Template`;
    const description =
      template.shortDesc || template.description?.slice(0, 160) || '';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/templates/${slug}`,
        type: 'website',
        images: template.thumbnail
          ? [{ url: template.thumbnail, width: 1200, height: 630, alt: template.name }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: template.thumbnail ? [template.thumbnail] : [],
      },
    };
  } catch {
    return { title: 'Template' };
  }
}

export default function TemplateSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
