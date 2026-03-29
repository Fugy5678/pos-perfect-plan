import { useState, useEffect } from 'react';
import { useReportsStatus } from '@/hooks/useInventory';
import { fetchWithAuth } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { MySalesView } from './MySalesView';

export function ReportsView() {
  const [showAllSales, setShowAllSales] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [agentId, setAgentId] = useState('');
  const [attributedTo, setAttributedTo] = useState('');

  // Fetch lists for filters
  const [agents, setAgents] = useState<{ id: number; name: string }[]>([]);
  const [admins, setAdmins] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchWithAuth('/users').then((data: any) => {
      const users = Array.isArray(data) ? data : data.users || [];
      setAgents(users.filter((u: any) => u.role === 'AGENT'));
      setAdmins(users.filter((u: any) => {
        const lowerName = (u.name || '').trim().toLowerCase();
        return (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') && 
               lowerName !== 'fujimory' && 
               lowerName !== 'admin';
      }));
    }).catch(console.error);
  }, []);

  const { data, isLoading } = useReportsStatus({
    from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    to: dateTo ? new Date(new Date(dateTo).setHours(23, 59, 59, 999)).toISOString() : undefined,
    agentId: agentId || undefined,
    attributedTo: attributedTo || undefined,
  });

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

  const summary = data?.summary || { sales: 0, revenue: 0, cost: 0, profit: 0 };
  const recentSales = data?.recentSales || [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="font-bold text-sm">🔍 Report Filters</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
            />
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
            />
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">Sales Agent</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
            >
              <option value="">All Agents</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">Attributed Admin</label>
            <select
              value={attributedTo}
              onChange={(e) => setAttributedTo(e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
            >
              <option value="">All Admins</option>
              {admins.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading && <div className="p-2 text-center text-xs text-muted-foreground">Refreshing...</div>}

      {/* Summary Cards */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">📊 Summary</h3>
          <button
            onClick={() => setShowAllSales(true)}
            className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors"
          >
            View All Sales →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-muted rounded-xl p-3">
            <div className="text-[11px] text-muted-foreground mb-1">Total Sales</div>
            <div className="text-xl font-black">{summary.sales}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Transactions</div>
          </div>
          <div className="bg-success/10 rounded-xl p-3">
            <div className="text-[11px] text-muted-foreground mb-1">Revenue</div>
            <div className="text-xl font-black text-success">{formatCurrency(summary.revenue)}</div>
            <div className="text-[10px] text-success/80 mt-1">Total collected</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-destructive/10 rounded-xl p-3">
            <div className="text-[11px] text-muted-foreground mb-1">Est. Cost of Goods</div>
            <div className="text-lg font-bold text-destructive">{formatCurrency(summary.cost)}</div>
          </div>
          <div className="bg-primary/10 rounded-xl p-3">
            <div className="text-[11px] text-muted-foreground mb-1">Net Profit</div>
            <div className="text-lg font-bold text-primary">{formatCurrency(summary.profit)}</div>
          </div>
        </div>
      </div>

      {/* Filtered Activity */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">🕒 Filtered Transactions</h3>
        {recentSales.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {recentSales.map((sale: any) => {
              const attrMatch = sale.notes?.match(/^\[(.*?)\]/);
              return (
                <div key={sale.id} className="flex justify-between items-center py-2 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <div className="font-bold text-sm">{sale.receiptNo}</div>
                    <div className="text-[11px] text-muted-foreground">
                      By {sale.user?.name || 'Unknown'} • {formatDateTime(sale.createdAt)}
                    </div>
                    {attrMatch && (
                      <div className="text-[10px] text-primary mt-0.5 font-semibold">
                        🏷️ Attributed to: {attrMatch[1]}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-success">{formatCurrency(Number(sale.total))}</div>
                    <div className="text-[10px] text-muted-foreground">{sale.paymentMode}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-muted-foreground py-4">No sales match these filters</div>
        )}
      </div>
    </div>
  );
}
