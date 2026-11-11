import { Router } from 'express';
import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}-${suffix}`;
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      couponCode,
      shippingFee = 0,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Customer details and shipping address are required' });
    }

    // Validate stock and collect product data
    const orderItemsData: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      });

      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0]?.url || null,
        price: product.price,
        quantity: item.quantity,
      });

      subtotal += product.price * item.quantity;
    }

    // Apply coupon
    let discountAmount = 0;
    let appliedCoupon: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isValid = !coupon.validUntil || coupon.validUntil > now;
        const meetsMinOrder = subtotal >= coupon.minOrderValue;

        if (isValid && meetsMinOrder) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, subtotal);
          appliedCoupon = couponCode;

          // Increment usage
          await prisma.coupon.update({
            where: { code: couponCode },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    }

    const totalAmount = subtotal - discountAmount + parseFloat(String(shippingFee));

    // Generate a unique order number
    let orderNumber: string;
    let attempts = 0;
    do {
      orderNumber = generateOrderNumber();
      attempts++;
      if (attempts > 10) break;
    } while (await prisma.order.findUnique({ where: { orderNumber } }));

    // Create order and update stock
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user?.id || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        totalAmount,
        shippingFee: parseFloat(String(shippingFee)),
        discountAmount,
        couponCode: appliedCoupon,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of orderItemsData) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return res.status(201).json({
      success: true,
      order,
      message: 'Order placed successfully',
    });
  } catch (err) {
    console.error('[ORDERS] create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/orders ──────────────────────────────────────────────────────────
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return res.json({ success: true, orders });
  } catch (err) {
    console.error('[ORDERS] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Users can only see their own orders; admins can see all
    if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error('[ORDERS] get error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
