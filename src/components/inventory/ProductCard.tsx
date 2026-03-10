import { Product } from '@/types/inventory';
import { formatMoney, getStockStatus } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const stockStatus = getStockStatus(product.qty);

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-2xl shadow-sm p-3 cursor-pointer flex flex-col gap-2 min-h-[142px] hover:shadow-md transition-shadow"
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-[80px] w-full rounded-[14px] object-cover bg-muted"
          loading="lazy"
        />
      ) : (
        <div className="h-[54px] rounded-[14px] bg-gradient-to-br from-primary/15 to-foreground/10" />
      )}

      <div className="flex justify-between gap-2.5 items-start">
        <div>
          <div className="font-bold text-[13px] leading-tight">{product.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {product.sku} • {product.category}
          </div>
        </div>
        <div className="font-extrabold text-[13px] text-right whitespace-nowrap">
          {formatMoney(product.sellPrice)}
        </div>
      </div>

      <div className="flex justify-between gap-2.5 items-center mt-0.5">
        <div
          className={cn(
            'text-xs font-bold',
            stockStatus === 'ok' && 'stock-ok',
            stockStatus === 'low' && 'stock-low',
            stockStatus === 'out' && 'stock-out'
          )}
        >
          On hand: {product.qty}
        </div>
        <div className="text-[11px] text-muted-foreground border border-dashed border-border py-1 px-2 rounded-full bg-card whitespace-nowrap">
          Reorder: {product.reorder}
        </div>
      </div>
    </div>
  );
}
