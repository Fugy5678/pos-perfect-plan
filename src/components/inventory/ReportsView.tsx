import { useState } from 'react';
import { useReportsStatus } from '@/hooks/useInventory';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { MySalesView } from './MySalesView';

export function ReportsView() {
  const { data, isLoading } = useReportsStatus();
  const [showAllSales, setShowAllSales] = useState(false);

  if (showAllSales) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowAllSales(false)}
          className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
        >
          ← Back to Reports
        </button>
        <MySalesView />
      </div>
    );
  }

  if (isLoading) return <div className="p-4 text-center text-sm text-muted-foreground">Loading reports...</div>;

  const today = data?.today || { sales: 0, revenue: 0 };
  const recentSales = data?.recentSales || [];

  return (
    <div className="space-y-4">
      {/* Daily Summary */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">📊 Today's Summary</h3>
          <button
            onClick={() => setShowAllSales(true)}
            className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors"
          >
            View All Sales →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted rounded-xl p-3">
            <div className="text-[11px] text-muted-foreground mb-1">Total Sales</div>
            <div className="text-2xl font-black">{today.sales}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Transactions today</div>
          </div>
          <div className="bg-success/10 rounded-xl p-3">
            <div className="text-[11px] text-muted-foreground mb-1">Revenue</div>
            <div className="text-xl font-black text-success">{formatCurrency(today.revenue)}</div>
            <div className="text-[10px] text-success/80 mt-1">Total collected</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">🕒 Recent Activity (All Agents)</h3>
        {recentSales.length > 0 ? (
          <div className="space-y-3">
            {recentSales.map((sale: any) => (
              <div key={sale.id} className="flex justify-between items-center py-2 border-b border-border last:border-0 last:pb-0">
                <div>
                  <div className="font-bold text-sm">{sale.receiptNo}</div>
                  <div className="text-[11px] text-muted-foreground">
                    By {sale.user?.name || 'Unknown'} • {formatDateTime(sale.createdAt)}
                  </div>
                  {sale.notes && sale.notes.startsWith('[') && (
                    <div className="text-[10px] text-primary mt-0.5">
                      🏷️ {sale.notes.match(/^\[(.*?)\]/)?.[1]}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-success">{formatCurrency(Number(sale.total))}</div>
                  <div className="text-[10px] text-muted-foreground">{sale.paymentMode}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-muted-foreground py-4">No recent sales</div>
        )}
      </div>
    </div>
  );
}
