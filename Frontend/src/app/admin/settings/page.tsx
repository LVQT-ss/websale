'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Setting } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsMap {
  site_name: string;
  site_description: string;
  contact_email: string;
  bank_config: string;
  momo_config: string;
}

const defaultSettings: SettingsMap = {
  site_name: '',
  site_description: '',
  contact_email: '',
  bank_config: '',
  momo_config: '',
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [form, setForm] = useState<SettingsMap>(defaultSettings);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await api.get<{ data: Setting[] }>('/admin/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (data) {
      const map = { ...defaultSettings };
      data.forEach((s) => {
        if (s.key in map) {
          (map as Record<string, string>)[s.key] =
            typeof s.value === 'string' ? s.value : JSON.stringify(s.value, null, 2);
        }
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(map);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries = Object.entries(form).map(([key, value]) => {
        // Try to parse bank_config and momo_config as JSON
        let parsedValue: unknown = value;
        if (key === 'bank_config' || key === 'momo_config') {
          try {
            parsedValue = JSON.parse(value);
          } catch {
            // Send as string if not valid JSON
          }
        }
        return { key, value: parsedValue };
      });
      await api.put('/admin/settings', { settings: entries });
    },
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: () => toast.error('Failed to save settings'),
  });

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">Access denied. ADMIN only.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={form.site_name}
                onChange={(e) => setForm((f) => ({ ...f, site_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                rows={3}
                value={form.site_description}
                onChange={(e) => setForm((f) => ({ ...f, site_description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank_config">Bank Transfer Config (JSON)</Label>
              <Textarea
                id="bank_config"
                rows={6}
                className="font-mono text-xs"
                value={form.bank_config}
                onChange={(e) => setForm((f) => ({ ...f, bank_config: e.target.value }))}
                placeholder='{"bankName":"...","accountNumber":"...","accountHolder":"..."}'
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="momo_config">MoMo Config (JSON)</Label>
              <Textarea
                id="momo_config"
                rows={6}
                className="font-mono text-xs"
                value={form.momo_config}
                onChange={(e) => setForm((f) => ({ ...f, momo_config: e.target.value }))}
                placeholder='{"partnerCode":"...","accessKey":"..."}'
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
}
