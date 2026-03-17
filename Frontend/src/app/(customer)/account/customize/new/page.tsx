'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import api from '@/lib/api';
import type { Template, PaginatedResponse } from '@/lib/types';

export default function CustomizeNewPage() {
  const router = useRouter();

  const [templateId, setTemplateId] = useState('');
  const [requirements, setRequirements] = useState('');
  const [referenceUrls, setReferenceUrls] = useState<string[]>(['']);
  const [error, setError] = useState('');

  const { data: templatesData } = useQuery<PaginatedResponse<Template>>({
    queryKey: ['templates', 'all-for-select'],
    queryFn: async () => {
      const res = await api.get('/templates?limit=100');
      return res.data;
    },
  });

  const templates = templatesData?.data ?? [];

  const createRequest = useMutation({
    mutationFn: async () => {
      const filteredUrls = referenceUrls.filter((url) => url.trim() !== '');
      const res = await api.post('/customize', {
        templateId,
        requirements,
        referenceUrls: filteredUrls,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      router.push(`/account/customize/${data.id}`);
    },
    onError: () => {
      setError('Failed to create request. Please try again.');
    },
  });

  const addUrlField = () => {
    setReferenceUrls([...referenceUrls, '']);
  };

  const removeUrlField = (index: number) => {
    setReferenceUrls(referenceUrls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const updated = [...referenceUrls];
    updated[index] = value;
    setReferenceUrls(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!templateId) {
      setError('Please select a template.');
      return;
    }
    if (!requirements.trim()) {
      setError('Please describe your requirements.');
      return;
    }

    createRequest.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account/customize"
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-black"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Customization Request
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tell us what you need and we&apos;ll provide a quote.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div className="space-y-2">
          <Label>Select Template</Label>
          <Select value={templateId} onValueChange={(val) => setTemplateId(val ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a template to customize" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            placeholder="Describe what you need customized (colors, features, content, etc.)"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="min-h-32"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Reference URLs</Label>
          <p className="text-xs text-zinc-400">
            Share links to designs or websites you like for reference.
          </p>
          <div className="space-y-2">
            {referenceUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => updateUrl(i, e.target.value)}
                  className="text-sm"
                />
                {referenceUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-zinc-400"
                    onClick={() => removeUrlField(i)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-zinc-500"
              onClick={addUrlField}
            >
              <Plus className="size-3" />
              Add another URL
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
          disabled={createRequest.isPending}
        >
          {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  );
}
