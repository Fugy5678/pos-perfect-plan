import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/products
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { category: 'asc' },
        });
        return res.json(products);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// POST /api/products  (Admin/Super Admin only)
router.post('/', authMiddleware, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    const { name, sku, category, qty, reorder, sellPrice, costPrice } = req.body;
    if (!name || !sku || !category || sellPrice == null || costPrice == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const product = await prisma.product.create({
            data: { name, sku, category, qty: qty ?? 0, reorder: reorder ?? 5, sellPrice, costPrice },
        });
        return res.status(201).json(product);
    } catch (err: any) {
        if (err.code === 'P2002') return res.status(409).json({ error: 'SKU already exists' });
        return res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, category, qty, reorder, sellPrice, costPrice } = req.body;
    try {
        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: { name, category, qty, reorder, sellPrice, costPrice },
        });
        return res.json(product);
    } catch {
        return res.status(500).json({ error: 'Failed to update product' });
    }
});

// PATCH /api/products/:id/stock  – adjust stock quantity
router.patch('/:id/stock', authMiddleware, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { qty, type, reason } = req.body; // qty = absolute new qty, type = PURCHASE|ADJUSTMENT|RETURN
    try {
        const updated = await prisma.$transaction(async (tx) => {
            const current = await tx.product.findUnique({ where: { id: Number(id) } });
            if (!current) throw new Error('Product not found');

            const product = await tx.product.update({
                where: { id: Number(id) },
                data: { qty },
            });

            await tx.stockMovement.create({
                data: {
                    productId: Number(id),
                    type: type || 'ADJUSTMENT',
                    qty: qty - current.qty,
                    reason,
                    reference: `ADJ-${Date.now()}`,
                },
            });

            return product;
        });
        return res.json(updated);
    } catch {
        return res.status(500).json({ error: 'Failed to update stock' });
    }
});

// DELETE /api/products/:id (soft delete)
router.delete('/:id', authMiddleware, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.product.update({ where: { id: Number(id) }, data: { isActive: false } });
        return res.json({ success: true });
    } catch {
        return res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
