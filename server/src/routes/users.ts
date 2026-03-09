import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/users  (Admin only)
router.get('/', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        return res.json(users);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/users  (Admin only)
router.post('/', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password required' });
    }
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashed, role: role || 'CASHIER' },
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        });
        return res.status(201).json(user);
    } catch (err: any) {
        if (err.code === 'P2002') return res.status(409).json({ error: 'Email already registered' });
        return res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/users/:id  (Admin only)
router.put('/:id', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, role, isActive, password } = req.body;
    try {
        const data: any = { name, role, isActive };
        if (password) data.password = await bcrypt.hash(password, 10);

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data,
            select: { id: true, name: true, email: true, role: true, isActive: true },
        });
        return res.json(user);
    } catch {
        return res.status(500).json({ error: 'Failed to update user' });
    }
});

export default router;
