// ============================================================
// Flavor Template — Shared TypeScript types
// Mirrors backend Prisma models
// ============================================================

// --------------- Enums ---------------

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export type TemplateCategory =
  | 'LANDING_PAGE'
  | 'SAAS'
  | 'ECOMMERCE'
  | 'PORTFOLIO'
  | 'BLOG'
  | 'DASHBOARD'
  | 'OTHER';

export type TemplateTech =
  | 'NEXTJS'
  | 'REACT'
  | 'VUE'
  | 'HTML_CSS'
  | 'ASTRO'
  | 'WORDPRESS';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'MOMO' | 'BANK_TRANSFER';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type CustomizeStatus =
  | 'PENDING'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'REVISION'
  | 'COMPLETED'
  | 'CANCELLED';

// --------------- Models ---------------

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDesc: string;
  category: TemplateCategory;
  tech: TemplateTech;
  price: number;
  originalPrice?: number;
  currency: string;
  thumbnail: string;
  images: string[];
  demoUrl: string;
  fileUrl: string;
  fileSize: string;
  version: string;
  metaTitle?: string;
  metaDesc?: string;
  features: string[];
  pages: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  purchaseCount: number;
  avgRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payments?: Payment[];
  user?: User;
}

export interface OrderItem {
  id: string;
  orderId: string;
  templateId: string;
  templateName: string;
  unitPrice: number;
  template?: Template;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  currency: string;
  momoTransId?: string;
  bankTransRef?: string;
  receiptImage?: string;
  confirmedById?: string;
  confirmedAt?: string;
  paidAt?: string;
  createdAt: string;
  order?: Order;
  user?: User;
}

export interface TemplateReview {
  id: string;
  userId: string;
  templateId: string;
  rating: number;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'fullName' | 'avatar'>;
  template?: Pick<Template, 'id' | 'name' | 'slug'>;
}

export interface WishlistItem {
  id: string;
  userId: string;
  templateId: string;
  createdAt: string;
  template?: Template;
}

export interface CustomizeRequest {
  id: string;
  requestNumber: string;
  userId: string;
  templateId: string;
  requirements: string;
  referenceUrls: string[];
  quotedPrice?: number;
  quotedDays?: number;
  status: CustomizeStatus;
  deliveryUrl?: string;
  deliveryNote?: string;
  assignedTo?: string;
  adminNote?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  template?: Template;
  messages?: CustomizeMessage[];
}

export interface CustomizeMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderType: string;
  content: string;
  attachments?: string;
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  updatedAt: string;
}

// --------------- API Response types ---------------

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
}

// --------------- Dashboard stats ---------------

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalTemplates: number;
  totalCustomers: number;
  recentOrders: Order[];
}

// --------------- Cart ---------------

export interface CartItem {
  templateId: string;
  name: string;
  slug: string;
  price: number;
  thumbnail: string;
}
