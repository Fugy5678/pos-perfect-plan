import { toast } from 'sonner';

export function PricingView() {
  return (
    <div className="space-y-3">
      <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
        <h3 className="font-bold text-sm mb-2">Pricing</h3>
        
        <div className="flex justify-between gap-2.5 text-[13px] py-2">
          <span className="text-muted-foreground">Active Pricelist</span>
          <strong>Retail (KES)</strong>
        </div>
        <div className="flex justify-between gap-2.5 text-[13px] py-2 border-t border-dashed border-border">
          <span className="text-muted-foreground">Tax Mode</span>
          <strong>Inclusive</strong>
        </div>
        <div className="flex justify-between gap-2.5 text-[13px] py-2 border-t border-dashed border-border">
          <span className="text-muted-foreground">Discount Rules</span>
          <strong>Enabled</strong>
        </div>
        
        <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
          Odoo alignment: pricing comes from Pricelists. This mock shows sell + cost on product selection and lets you "save" pricing (mock).
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
        <h3 className="font-bold text-sm mb-1.5">Bulk Price Update (Mock)</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
          Upload CSV/Excel to update selling prices across multiple products.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => toast.info('Opening bulk price import…')}
            className="bg-primary text-primary-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
          >
            Import
          </button>
          <button
            onClick={() => toast.success('Downloading template…')}
            className="bg-card border border-border text-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
          >
            Template
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
        <h3 className="font-bold text-sm mb-1.5">Promotions (Mock)</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
          Create discount rules, bundles, and date-based promo pricing.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => toast.info('Opening promotions…')}
            className="bg-primary text-primary-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
          >
            Open
          </button>
          <button
            onClick={() => toast.success('Exporting promos…')}
            className="bg-card border border-border text-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
