import sharp from 'sharp';
import fs from 'fs/promises';

export async function convertToWebp(inputPath: string, outputPath: string): Promise<void> {
    await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);

    await fs.unlink(inputPath);
}
