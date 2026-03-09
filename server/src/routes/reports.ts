import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/reports/summary  – dashboard summary
router.get('/summary', authMiddleware, async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalSalesToday, totalRevenueToday, lowStockProducts, topProducts, recentSales] =
            await Promise.all([
                prisma.sale.count({ where: { createdAt: { gte: today }, status: 'COMPLETED' } }),
                prisma.sale.aggregate({
                    where: { createdAt: { gte: today }, status: 'COMPLETED' },
                    _sum: { total: true },
                }),
                prisma.product.findMany({
                    where: { isActive: true, qty: { lte: prisma.product.fields.reorder } },
                    orderBy: { qty: 'asc' },
                    take: 10,
                }),
                prisma.saleItem.groupBy({
                    by: ['productId'],
                    _sum: { qty: true, total: true },
                    orderBy: { _sum: { total: 'desc' } },
                    take: 5,
                }),
                prisma.sale.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true } } },
                }),
            ]);

        // Get product details for top products
        const topProductIds = topProducts.map((p) => p.productId);
        const topProductDetails = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true, sku: true },
        });

        const topProductsWithNames = topProducts.map((p) => ({
            ...p,
            product: topProductDetails.find((d) => d.id === p.productId),
        }));

        return res.json({
            today: {
                sales: totalSalesToday,
                revenue: totalRevenueToday._sum.total ?? 0,
            },
            lowStock: lowStockProducts,
            topProducts: topProductsWithNames,
            recentSales,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to get summary' });
    }
});

// GET /api/reports/sales-by-date?from=&to=
router.get('/sales-by-date', authMiddleware, requireRole(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 7 * 86400000);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();

    try {
        const sales = await prisma.sale.findMany({
            where: { createdAt: { gte: from, lte: to }, status: 'COMPLETED' },
            select: { createdAt: true, total: true, discount: true, paymentMode: true },
            orderBy: { createdAt: 'asc' },
        });

        // Group by date
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

        const totalInventoryValue = products.reduce(
            (sum, p) => sum + Number(p.costPrice) * p.qty,
            0
        );
        const totalRetailValue = products.reduce(
            (sum, p) => sum + Number(p.sellPrice) * p.qty,
            0
        );
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
