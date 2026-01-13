import { useState } from 'react';
import { toast } from 'sonner';
import { AuditEntry } from '@/types/inventory';
import { formatCurrency, formatDateTime } from '@/lib/formatters';

interface ReportsViewProps {
  auditLog: AuditEntry[];
}

interface ReportCardProps {
  title: string;
  description: string;
  onOpen: () => void;
  onExport: () => void;
}

function ReportCard({ title, description, onOpen, onExport }: ReportCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
      <h3 className="font-bold text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{description}</p>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpen}
          className="bg-primary text-primary-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
        >
          Open
        </button>
        <button
          onClick={onExport}
          className="bg-card border border-border text-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
        >
          Export
        </button>
      </div>
    </div>
  );
}

function DailySummaryCard({ auditLog }: { auditLog: AuditEntry[] }) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const dayEntries = auditLog.filter((entry) => {
    const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
    return entryDate === selectedDate;
  });

  const sales = dayEntries.filter((e) => e.reason === 'Sale');
  const stockIns = dayEntries.filter((e) => e.delta > 0 && e.reason !== 'Sale');

  const totalSalesCount = sales.length;
  const totalItemsSold = sales.reduce((sum, e) => sum + Math.abs(e.delta), 0);
  const totalRevenue = sales.reduce((sum, e) => sum + (e.saleAmount || 0), 0);
  const totalCost = sales.reduce((sum, e) => sum + (e.costAmount || 0), 0);
  const grossProfit = totalRevenue - totalCost;

  const cashSales = sales.filter((e) => e.paymentType === 'cash');
  const bnplSales = sales.filter((e) => e.paymentType === 'bnpl');
  const cashRevenue = cashSales.reduce((sum, e) => sum + (e.saleAmount || 0), 0);
  const bnplRevenue = bnplSales.reduce((sum, e) => sum + (e.saleAmount || 0), 0);

  const stockInCount = stockIns.reduce((sum, e) => sum + e.delta, 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">📊 Daily Summary</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-xs border border-border rounded-lg px-2 py-1 bg-background"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-muted rounded-xl p-2.5">
          <div className="text-[11px] text-muted-foreground">Total Sales</div>
          <div className="text-lg font-bold">{totalSalesCount}</div>
          <div className="text-xs text-muted-foreground">{totalItemsSold} items sold</div>
        </div>
        <div className="bg-success/10 rounded-xl p-2.5">
          <div className="text-[11px] text-muted-foreground">Revenue</div>
          <div className="text-lg font-bold text-success">{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-primary/10 rounded-xl p-2.5">
          <div className="text-[11px] text-muted-foreground">💵 Cash Sales</div>
          <div className="text-sm font-bold">{formatCurrency(cashRevenue)}</div>
          <div className="text-xs text-muted-foreground">{cashSales.length} transactions</div>
        </div>
        <div className="bg-warning/10 rounded-xl p-2.5">
          <div className="text-[11px] text-muted-foreground">📅 BNPL Sales</div>
          <div className="text-sm font-bold">{formatCurrency(bnplRevenue)}</div>
          <div className="text-xs text-muted-foreground">{bnplSales.length} transactions</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-muted rounded-xl p-2.5 text-center">
          <div className="text-[11px] text-muted-foreground">Cost</div>
          <div className="text-sm font-bold">{formatCurrency(totalCost)}</div>
        </div>
        <div className="bg-success/10 rounded-xl p-2.5 text-center">
          <div className="text-[11px] text-muted-foreground">Profit</div>
          <div className="text-sm font-bold text-success">{formatCurrency(grossProfit)}</div>
        </div>
        <div className="bg-primary/10 rounded-xl p-2.5 text-center">
          <div className="text-[11px] text-muted-foreground">Stock In</div>
          <div className="text-sm font-bold">+{stockInCount}</div>
        </div>
      </div>

      <div className="border-t border-border pt-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Net Cash Today</span>
          <span className="text-sm font-bold text-success">{formatCurrency(cashRevenue)}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">Pending (BNPL)</span>
          <span className="text-sm font-bold text-warning">{formatCurrency(bnplRevenue)}</span>
        </div>
      </div>

      {dayEntries.length === 0 && (
        <div className="text-center text-xs text-muted-foreground py-4">
          No transactions for this date
        </div>
      )}
    </div>
  );
}

function BNPLDueCard({ auditLog }: { auditLog: AuditEntry[] }) {
  const bnplEntries = auditLog.filter((e) => e.paymentType === 'bnpl' && e.bnplDueDate);
  const today = new Date();
  
  const overdue = bnplEntries.filter((e) => new Date(e.bnplDueDate!) < today);
  const upcoming = bnplEntries.filter((e) => new Date(e.bnplDueDate!) >= today).slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
      <h3 className="font-bold text-sm mb-2">📅 BNPL Payments Due</h3>
      
      {overdue.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-bold text-destructive mb-1">⚠️ Overdue ({overdue.length})</div>
          {overdue.slice(0, 3).map((entry) => (
            <div key={entry.id} className="text-xs py-1 border-b border-border last:border-0">
              <div className="flex justify-between">
                <span>{entry.productName}</span>
                <span className="font-bold">{formatCurrency(entry.saleAmount || 0)}</span>
              </div>
              <div className="text-destructive">Due: {formatDateTime(entry.bnplDueDate!)}</div>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <div className="text-xs font-bold text-muted-foreground mb-1">Upcoming</div>
          {upcoming.map((entry) => (
            <div key={entry.id} className="text-xs py-1 border-b border-border last:border-0">
              <div className="flex justify-between">
                <span>{entry.productName}</span>
                <span className="font-bold">{formatCurrency(entry.saleAmount || 0)}</span>
              </div>
              <div className="text-muted-foreground">Due: {formatDateTime(entry.bnplDueDate!)}</div>
            </div>
          ))}
        </div>
      )}

      {bnplEntries.length === 0 && (
        <div className="text-center text-xs text-muted-foreground py-4">
          No BNPL payments pending
        </div>
      )}
    </div>
  );
}

export function ReportsView({ auditLog }: ReportsViewProps) {
  return (
    <div className="space-y-3">
      <DailySummaryCard auditLog={auditLog} />
      <BNPLDueCard auditLog={auditLog} />
      
      <ReportCard
        title="Stock Movement"
        description="Stock in/out adjustments by date, product, reason, and session."
        onOpen={() => toast.info('Opening Stock Movement report…')}
        onExport={() => toast.success('Exporting Stock Movement…')}
      />
      <ReportCard
        title="Low Stock & Out of Stock"
        description="Critical items, reorder needs, and out-of-stock list for replenishment."
        onOpen={() => toast.info('Opening Low Stock report…')}
        onExport={() => toast.success('Exporting Low Stock…')}
      />
      <ReportCard
        title="Stock Valuation"
        description="Inventory value based on cost price and on-hand quantity totals."
        onOpen={() => toast.info('Opening Stock Valuation…')}
        onExport={() => toast.success('Exporting Valuation…')}
      />
      <ReportCard
        title="Price List & Margin"
        description="Review selling price vs cost, and adjust pricing rules if needed."
        onOpen={() => toast.info('Opening Price List…')}
        onExport={() => toast.success('Exporting Price List…')}
      />
    </div>
  );
}
