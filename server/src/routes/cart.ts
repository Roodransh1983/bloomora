import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { optionalAuthenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/** Resolve the cart for a request (by userId or sessionKey) */
async function resolveCart(req: AuthenticatedRequest) {
  const userId = req.user?.id;
  const sessionKey = req.headers['x-session-key'] as string | undefined;

  if (userId) {
    return prisma.cart.findFirst({ where: { userId } });
  } else if (sessionKey) {
    return prisma.cart.findUnique({ where: { sessionKey } });
  }
  return null;
}

async function getOrCreateCart(req: AuthenticatedRequest) {
  const userId = req.user?.id;
  const sessionKey = req.headers['x-session-key'] as string | undefined;

  if (!userId && !sessionKey) {
    return null;
  }

  if (userId) {
    const existing = await prisma.cart.findFirst({ where: { userId } });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId } });
  } else if (sessionKey) {
    const existing = await prisma.cart.findUnique({ where: { sessionKey } });
    if (existing) return existing;
    return prisma.cart.create({ data: { sessionKey } });
  }

  return null;
}

// ─── GET /api/cart ────────────────────────────────────────────────────────────
router.get('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cart = await resolveCart(req);

    if (!cart) {
      return res.json({ success: true, cart: null, items: [] });
    }

    const cartWithItems = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return res.json({ success: true, cart: cartWithItems });
  } catch (err) {
    console.error('[CART] get error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/cart/items ─────────────────────────────────────────────────────
router.post('/items', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }

    const cart = await getOrCreateCart(req);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Session key or authentication required' });
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    let item;
    if (existingItem) {
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(String(quantity), 10) },
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: parseInt(String(quantity), 10) },
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
      });
    }

    return res.status(201).json({ success: true, item });
  } catch (err) {
    console.error('[CART] add item error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PUT /api/cart/items/:itemId ──────────────────────────────────────────────
router.put('/items/:itemId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || parseInt(String(quantity), 10) < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await resolveCart(req);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Cart not found' });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: parseInt(String(quantity), 10) },
      include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
    });

    return res.json({ success: true, item: updated });
  } catch (err) {
    console.error('[CART] update item error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── DELETE /api/cart/items/:itemId ──────────────────────────────────────────
router.delete('/items/:itemId', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    const cart = await resolveCart(req);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Cart not found' });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('[CART] remove item error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
router.delete('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cart = await resolveCart(req);

    if (!cart) {
      return res.json({ success: true, message: 'Cart already empty' });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('[CART] clear error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
