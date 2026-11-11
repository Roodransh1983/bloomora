import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/reviews/product/:productId ─────────────────────────────────────
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    return res.json({ success: true, reviews });
  } catch (err) {
    console.error('[REVIEWS] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/reviews/product/:productId ────────────────────────────────────
router.post('/product/:productId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const ratingNum = parseInt(String(rating), 10);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user!.id,
        userName: user?.name || req.user!.name,
        rating: ratingNum,
        comment,
        isApproved: true,
      },
    });

    // Recalculate product rating and reviewCount
    const allReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const reviewCount = allReviews.length;
    const avgRating = reviewCount > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 5.0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount,
      },
    });

    return res.status(201).json({ success: true, review, message: 'Review submitted successfully' });
  } catch (err) {
    console.error('[REVIEWS] create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
