import { Product } from '@/types/inventory';
import { toast } from 'sonner';

interface StockTakeViewProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function StockTakeView({ products, onProductClick }: StockTakeViewProps) {
  return (
    <div className="space-y-3">
      <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
        <h3 className="font-bold text-sm mb-1">Stock Take</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Scan items or search and update counted qty. Differences are tracked in the adjustments log (mock).
        </p>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="bg-card border border-border rounded-2xl p-3 shadow-sm">
            <h3 className="font-bold text-sm mb-1">{product.name}</h3>
            <p className="text-xs text-muted-foreground mb-2.5">
              {product.sku} • {product.category} • On Hand: <strong className="text-foreground">{product.qty}</strong>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onProductClick(product)}
                className="bg-primary text-primary-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
              >
                Count / Adjust
              </button>
              <button
                onClick={() => toast.success('Marked as counted (mock)')}
                className="bg-card border border-border text-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
              >
                Mark Counted
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
