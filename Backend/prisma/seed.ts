import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Users ───────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const staffHash = await bcrypt.hash('Staff@123', 10);
  const customerHash = await bcrypt.hash('Customer@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@flavor.vn' },
    update: {},
    create: {
      email: 'admin@flavor.vn',
      passwordHash: adminHash,
      fullName: 'Admin Flavor',
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@flavor.vn' },
    update: {},
    create: {
      email: 'staff@flavor.vn',
      passwordHash: staffHash,
      fullName: 'Nhan vien 1',
      role: 'STAFF',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'khach@gmail.com' },
    update: {},
    create: {
      email: 'khach@gmail.com',
      passwordHash: customerHash,
      fullName: 'Nguyen Van Khach',
      role: 'CUSTOMER',
    },
  });

  console.log('Users seeded:', { admin: admin.id, staff: staff.id, customer: customer.id });

  // ─── Templates ───────────────────────────────────────────────────────
  const templatesData = [
    {
      slug: 'saas-starter',
      name: 'SaaS Starter',
      category: 'SAAS' as const,
      tech: 'NEXTJS' as const,
      price: 499000,
      shortDesc: 'Complete SaaS starter template with auth and dashboard',
      description:
        'Full SaaS template with authentication, dashboard, pricing page, landing page and more. Built with Next.js and Tailwind CSS.',
      thumbnail: '/templates/saas-starter/thumb.jpg',
      images: ['/templates/saas-starter/1.jpg', '/templates/saas-starter/2.jpg'],
      demoUrl: 'https://saas-starter-demo.vercel.app',
      fileUrl: 'templates/saas-starter.zip',
      fileSize: 5242880,
      features: ['Responsive', 'Dark mode', 'Auth', 'Dashboard', 'Pricing page'],
      pages: 8,
    },
    {
      slug: 'portfolio-minimal',
      name: 'Portfolio Minimal',
      category: 'PORTFOLIO' as const,
      tech: 'NEXTJS' as const,
      price: 299000,
      shortDesc: 'Clean minimal portfolio template',
      description: 'Minimal portfolio template with smooth animations and contact form.',
      thumbnail: '/templates/portfolio-minimal/thumb.jpg',
      images: ['/templates/portfolio-minimal/1.jpg'],
      demoUrl: 'https://portfolio-minimal-demo.vercel.app',
      fileUrl: 'templates/portfolio-minimal.zip',
      fileSize: 3145728,
      features: ['Responsive', 'Animation', 'Contact form'],
      pages: 5,
    },
    {
      slug: 'e-shop-pro',
      name: 'E-Shop Pro',
      category: 'ECOMMERCE' as const,
      tech: 'NEXTJS' as const,
      price: 799000,
      shortDesc: 'Full e-commerce template with admin panel',
      description:
        'Complete e-commerce solution with shopping cart, checkout, admin dashboard, SEO optimization and i18n support.',
      thumbnail: '/templates/e-shop-pro/thumb.jpg',
      images: ['/templates/e-shop-pro/1.jpg', '/templates/e-shop-pro/2.jpg'],
      demoUrl: 'https://e-shop-pro-demo.vercel.app',
      fileUrl: 'templates/e-shop-pro.zip',
      fileSize: 8388608,
      features: ['Cart', 'Checkout', 'Admin', 'SEO', 'i18n'],
      pages: 15,
    },
    {
      slug: 'blog-clean',
      name: 'Blog Clean',
      category: 'BLOG' as const,
      tech: 'ASTRO' as const,
      price: 199000,
      shortDesc: 'Clean blog template built with Astro',
      description: 'Fast and clean blog template with MDX support, SEO, RSS feed and dark mode.',
      thumbnail: '/templates/blog-clean/thumb.jpg',
      images: ['/templates/blog-clean/1.jpg'],
      demoUrl: 'https://blog-clean-demo.vercel.app',
      fileUrl: 'templates/blog-clean.zip',
      fileSize: 2097152,
      features: ['MDX', 'SEO', 'RSS', 'Dark mode'],
      pages: 4,
    },
    {
      slug: 'landing-starter',
      name: 'Landing Starter',
      category: 'LANDING_PAGE' as const,
      tech: 'HTML_CSS' as const,
      price: 149000,
      shortDesc: 'Simple responsive landing page',
      description: 'Lightweight landing page template. Pure HTML/CSS, fast loading, SEO ready.',
      thumbnail: '/templates/landing-starter/thumb.jpg',
      images: ['/templates/landing-starter/1.jpg'],
      demoUrl: 'https://landing-starter-demo.vercel.app',
      fileUrl: 'templates/landing-starter.zip',
      fileSize: 1048576,
      features: ['Responsive', 'Fast', 'SEO ready'],
      pages: 1,
    },
    {
      slug: 'admin-dashboard',
      name: 'Admin Dashboard',
      category: 'DASHBOARD' as const,
      tech: 'REACT' as const,
      price: 599000,
      shortDesc: 'Admin dashboard with charts and RBAC',
      description:
        'Feature-rich admin dashboard with charts, data tables, role-based access control and dark mode.',
      thumbnail: '/templates/admin-dashboard/thumb.jpg',
      images: ['/templates/admin-dashboard/1.jpg', '/templates/admin-dashboard/2.jpg'],
      demoUrl: 'https://admin-dashboard-demo.vercel.app',
      fileUrl: 'templates/admin-dashboard.zip',
      fileSize: 6291456,
      features: ['Charts', 'Tables', 'RBAC', 'Dark mode'],
      pages: 12,
    },
    {
      slug: 'agency-landing',
      name: 'Agency Landing',
      category: 'LANDING_PAGE' as const,
      tech: 'NEXTJS' as const,
      price: 349000,
      isFeatured: true,
      shortDesc: 'Agency landing page with parallax effects',
      description:
        'Stunning agency landing page with parallax scrolling, smooth animations and CMS integration.',
      thumbnail: '/templates/agency-landing/thumb.jpg',
      images: ['/templates/agency-landing/1.jpg'],
      demoUrl: 'https://agency-landing-demo.vercel.app',
      fileUrl: 'templates/agency-landing.zip',
      fileSize: 4194304,
      features: ['Parallax', 'Animation', 'CMS'],
      pages: 3,
    },
    {
      slug: 'vue-commerce',
      name: 'Vue Commerce',
      category: 'ECOMMERCE' as const,
      tech: 'VUE' as const,
      price: 699000,
      shortDesc: 'Vue.js e-commerce template',
      description:
        'Complete Vue.js e-commerce template with Vuex state management, shopping cart, Stripe payments and admin panel.',
      thumbnail: '/templates/vue-commerce/thumb.jpg',
      images: ['/templates/vue-commerce/1.jpg'],
      demoUrl: 'https://vue-commerce-demo.vercel.app',
      fileUrl: 'templates/vue-commerce.zip',
      fileSize: 7340032,
      features: ['Vuex', 'Cart', 'Stripe', 'Admin'],
      pages: 10,
    },
  ];

  const templates: Record<string, { id: string }> = {};

  for (const t of templatesData) {
    const template = await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        slug: t.slug,
        name: t.name,
        category: t.category,
        tech: t.tech,
        price: t.price,
        shortDesc: t.shortDesc,
        description: t.description,
        thumbnail: t.thumbnail,
        images: t.images,
        demoUrl: t.demoUrl,
        fileUrl: t.fileUrl,
        fileSize: t.fileSize,
        features: t.features,
        pages: t.pages,
        isFeatured: t.isFeatured ?? false,
      },
    });
    templates[t.slug] = template;
  }

  console.log('Templates seeded:', Object.keys(templates).length);

  // ─── Orders ──────────────────────────────────────────────────────────
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'FT-20260316-001' },
    update: {},
    create: {
      orderNumber: 'FT-20260316-001',
      userId: customer.id,
      status: 'COMPLETED',
      totalAmount: 499000,
      customerEmail: 'khach@gmail.com',
      customerName: 'Nguyen Van Khach',
      paidAt: new Date(),
      completedAt: new Date(),
    },
  });

  // Order item for order 1
  const existingItem1 = await prisma.orderItem.findFirst({
    where: { orderId: order1.id, templateId: templates['saas-starter'].id },
  });
  if (!existingItem1) {
    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        templateId: templates['saas-starter'].id,
        templateName: 'SaaS Starter',
        unitPrice: 499000,
      },
    });
  }

  // Payment for order 1
  const existingPayment1 = await prisma.payment.findFirst({
    where: { orderId: order1.id },
  });
  if (!existingPayment1) {
    await prisma.payment.create({
      data: {
        orderId: order1.id,
        userId: customer.id,
        amount: 499000,
        method: 'BANK_TRANSFER',
        status: 'SUCCESS',
        bankTransRef: 'VCB-20260316-001',
        paidAt: new Date(),
        confirmedAt: new Date(),
        confirmedById: admin.id,
      },
    });
  }

  const order2 = await prisma.order.upsert({
    where: { orderNumber: 'FT-20260316-002' },
    update: {},
    create: {
      orderNumber: 'FT-20260316-002',
      userId: customer.id,
      status: 'PENDING',
      totalAmount: 199000,
      customerEmail: 'khach@gmail.com',
      customerName: 'Nguyen Van Khach',
    },
  });

  // Order item for order 2
  const existingItem2 = await prisma.orderItem.findFirst({
    where: { orderId: order2.id, templateId: templates['blog-clean'].id },
  });
  if (!existingItem2) {
    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        templateId: templates['blog-clean'].id,
        templateName: 'Blog Clean',
        unitPrice: 199000,
      },
    });
  }

  console.log('Orders seeded:', { order1: order1.id, order2: order2.id });

  // ─── Template Review ─────────────────────────────────────────────────
  await prisma.templateReview.upsert({
    where: {
      userId_templateId: {
        userId: customer.id,
        templateId: templates['saas-starter'].id,
      },
    },
    update: {},
    create: {
      userId: customer.id,
      templateId: templates['saas-starter'].id,
      rating: 5,
      content: 'Template rat dep, code sach, de customize.',
      isApproved: true,
    },
  });

  // Update avg rating for SaaS Starter
  await prisma.template.update({
    where: { slug: 'saas-starter' },
    data: { avgRating: 5.0, purchaseCount: 1 },
  });

  console.log('Review seeded');

  // ─── Customize Request ───────────────────────────────────────────────
  const existingRequest = await prisma.customizeRequest.findFirst({
    where: { requestNumber: 'CR-20260316-001' },
  });
  if (!existingRequest) {
    await prisma.customizeRequest.create({
      data: {
        requestNumber: 'CR-20260316-001',
        userId: customer.id,
        templateId: templates['e-shop-pro'].id,
        requirements: 'Doi mau sang xanh, them trang About, chinh sua footer.',
        referenceUrls: [],
        status: 'IN_PROGRESS',
        assignedTo: staff.id,
        quotedPrice: 2000000,
        quotedDays: 5,
      },
    });
  }

  console.log('Customize request seeded');

  // ─── Settings ────────────────────────────────────────────────────────
  const defaultSettings = [
    {
      key: 'site_name',
      value: 'Flavor Template',
    },
    {
      key: 'site_description',
      value: 'Premium website template marketplace',
    },
    {
      key: 'contact_email',
      value: 'hello@flavor.vn',
    },
    {
      key: 'momo_config',
      value: {
        partnerCode: 'FLAVOR',
        accessKey: '',
        secretKey: '',
        endpoint: 'https://test-payment.momo.vn/v2/gateway/api',
      },
    },
    {
      key: 'bank_config',
      value: {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountHolder: 'FLAVOR TEMPLATE CO LTD',
        branch: 'Ho Chi Minh',
      },
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
      },
    });
  }

  console.log('Settings seeded');
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
