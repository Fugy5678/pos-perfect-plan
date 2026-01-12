import { toast } from 'sonner';

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

export function ReportsView() {
  return (
    <div className="space-y-3">
      <ReportCard
        title="Stock Movement"
        description="Stock in/out adjustments by date, product, reason, and session (shared login)."
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
