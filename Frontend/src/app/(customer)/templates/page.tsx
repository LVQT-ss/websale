'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import TemplateCard from '@/components/customer/template-card';
import api from '@/lib/api';
import type { Template, PaginatedResponse, TemplateCategory, TemplateTech } from '@/lib/types';

const categoryOptions: { value: TemplateCategory; label: string }[] = [
  { value: 'LANDING_PAGE', label: 'Landing Page' },
  { value: 'SAAS', label: 'SaaS' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'PORTFOLIO', label: 'Portfolio' },
  { value: 'BLOG', label: 'Blog' },
  { value: 'DASHBOARD', label: 'Dashboard' },
  { value: 'OTHER', label: 'Other' },
];

const techOptions: { value: TemplateTech; label: string }[] = [
  { value: 'NEXTJS', label: 'Next.js' },
  { value: 'REACT', label: 'React' },
  { value: 'VUE', label: 'Vue' },
  { value: 'HTML_CSS', label: 'HTML/CSS' },
  { value: 'ASTRO', label: 'Astro' },
  { value: 'WORDPRESS', label: 'WordPress' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function TemplatesBrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get('search') ?? '';
  const categories = searchParams.getAll('category');
  const techs = searchParams.getAll('tech');
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Number(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === null) continue;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }

      // Reset page when filtering
      if (!('page' in updates)) {
        params.delete('page');
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput || null });
  };

  const toggleCategory = (cat: string) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    updateParams({ category: next.length ? next : null });
  };

  const toggleTech = (tech: string) => {
    const next = techs.includes(tech)
      ? techs.filter((t) => t !== tech)
      : [...techs, tech];
    updateParams({ tech: next.length ? next : null });
  };

  const { data, isLoading } = useQuery<PaginatedResponse<Template>>({
    queryKey: ['templates', { search, categories, techs, sort, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      categories.forEach((c) => params.append('category', c));
      techs.forEach((t) => params.append('tech', t));
      params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '12');
      const res = await api.get(`/templates?${params.toString()}`);
      return res.data;
    },
  });

  const templates = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = categories.length > 0 || techs.length > 0 || !!search;

  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
          Category
        </h3>
        <div className="space-y-2">
          {categoryOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                checked={categories.includes(opt.value)}
                onCheckedChange={() => toggleCategory(opt.value)}
              />
              <span className="text-sm text-zinc-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tech */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
          Technology
        </h3>
        <div className="space-y-2">
          {techOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                checked={techs.includes(opt.value)}
                onCheckedChange={() => toggleTech(opt.value)}
              />
              <span className="text-sm text-zinc-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-zinc-500"
          onClick={() =>
            updateParams({ category: null, tech: null, search: null })
          }
        >
          <X className="mr-1 size-3" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Templates
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {meta
                ? `${meta.total} template${meta.total !== 1 ? 's' : ''} found`
                : 'Browse our collection'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search templates..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-8 w-60 pl-8 text-sm"
              />
            </form>

            {/* Sort */}
            <Select
              value={sort}
              onValueChange={(val) => updateParams({ sort: val ?? 'newest' })}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile filter toggle */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" className="md:hidden" />
                }
              >
                <SlidersHorizontal className="size-4" />
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="px-4">
                  {renderFilterContent()}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="mt-8 flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden w-56 shrink-0 md:block">
            {renderFilterContent()}
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] animate-pulse rounded-lg border border-zinc-200 bg-zinc-50"
                  />
                ))}
              </div>
            ) : templates.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map((t) => (
                    <TemplateCard key={t.id} template={t} />
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() =>
                        updateParams({ page: String(page - 1) })
                      }
                    >
                      Previous
                    </Button>
                    <span className="px-4 text-sm text-zinc-500">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= meta.totalPages}
                      onClick={() =>
                        updateParams({ page: String(page + 1) })
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-sm text-zinc-500">No templates found.</p>
                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-blue-600"
                    onClick={() =>
                      updateParams({
                        category: null,
                        tech: null,
                        search: null,
                      })
                    }
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
