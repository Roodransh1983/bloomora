import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const createPasscode = () => {
  // Remove ambiguous characters so a passcode can be read and shared reliably.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  return Array.from(crypto.randomBytes(18), (byte) => alphabet[byte % alphabet.length]).join('');
};

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

// ─── GET /api/admin/staff ─────────────────────────────────────────────────────
router.get('/staff', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });

    return res.json({ success: true, staff });
  } catch (err) {
    console.error('[ADMIN] staff list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/admin/staff ────────────────────────────────────────────────────
router.post('/staff', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = String(req.body.name || '').trim();

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passcode = createPasscode();
    const password = await bcrypt.hash(passcode, 12);
    const staff = await prisma.user.create({
      data: { email, name, password, role: 'ADMIN' },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });

    // The raw passcode is intentionally returned only in this creation response.
    return res.status(201).json({ success: true, staff, passcode });
  } catch (err) {
    console.error('[ADMIN] staff create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalDonations,
      totalFlowerRequests,
      recentOrders,
      recentDonations,
      revenueResult,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.donation.count(),
      prisma.flowerCollection.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: { take: 2 } },
      }),
      prisma.donation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    return res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalDonations,
        totalFlowerRequests,
      },
      recentOrders,
      recentDonations,
    });
  } catch (err) {
    console.error('[ADMIN] dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.orderStatus = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({ success: true, orders, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('[ADMIN] orders list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/admin/orders/:id ────────────────────────────────────────────────
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error('[ADMIN] order get error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PATCH /api/admin/orders/:id/status ──────────────────────────────────────
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus !== undefined && { orderStatus }),
        ...(paymentStatus !== undefined && { paymentStatus }),
      },
    });

    return res.json({ success: true, order });
  } catch (err) {
    console.error('[ADMIN] order status update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/admin/donations ─────────────────────────────────────────────────
router.get('/donations', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.donation.count({ where }),
    ]);

    return res.json({ success: true, donations, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('[ADMIN] donations list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PATCH /api/admin/donations/:id/status ───────────────────────────────────
router.patch('/donations/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const existing = await prisma.donation.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    const donation = await prisma.donation.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    return res.json({ success: true, donation });
  } catch (err) {
    console.error('[ADMIN] donation status update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/admin/flower-collections ───────────────────────────────────────
router.get('/flower-collections', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

    const [flowerCollections, total] = await Promise.all([
      prisma.flowerCollection.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.flowerCollection.count({ where }),
    ]);

    return res.json({ success: true, flowerCollections, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('[ADMIN] flower collections list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PATCH /api/admin/flower-collections/:id/status ──────────────────────────
router.patch('/flower-collections/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const existing = await prisma.flowerCollection.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Flower collection request not found' });
    }

    const flowerCollection = await prisma.flowerCollection.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    return res.json({ success: true, flowerCollection });
  } catch (err) {
    console.error('[ADMIN] flower collection status update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/admin/customers ─────────────────────────────────────────────────
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'USER' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true, donations: true } },
        },
      }),
      prisma.user.count({ where: { role: 'USER' } }),
    ]);

    return res.json({ success: true, customers, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('[ADMIN] customers list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/admin/reviews ───────────────────────────────────────────────────
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', isApproved } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (isApproved !== undefined) where.isApproved = isApproved === 'true';

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return res.json({ success: true, reviews, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('[ADMIN] reviews list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PATCH /api/admin/reviews/:id ────────────────────────────────────────────
router.patch('/reviews/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    // Recalculate product rating after approval status change
    const allApprovedReviews = await prisma.review.findMany({
      where: { productId: existing.productId, isApproved: true },
      select: { rating: true },
    });

    const reviewCount = allApprovedReviews.length;
    const avgRating = reviewCount > 0
      ? allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 5.0;

    await prisma.product.update({
      where: { id: existing.productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount,
      },
    });

    return res.json({ success: true, review });
  } catch (err) {
    console.error('[ADMIN] review update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/admin/analytics ─────────────────────────────────────────────────
router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const months: { label: string; start: Date; end: Date }[] = [];

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const label = start.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push({ label, start, end });
    }

    const salesByMonth = await Promise.all(
      months.map(async ({ label, start, end }) => {
        const result = await prisma.order.aggregate({
          where: {
            createdAt: { gte: start, lte: end },
          },
          _sum: { totalAmount: true },
          _count: { id: true },
        });

        return {
          month: label,
          revenue: result._sum.totalAmount || 0,
          orders: result._count.id,
        };
      }),
    );

    return res.json({ success: true, salesByMonth });
  } catch (err) {
    console.error('[ADMIN] analytics error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
