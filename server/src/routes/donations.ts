import { Router } from 'express';
import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

function generateDonationNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `DON-${year}-${suffix}`;
}

// ─── POST /api/donations ──────────────────────────────────────────────────────
router.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      mobile,
      email,
      pickupAddress,
      city,
      pinCode,
      clothingCategory,
      itemCount,
      clothingCondition,
      preferredPickupDate,
      notes,
    } = req.body;

    if (!fullName || !mobile || !email || !pickupAddress || !city || !pinCode || !clothingCategory || !itemCount || !clothingCondition || !preferredPickupDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    // Generate unique donation number
    let donationNumber: string;
    let attempts = 0;
    do {
      donationNumber = generateDonationNumber();
      attempts++;
      if (attempts > 10) break;
    } while (await prisma.donation.findUnique({ where: { donationNumber } }));

    const donation = await prisma.donation.create({
      data: {
        donationNumber,
        userId: req.user?.id || null,
        fullName,
        mobile,
        email,
        pickupAddress,
        city,
        pinCode,
        clothingCategory,
        itemCount: parseInt(String(itemCount), 10),
        clothingCondition,
        preferredPickupDate,
        notes,
      },
    });

    return res.status(201).json({
      success: true,
      donation,
      message: 'Donation request submitted successfully',
    });
  } catch (err) {
    console.error('[DONATIONS] create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/donations/track/:donationNumber ─────────────────────────────────
router.get('/track/:donationNumber', async (req, res: Response) => {
  try {
    const { donationNumber } = req.params;

    const donation = await prisma.donation.findUnique({
      where: { donationNumber },
      select: {
        donationNumber: true,
        fullName: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
        clothingCategory: true,
        itemCount: true,
        preferredPickupDate: true,
        city: true,
      },
    });

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    return res.json({ success: true, donation });
  } catch (err) {
    console.error('[DONATIONS] track error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/donations ───────────────────────────────────────────────────────
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, donations });
  } catch (err) {
    console.error('[DONATIONS] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
