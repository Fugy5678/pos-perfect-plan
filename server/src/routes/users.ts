import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/users
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { role } = req.query;
        const requestUser = (req as any).user;

        // Agents are only allowed to fetch list of Admins/Super Admins for attribution
        if (requestUser.role === 'AGENT' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Agents can only fetch admin lists' });
        }

        const users = await prisma.user.findMany({
            where: role ? { role: String(role) as any } : undefined,
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        return res.json(users);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/users  (Admin/Super Admin only)
router.post('/', authMiddleware, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const requestUser = (req as any).user;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password required' });
    }

    // Role hierarchy check
    const targetRole = role || 'AGENT';
    if (requestUser.role === 'ADMIN' && targetRole !== 'AGENT') {
        return res.status(403).json({ error: 'Admins can only create AGENT accounts' });
    }

    // Auto-generate an internal email if not provided (agents log in by name)
    const resolvedEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@jvnpos.local`;

    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email: resolvedEmail, password: hashed, role: targetRole },
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        });
        return res.status(201).json(user);
    } catch (err: any) {
        if (err.code === 'P2002') return res.status(409).json({ error: 'A user with that name or email already exists' });
        return res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/users/:id  (Admin/Super Admin only)
router.put('/:id', authMiddleware, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, role, isActive, password } = req.body;
    const requestUser = (req as any).user;

    // Hierarchy check: Admins cannot promote to ADMIN or SUPER_ADMIN
    if (role && requestUser.role === 'ADMIN' && role !== 'AGENT') {
        return res.status(403).json({ error: 'Admins can only set role to AGENT' });
    }

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
