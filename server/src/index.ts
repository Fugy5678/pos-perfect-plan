import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './routes/auth';
import productsRouter from './routes/products';
import salesRouter from './routes/sales';
import reportsRouter from './routes/reports';
import usersRouter from './routes/users';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req: express.Request, res: express.Response) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);

// 404 handler
app.use((req: express.Request, res: express.Response) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
    console.log(`🚀 POS API server running on port ${PORT}`);
});

export default app;
