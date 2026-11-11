import { Router } from 'express';
import type { Response, Request } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/content - List all website content
router.get('/', async (_req: Request, res: Response) => {
  try {
    const content = await prisma.websiteContent.findMany({
      orderBy: { section: 'asc' },
    });
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
});

// GET /api/content/:key - Get content by key
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const content = await prisma.websiteContent.findUnique({ where: { key } });

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Get content by key error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
});

// PUT /api/content/:key - Admin: update content
router.put('/:key', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { title, subtitle, image, content, section } = req.body;

    const updated = await prisma.websiteContent.upsert({
      where: { key },
      update: { title, subtitle, image, content },
      create: { key, section: section || 'general', title, subtitle, image, content },
    });

    res.json({ success: true, message: 'Content updated', data: updated });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
});

export default router;
