import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/categories ──────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    return res.json({ success: true, categories });
  } catch (err) {
    console.error('[CATEGORIES] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/categories/:slug ────────────────────────────────────────────────
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, category });
  } catch (err) {
    console.error('[CATEGORIES] get error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/categories ─────────────────────────────────────────────────────
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, image } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' });
    }

    const category = await prisma.category.create({
      data: { name, slug, description, image },
    });

    return res.status(201).json({ success: true, category });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Category name or slug already exists' });
    }
    console.error('[CATEGORIES] create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PUT /api/categories/:id ──────────────────────────────────────────────────
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
      },
    });

    return res.json({ success: true, category });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Category name or slug already exists' });
    }
    console.error('[CATEGORIES] update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await prisma.category.delete({ where: { id } });

    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('[CATEGORIES] delete error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
