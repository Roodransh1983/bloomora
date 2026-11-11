import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ─── POST /api/newsletter ─────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return res.status(201).json({
      success: true,
      subscriber,
      message: 'Successfully subscribed to the newsletter',
    });
  } catch (err) {
    console.error('[NEWSLETTER] subscribe error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── GET /api/newsletter ──────────────────────────────────────────────────────
router.get('/', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, subscribers, total: subscribers.length });
  } catch (err) {
    console.error('[NEWSLETTER] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
