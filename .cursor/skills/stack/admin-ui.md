# Admin UI

## Purpose
Build admin pages using shadcn/ui exclusively. Consistent patterns for all admin interfaces.

## Layout
```
┌─────────────┬──────────────────────────┐
│  Sidebar    │  Header (breadcrumb)     │
│  - Nav      ├──────────────────────────│
│  - Logo     │  Main Content            │
│  - User     │  (DataTable / Form /     │
│             │   Dashboard)             │
└─────────────┴──────────────────────────┘
Mobile: sidebar collapses to hamburger menu
```

## Component Patterns

### List Page (DataTable)
```typescript
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">Items</h1>
    <Button onClick={() => setOpen(true)}>
      <Plus className="mr-2 h-4 w-4" /> Add Item
    </Button>
  </div>
  <div className="flex items-center gap-2">
    <Input placeholder="Search..." value={search} onChange={...} />
    <Select value={statusFilter} onValueChange={...}>
      <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All</SelectItem>
        <SelectItem value="ACTIVE">Active</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <DataTable columns={columns} data={data} />
</div>
```

### Create/Edit (Dialog)
```typescript
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>Create Item</DialogTitle></DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

### Status Badge
```typescript
const statusVariant: Record<string, string> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  ARCHIVED: 'destructive',
};
<Badge variant={statusVariant[item.status]}>{item.status}</Badge>
```

### Row Actions (DropdownMenu)
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item.id)}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Feedback (Sonner Toast)
```typescript
import { toast } from 'sonner';
toast.success('Item created');
toast.error('Failed to delete item');
```

### Loading (Skeleton)
```typescript
<div className="space-y-2">
  {Array.from({ length: 5 }).map((_, i) => (
    <Skeleton key={i} className="h-12 w-full" />
  ))}
</div>
```

## Required for Every Admin List Page
- Search input
- Status filter dropdown
- Bulk selection + bulk actions
- Sortable columns
- Pagination
- Row actions dropdown

## Verify
- All components from shadcn/ui (no custom design system)
- Forms validate before submit
- Toast shown on success/error
- Responsive: sidebar collapses on mobile

## NEVER
- Use custom UI components for admin — always shadcn/ui
- Skip form validation
- Use `alert()` or `window.confirm()` — use Dialog or AlertDialog
- Forget loading skeletons
- Skip mobile responsive check
