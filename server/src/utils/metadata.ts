import fs from 'fs/promises';
import path from 'path';

export interface Photo {
    id: string;
    filename: string;
    description: string;
    category: string;
}

const metadataPath = path.join(__dirname, '../../data/metadonnees.json');

export async function readMetadata(): Promise<Photo[]> {
    const raw = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(raw) as Photo[];
}

export async function writeMetadata(photos: Photo[]): Promise<void> {
    await fs.writeFile(metadataPath, JSON.stringify(photos, null, 4), 'utf-8');
}
