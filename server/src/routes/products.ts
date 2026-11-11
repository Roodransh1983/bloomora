import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/products ────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      sort,
      featured,
      bestseller,
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (featured === 'true') where.isFeatured = true;
    if (bestseller === 'true') where.isBestseller = true;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'popular') orderBy = { reviewCount: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      success: true,
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('[PRODUCTS] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product });
  } catch (err) {
    console.error('[PRODUCTS] get error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/products ───────────────────────────────────────────────────────
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      details,
      price,
      originalPrice,
      stock,
      sustainabilityLabel,
      categoryId,
      isFeatured,
      isBestseller,
      images,
    } = req.body;

    if (!name || !slug || !description || !price || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name, slug, description, price, and categoryId are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        details,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: stock ? parseInt(stock, 10) : 0,
        sustainabilityLabel,
        categoryId,
        isFeatured: Boolean(isFeatured),
        isBestseller: Boolean(isBestseller),
        images: images && Array.isArray(images)
          ? {
              create: images.map((img: any, idx: number) => ({
                url: img.url,
                altText: img.altText || name,
                isPrimary: img.isPrimary ?? idx === 0,
                displayOrder: img.displayOrder ?? idx,
              })),
            }
          : undefined,
      },
      include: { images: true, category: true },
    });

    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Product slug already exists' });
    }
    console.error('[PRODUCTS] create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      details,
      price,
      originalPrice,
      stock,
      sustainabilityLabel,
      categoryId,
      isFeatured,
      isBestseller,
      images,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If images provided, replace all existing images
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(details !== undefined && { details }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(sustainabilityLabel !== undefined && { sustainabilityLabel }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(isBestseller !== undefined && { isBestseller: Boolean(isBestseller) }),
        ...(images && Array.isArray(images) && {
          images: {
            create: images.map((img: any, idx: number) => ({
              url: img.url,
              altText: img.altText || name,
              isPrimary: img.isPrimary ?? idx === 0,
              displayOrder: img.displayOrder ?? idx,
            })),
          },
        }),
      },
      include: { images: true, category: true },
    });

    return res.json({ success: true, product });
  } catch (err) {
    console.error('[PRODUCTS] update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await prisma.product.delete({ where: { id } });

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[PRODUCTS] delete error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
