import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { readMetadata, writeMetadata, Photo } from '../utils/metadata';
import { convertToWebp } from '../utils/imageProcessor';

const router = Router();

const galeriePath = path.join(__dirname, '../../data/galerie');

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, galeriePath);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `img_${nanoid()}_${ext}`);
    }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, and PNG files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST / — upload a new photo
router.post('/', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image file provided' });
            return;
        }

        const { description, category } = req.body;
        if (!description || !category) {
            res.status(400).json({ error: 'Description and category are required' });
            return;
        }

        // Convert the uploaded file to WebP
        const uploadedPath = req.file.path;
        const webpFilename = path.parse(req.file.filename).name + '.webp';
        const webpPath = path.join(galeriePath, webpFilename);

        await convertToWebp(uploadedPath, webpPath);

        // Create the new photo entry
        const newPhoto: Photo = {
            id: nanoid(),
            filename: webpFilename,
            description,
            category
        };

        const photos = await readMetadata();
        photos.push(newPhoto);
        await writeMetadata(photos);

        res.status(201).json({ photo: newPhoto });
    } catch (err) {
        next(err);
    }
});

export default router;
