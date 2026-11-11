import { Router } from 'express';
import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// ─── GET /api/users/profile ───────────────────────────────────────────────────
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error('[USERS] profile get error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
      },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    return res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('[USERS] profile update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PUT /api/users/password ──────────────────────────────────────────────────
router.put('/password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('[USERS] password change error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/users/addresses ─────────────────────────────────────────────────
router.get('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return res.json({ success: true, addresses });
  } catch (err) {
    console.error('[USERS] addresses list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── POST /api/users/addresses ────────────────────────────────────────────────
router.post('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, phone, street, city, state, pinCode, isDefault } = req.body;

    if (!fullName || !phone || !street || !city || !state || !pinCode) {
      return res.status(400).json({ success: false, message: 'All address fields are required' });
    }

    // If setting as default, unset previous defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        fullName,
        phone,
        street,
        city,
        state,
        pinCode,
        isDefault: Boolean(isDefault),
      },
    });

    return res.status(201).json({ success: true, address });
  } catch (err) {
    console.error('[USERS] address create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── PUT /api/users/addresses/:id ────────────────────────────────────────────
router.put('/addresses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phone, street, city, state, pinCode, isDefault } = req.body;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If setting as default, unset previous defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(street !== undefined && { street }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pinCode !== undefined && { pinCode }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      },
    });

    return res.json({ success: true, address });
  } catch (err) {
    console.error('[USERS] address update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── DELETE /api/users/addresses/:id ─────────────────────────────────────────
router.delete('/addresses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });

    return res.json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    console.error('[USERS] address delete error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/users/orders ────────────────────────────────────────────────────
router.get('/orders', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return res.json({ success: true, orders });
  } catch (err) {
    console.error('[USERS] orders list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/users/donations ─────────────────────────────────────────────────
router.get('/donations', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, donations });
  } catch (err) {
    console.error('[USERS] donations list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/users/flower-collections ───────────────────────────────────────
router.get('/flower-collections', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const flowerCollections = await prisma.flowerCollection.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, flowerCollections });
  } catch (err) {
    console.error('[USERS] flower collections list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
