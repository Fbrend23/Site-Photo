import express from 'express';
import cors from 'cors';
import path from 'path';
import uploadRouter from './routes/upload';
import photosRouter from './routes/photos';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Static files: serve gallery images
app.use('/uploads/galerie', express.static(path.join(__dirname, '../data/galerie')));

// API routes — upload MUST be mounted before the generic photos CRUD router
app.use('/api/photos/upload', uploadRouter);
app.use('/api/photos', photosRouter);

// Production: serve the client SPA
if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
