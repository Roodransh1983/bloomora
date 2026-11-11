import { Router } from 'express';
import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `FLW-${year}-${suffix}`;
}

// ─── POST /api/flower-collections ────────────────────────────────────────────
router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      phone,
      email,
      collectionAddress,
      city,
      pinCode,
      flowerSource,
      quantity,
      flowerType,
      preferredDate,
      additionalInfo,
    } = req.body;

    if (!fullName || !phone || !email || !collectionAddress || !city || !pinCode || !flowerSource || !quantity || !preferredDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Generate unique request number
    let requestNumber: string;
    let attempts = 0;
    do {
      requestNumber = generateRequestNumber();
      attempts++;
      if (attempts > 10) break;
    } while (await prisma.flowerCollection.findUnique({ where: { requestNumber } }));

    const flowerCollection = await prisma.flowerCollection.create({
      data: {
        requestNumber,
        userId: req.user?.id || null,
        fullName,
        phone,
        email,
        collectionAddress,
        city,
        pinCode,
        flowerSource,
        quantity,
        flowerType,
        preferredDate,
        additionalInfo,
      },
    });

    return res.status(201).json({
      success: true,
      flowerCollection,
      message: 'Flower collection request submitted successfully',
    });
  } catch (err) {
    console.error('[FLOWERS] create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/flower-collections/track/:requestNumber ────────────────────────
router.get('/track/:requestNumber', async (req, res: Response) => {
  try {
    const { requestNumber } = req.params;

    const flowerCollection = await prisma.flowerCollection.findUnique({
      where: { requestNumber },
      select: {
        requestNumber: true,
        fullName: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
        flowerSource: true,
        quantity: true,
        preferredDate: true,
        city: true,
      },
    });

    if (!flowerCollection) {
      return res.status(404).json({ success: false, message: 'Flower collection request not found' });
    }

    return res.json({ success: true, flowerCollection });
  } catch (err) {
    console.error('[FLOWERS] track error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/flower-collections ─────────────────────────────────────────────
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const flowerCollections = await prisma.flowerCollection.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, flowerCollections });
  } catch (err) {
    console.error('[FLOWERS] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
