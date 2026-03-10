import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/sales  – create a new sale and deduct stock
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    const { items, discount, amountPaid, paymentMode, notes } = req.body;
    const userId = (req as any).user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No items in sale' });
    }

    try {
        const sale = await prisma.$transaction(async (tx) => {
            // Calculate totals
            let subtotal = 0;
            const resolvedItems: any[] = [];

            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product || !product.isActive) throw new Error(`Product ${item.productId} not found`);
                if (product.qty < item.qty) throw new Error(`Insufficient stock for ${product.name}`);

                const itemTotal = Number(product.sellPrice) * item.qty;
                subtotal += itemTotal;
                resolvedItems.push({ product, qty: item.qty, unitPrice: product.sellPrice, total: itemTotal });
            }

            const discountAmt = Number(discount) || 0;
            const total = subtotal - discountAmt;
            const change = Number(amountPaid) - total;
            const receiptNo = `RCP-${Date.now()}`;

            // Create sale record
            const newSale = await tx.sale.create({
                data: {
                    receiptNo,
                    userId,
                    subtotal,
                    discount: discountAmt,
                    total,
                    amountPaid: Number(amountPaid),
                    change,
                    paymentMode: paymentMode || 'CASH',
                    notes,
                    items: {
                        create: resolvedItems.map((i) => ({
                            productId: i.product.id,
                            qty: i.qty,
                            unitPrice: i.unitPrice,
                            total: i.total,
                        })),
                    },
                },
                include: { items: { include: { product: true } }, user: true },
            });

            // Deduct stock and log movements
            for (const i of resolvedItems) {
                await tx.product.update({
                    where: { id: i.product.id },
                    data: { qty: { decrement: i.qty } },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: i.product.id,
                        type: 'SALE',
                        qty: -i.qty,
                        reference: receiptNo,
                    },
                });
            }

            return newSale;
        });

        return res.status(201).json(sale);
    } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to create sale' });
    }
});

// GET /api/sales  – list sales with pagination
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = (req as any).user;
    const whereCondition = user.role === 'AGENT' ? { userId: user.id } : {};

    try {
        const [sales, total] = await Promise.all([
            prisma.sale.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                    items: { include: { product: { select: { name: true, sku: true } } } },
                },
            }),
            prisma.sale.count({ where: whereCondition }),
        ]);

        return res.json({ sales, total, page, pages: Math.ceil(total / limit) });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

// GET /api/sales/:id  – single sale with full details
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: Number(id) },
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: true } },
            },
        });
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        return res.json(sale);
    } catch {
        return res.status(500).json({ error: 'Failed to fetch sale' });
    }
});

export default router;
