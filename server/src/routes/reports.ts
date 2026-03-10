import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/reports/summary
router.get('/summary', authMiddleware, async (req: Request, res: Response) => {
    try {
        const fromDate = req.query.from ? new Date(req.query.from as string) : new Date(new Date().setHours(0, 0, 0, 0));
        const toDate = req.query.to ? new Date(req.query.to as string) : new Date();
        const agentId = req.query.agentId ? Number(req.query.agentId) : undefined;
        const attributedTo = req.query.attributedTo as string;

        const whereCondition: any = {
            createdAt: { gte: fromDate, lte: toDate },
            status: 'COMPLETED'
        };

        if (agentId) whereCondition.userId = agentId;
        if (attributedTo) whereCondition.notes = { startsWith: `[${attributedTo}]` };

        // Fetch sales with items to calculate total cost and net profit
        const filteredSales = await prisma.sale.findMany({
            where: whereCondition,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } },
                items: { include: { product: { select: { costPrice: true } } } }
            }
        });

        let totalRevenue = 0;
        let totalCost = 0;
        const totalSalesCount = filteredSales.length;

        filteredSales.forEach(sale => {
            totalRevenue += Number(sale.total);
            sale.items.forEach(item => {
                totalCost += Number(item.product?.costPrice || 0) * item.qty;
            });
        });

        const netProfit = totalRevenue - totalCost;

        // Fetch low stock products (global, not filtered)
        const lowStockProducts = await prisma.product.findMany({
            where: { isActive: true, qty: { lte: prisma.product.fields.reorder } },
            orderBy: { qty: 'asc' },
            take: 10,
        });

        return res.json({
            summary: {
                sales: totalSalesCount,
                revenue: totalRevenue,
                cost: totalCost,
                profit: netProfit,
            },
            recentSales: filteredSales.slice(0, 50), // Send up to 50 matching sales for the table
            lowStock: lowStockProducts,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to get summary' });
    }
});

// GET /api/reports/sales-by-date
router.get('/sales-by-date', authMiddleware, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req: Request, res: Response) => {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 7 * 86400000);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();

    try {
        const sales = await prisma.sale.findMany({
            where: { createdAt: { gte: from, lte: to }, status: 'COMPLETED' },
            select: { createdAt: true, total: true, discount: true, paymentMode: true },
            orderBy: { createdAt: 'asc' },
        });

        const grouped: Record<string, { date: string; revenue: number; sales: number }> = {};
        for (const s of sales) {
            const date = s.createdAt.toISOString().split('T')[0];
            if (!grouped[date]) grouped[date] = { date, revenue: 0, sales: 0 };
            grouped[date].revenue += Number(s.total);
            grouped[date].sales += 1;
        }

        return res.json(Object.values(grouped));
    } catch {
        return res.status(500).json({ error: 'Failed to get report' });
    }
});

// GET /api/reports/stock
router.get('/stock', authMiddleware, async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: [{ category: 'asc' }, { qty: 'asc' }],
        });

        const totalInventoryValue = products.reduce((sum, p) => sum + Number(p.costPrice) * p.qty, 0);
        const totalRetailValue = products.reduce((sum, p) => sum + Number(p.sellPrice) * p.qty, 0);
        const lowStock = products.filter((p) => p.qty <= p.reorder);
        const outOfStock = products.filter((p) => p.qty === 0);

        return res.json({
            products,
            summary: {
                totalProducts: products.length,
                totalInventoryValue,
                totalRetailValue,
                potentialProfit: totalRetailValue - totalInventoryValue,
                lowStockCount: lowStock.length,
                outOfStockCount: outOfStock.length,
            },
        });
    } catch {
        return res.status(500).json({ error: 'Failed to get stock report' });
    }
});

export default router;
