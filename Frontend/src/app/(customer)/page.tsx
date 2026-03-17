'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Layout, Monitor, Palette, Globe, Code, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TemplateCard from '@/components/customer/template-card';
import api from '@/lib/api';
import type { Template } from '@/lib/types';

const categories = [
  { key: 'LANDING_PAGE', label: 'Landing Page', icon: Layout, desc: 'High-converting landing pages' },
  { key: 'SAAS', label: 'SaaS', icon: Monitor, desc: 'Software application templates' },
  { key: 'ECOMMERCE', label: 'E-Commerce', icon: Globe, desc: 'Online store solutions' },
  { key: 'PORTFOLIO', label: 'Portfolio', icon: Palette, desc: 'Showcase your work' },
  { key: 'BLOG', label: 'Blog', icon: FileText, desc: 'Content publishing themes' },
  { key: 'DASHBOARD', label: 'Dashboard', icon: Code, desc: 'Admin panel templates' },
];

export default function HomePage() {
  const { data: featuredTemplates, isLoading } = useQuery<Template[]>({
    queryKey: ['templates', 'featured'],
    queryFn: async () => {
      const res = await api.get('/templates/featured');
      return res.data.data;
    },
  });

  return (
    <div className="bg-white text-black">
      {/* Hero */}
      <section className="py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl md:leading-[1.1]">
            Premium Website Templates
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-zinc-500 md:text-lg">
            Beautifully crafted, production-ready templates. Build faster with
            professionally designed components and layouts.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/templates">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Browse Templates
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured templates */}
      <section className="border-t border-zinc-100 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Featured Templates
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Handpicked by our team for quality and design.
              </p>
            </div>
            <Link
              href="/templates"
              className="hidden text-sm text-blue-600 transition-colors hover:text-blue-700 md:block"
            >
              View all &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-lg border border-zinc-200 bg-zinc-50"
                />
              ))}
            </div>
          ) : featuredTemplates && featuredTemplates.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTemplates.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-zinc-400">
              No featured templates yet.
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Browse by Category
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Find the perfect template for your project.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.key}
                  href={`/templates?category=${cat.key}`}
                  className="group rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-300"
                >
                  <Icon className="size-5 text-blue-600" />
                  <h3 className="mt-3 text-sm font-medium text-black">
                    {cat.label}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">{cat.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Need a custom design?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
            We can customize any template to match your brand and requirements.
            Get a tailored solution built just for you.
          </p>
          <div className="mt-8">
            <Link href="/account/customize/new">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Request Customization
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
