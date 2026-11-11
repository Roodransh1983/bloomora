import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ─── POST /api/coupons/validate ───────────────────────────────────────────────
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is no longer active' });
    }

    if (coupon.validUntil && coupon.validUntil < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    const total = parseFloat(String(orderTotal || 0));
    if (total < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (total * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, total);

    return res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
      },
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat((total - discountAmount).toFixed(2)),
    });
  } catch (err) {
    console.error('[COUPONS] validate error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/coupons ─────────────────────────────────────────────────────────
router.get('/', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, coupons });
  } catch (err) {
    console.error('[COUPONS] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/coupons ────────────────────────────────────────────────────────
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, validUntil, isActive } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code and discountValue are required' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return res.status(201).json({ success: true, coupon });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }
    console.error('[COUPONS] create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PUT /api/coupons/:id ─────────────────────────────────────────────────────
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { discountType, discountValue, minOrderValue, maxDiscount, validUntil, isActive } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue: parseFloat(minOrderValue) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return res.json({ success: true, coupon });
  } catch (err) {
    console.error('[COUPONS] update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── DELETE /api/coupons/:id ──────────────────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await prisma.coupon.delete({ where: { id } });

    return res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err) {
    console.error('[COUPONS] delete error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
