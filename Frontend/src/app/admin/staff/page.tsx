'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StaffForm {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
}

const emptyForm: StaffForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'STAFF',
};

export default function AdminStaffPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);



  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: async () => {
      const res = await api.get<{ data: User[] }>('/admin/staff');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/staff', form);
    },
    onSuccess: () => {
      toast.success('Staff member created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to create staff member'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const body: Partial<StaffForm> = {
        fullName: form.fullName,
        phone: form.phone,
        role: form.role,
      };
      if (form.password) body.password = form.password;
      await api.patch(`/admin/staff/${editingId}`, body);
    },
    onSuccess: () => {
      toast.success('Staff member updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to update staff member'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/staff/${id}`);
    },
    onSuccess: () => {
      toast.success('Staff member deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
    },
    onError: () => toast.error('Failed to delete staff member'),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      email: user.email,
      password: '',
      fullName: user.fullName,
      phone: user.phone ?? '',
      role: user.role,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  // Only ADMIN can access this page
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">Access denied. ADMIN only.</p>
      </div>
    );
  }

  const staff = data ?? [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Staff
        </Button>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length ? (
                  staff.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(user)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              if (confirm('Delete this staff member?')) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No staff members
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffFullName">Full Name</Label>
              <Input
                id="staffFullName"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffEmail">Email</Label>
              <Input
                id="staffEmail"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                disabled={!!editingId}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffPassword">
                Password {editingId && '(leave blank to keep current)'}
              </Label>
              <Input
                id="staffPassword"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required={!editingId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffPhone">Phone</Label>
              <Input
                id="staffPhone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm((f) => ({ ...f, role: (val ?? 'STAFF') as UserRole }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="STAFF">STAFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
