'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import type { Template, TemplateCategory, TemplateTech } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories: TemplateCategory[] = [
  'LANDING_PAGE', 'SAAS', 'ECOMMERCE', 'PORTFOLIO', 'BLOG', 'DASHBOARD', 'OTHER',
];
const techs: TemplateTech[] = [
  'NEXTJS', 'REACT', 'VUE', 'HTML_CSS', 'ASTRO', 'WORDPRESS',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function AdminTemplateEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: template, isLoading } = useQuery({
    queryKey: ['admin', 'template', params.id],
    queryFn: async () => {
      const res = await api.get<{ data: Template }>(`/admin/templates/${params.id}`);
      return res.data.data;
    },
  });

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    category: '',
    tech: '',
    price: '',
    originalPrice: '',
    thumbnail: '',
    demoUrl: '',
    fileUrl: '',
    fileSize: '',
    features: '',
    pages: '',
    metaTitle: '',
    metaDesc: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (template) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: template.name,
        slug: template.slug,
        description: template.description,
        shortDesc: template.shortDesc,
        category: template.category,
        tech: template.tech,
        price: String(template.price),
        originalPrice: template.originalPrice ? String(template.originalPrice) : '',
        thumbnail: template.thumbnail,
        demoUrl: template.demoUrl,
        fileUrl: template.fileUrl,
        fileSize: template.fileSize,
        features: template.features.join(', '),
        pages: String(template.pages),
        metaTitle: template.metaTitle ?? '',
        metaDesc: template.metaDesc ?? '',
        isActive: template.isActive,
        isFeatured: template.isFeatured,
      });
    }
  }, [template]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && typeof value === 'string') {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        shortDesc: form.shortDesc,
        category: form.category,
        tech: form.tech,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        thumbnail: form.thumbnail,
        demoUrl: form.demoUrl,
        fileUrl: form.fileUrl,
        fileSize: form.fileSize,
        features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
        pages: form.pages ? Number(form.pages) : 0,
        metaTitle: form.metaTitle || undefined,
        metaDesc: form.metaDesc || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };
      await api.patch(`/admin/templates/${params.id}`, body);
    },
    onSuccess: () => {
      toast.success('Template updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] });
      router.push('/admin/templates');
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Template</h1>

      <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortDesc">Short Description</Label>
              <Input id="shortDesc" value={form.shortDesc} onChange={(e) => updateField('shortDesc', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} value={form.description} onChange={(e) => updateField('description', e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(val) => updateField('category', val ?? '')}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tech</Label>
                <Select value={form.tech} onValueChange={(val) => updateField('tech', val ?? '')}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select tech" /></SelectTrigger>
                  <SelectContent>
                    {techs.map((t) => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (VND)</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (VND)</Label>
                <Input id="originalPrice" type="number" value={form.originalPrice} onChange={(e) => updateField('originalPrice', e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input id="thumbnail" value={form.thumbnail} onChange={(e) => updateField('thumbnail', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo URL</Label>
                <Input id="demoUrl" value={form.demoUrl} onChange={(e) => updateField('demoUrl', e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fileUrl">File URL</Label>
                <Input id="fileUrl" value={form.fileUrl} onChange={(e) => updateField('fileUrl', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileSize">File Size</Label>
                <Input id="fileSize" value={form.fileSize} onChange={(e) => updateField('fileSize', e.target.value)} placeholder="e.g. 12MB" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input id="features" value={form.features} onChange={(e) => updateField('features', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Pages</Label>
                <Input id="pages" type="number" value={form.pages} onChange={(e) => updateField('pages', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & Toggles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" value={form.metaTitle} onChange={(e) => updateField('metaTitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDesc">Meta Description</Label>
                <Input id="metaDesc" value={form.metaDesc} onChange={(e) => updateField('metaDesc', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(val) => updateField('isActive', val)} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={(val) => updateField('isFeatured', val)} />
                <Label>Featured</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
