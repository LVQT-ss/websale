'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import api from '@/lib/api';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(user.fullName);
      setPhone(user.phone ?? '');
      setAvatar(user.avatar ?? '');
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      await api.patch('/users/me', {
        fullName,
        phone: phone || undefined,
        avatar: avatar || undefined,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setError('');
      fetchMe();
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: () => {
      setError('Failed to update profile.');
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    updateProfile.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update your personal information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email ?? ''}
            disabled
            className="bg-zinc-50 text-zinc-500"
          />
          <p className="text-xs text-zinc-400">Email cannot be changed.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0912 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input
            id="avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Profile updated successfully.</p>
        )}

        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
