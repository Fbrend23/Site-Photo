import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { readMetadata, writeMetadata } from '../utils/metadata';

const router = Router();

const galeriePath = path.join(__dirname, '../../data/galerie');

// GET / — list all photos
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const photos = await readMetadata();
        res.json({ photos });
    } catch (err) {
        next(err);
    }
});

// GET /:id — get a single photo
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photos = await readMetadata();
        const photo = photos.find(p => p.id === req.params.id);
        if (!photo) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }
        res.json({ photo });
    } catch (err) {
        next(err);
    }
});

// PUT /:id — update description and/or category
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photos = await readMetadata();
        const index = photos.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }

        const { description, category } = req.body;
        if (description !== undefined) photos[index].description = description;
        if (category !== undefined) photos[index].category = category;

        await writeMetadata(photos);
        res.json({ photo: photos[index] });
    } catch (err) {
        next(err);
    }
});

// DELETE /:id — delete photo from metadata and disk
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const photos = await readMetadata();
        const index = photos.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }

        const [removed] = photos.splice(index, 1);

        // Delete the image file from disk
        const filePath = path.join(galeriePath, removed.filename);
        try {
            await fs.unlink(filePath);
        } catch {
            // File may already be missing, continue anyway
        }

        await writeMetadata(photos);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

export default router;
