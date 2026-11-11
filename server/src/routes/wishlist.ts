import { Router } from 'express';
import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// All wishlist routes require authentication
router.use(authenticateToken);

// ─── GET /api/wishlist ────────────────────────────────────────────────────────
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, wishlist });
  } catch (err) {
    console.error('[WISHLIST] get error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/wishlist/:productId ────────────────────────────────────────────
router.post('/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user!.id, productId } },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' });
    }

    const item = await prisma.wishlist.create({
      data: { userId: req.user!.id, productId },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

    return res.status(201).json({ success: true, item, message: 'Added to wishlist' });
  } catch (err) {
    console.error('[WISHLIST] add error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── DELETE /api/wishlist/:productId ─────────────────────────────────────────
router.delete('/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user!.id, productId } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not in wishlist' });
    }

    await prisma.wishlist.delete({
      where: { userId_productId: { userId: req.user!.id, productId } },
    });

    return res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    console.error('[WISHLIST] remove error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
