import { Router } from 'express';
import type { Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// ─── POST /api/media/upload ───────────────────────────────────────────────────
router.post(
  '/upload',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      const { altText, category } = req.body;
      const url = `/uploads/${req.file.filename}`;

      const media = await prisma.mediaLibrary.create({
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url,
          altText: altText || null,
          category: category || 'general',
        },
      });

      return res.status(201).json({ success: true, media });
    } catch (err) {
      console.error('[MEDIA] upload error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },
);

// ─── POST /api/media/upload-multiple ─────────────────────────────────────────
router.post(
  '/upload-multiple',
  authenticateToken,
  requireAdmin,
  upload.array('images', 10),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No image files provided' });
      }

      const { category } = req.body;

      const mediaItems = await Promise.all(
        files.map((file) =>
          prisma.mediaLibrary.create({
            data: {
              filename: file.filename,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              url: `/uploads/${file.filename}`,
              category: category || 'general',
            },
          }),
        ),
      );

      return res.status(201).json({ success: true, media: mediaItems, count: mediaItems.length });
    } catch (err) {
      console.error('[MEDIA] upload-multiple error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },
);

// ─── GET /api/media ───────────────────────────────────────────────────────────
router.get('/', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const media = await prisma.mediaLibrary.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, media, total: media.length });
  } catch (err) {
    console.error('[MEDIA] list error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── DELETE /api/media/:id ────────────────────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const media = await prisma.mediaLibrary.findUnique({ where: { id } });
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'uploads', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.mediaLibrary.delete({ where: { id } });

    return res.json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    console.error('[MEDIA] delete error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
