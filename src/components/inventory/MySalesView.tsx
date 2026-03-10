import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface SaleItem {
    id: number;
    qty: number;
    unitPrice: number;
    total: number;
    product: { name: string; sku: string };
}

interface Sale {
    id: number;
    receiptNo: string;
    total: number;
    amountPaid: number;
    paymentMode: string;
    notes?: string;
    createdAt: string;
    user: { name: string };
    attributedTo?: { name: string } | null;
    items: SaleItem[];
}

interface SalesResponse {
    sales: Sale[];
    total: number;
    page: number;
    pages: number;
}

const PAYMENT_ICON: Record<string, string> = {
    CASH: '💵',
    MPESA: '📱',
    CARD: '💳',
    MIXED: '🔀',
};

export function MySalesView() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useQuery<SalesResponse>({
        queryKey: ['sales', page],
        queryFn: () => fetchWithAuth(`/sales?page=${page}&limit=20`),
    });

    const sales = data?.sales || [];
    const totalSales = data?.total || 0;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h2 className="text-base font-bold">{isAdmin ? 'All Sales' : 'My Sales'}</h2>
                <p className="text-xs text-muted-foreground">
                    {totalSales} sale{totalSales !== 1 ? 's' : ''} recorded
                    {sales.length > 0 && ` · KES ${totalRevenue.toLocaleString()} this page`}
                </p>
            </div>

            {isLoading && (
                <div className="text-center text-sm text-muted-foreground py-10">Loading sales...</div>
            )}
            {isError && (
                <div className="text-center text-sm text-destructive py-10">Failed to load sales.</div>
            )}

            {!isLoading && sales.length === 0 && (
                <div className="text-center text-muted-foreground py-10 space-y-2">
                    <p className="text-3xl">🛍️</p>
                    <p className="text-sm font-medium">No sales recorded yet</p>
                    <p className="text-xs">Sales you record will appear here</p>
                </div>
            )}

            {/* Sales list */}
            <div className="space-y-2.5">
                {sales.map((sale) => (
                    <div
                        key={sale.id}
                        className="border border-border rounded-[14px] p-3 bg-card space-y-2"
                    >
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-bold">{sale.receiptNo}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {new Date(sale.createdAt).toLocaleString('en-KE', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-primary">
                                    KES {Number(sale.total).toLocaleString()}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {PAYMENT_ICON[sale.paymentMode] || '💰'} {sale.paymentMode}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-1">
                            {sale.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                                    <span>{item.product.name} × {item.qty}</span>
                                    <span>KES {Number(item.total).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Attribution / sold by */}
                        {(isAdmin || sale.attributedTo) && (
                            <div className="flex items-center gap-1.5 pt-1 border-t border-dashed border-border">
                                <span className="text-[11px] text-muted-foreground">
                                    {isAdmin && `Recorded by: ${sale.user.name}`}
                                    {sale.attributedTo && (
                                        <span className="ml-2 font-semibold text-primary">
                                            👤 Agent: {sale.attributedTo.name}
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}

                        {sale.notes && (
                            <p className="text-[11px] text-muted-foreground border-t border-dashed border-border pt-1">
                                📝 {sale.notes}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="text-xs px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted"
                    >
                        ← Prev
                    </button>
                    <span className="text-xs text-muted-foreground">
                        Page {data.page} of {data.pages}
                    </span>
                    <button
                        disabled={page >= data.pages}
                        onClick={() => setPage((p) => p + 1)}
                        className="text-xs px-3 py-1.5 border border-border rounded-lg disabled:opacity-40 hover:bg-muted"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
