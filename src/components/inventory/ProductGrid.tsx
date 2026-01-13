import { Product, FilterType } from '@/types/inventory';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  activeFilter: FilterType;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, searchQuery, activeFilter, onProductClick }: ProductGridProps) {
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'LOW' && p.qty > 0 && p.qty <= 5) ||
      (activeFilter === 'OUT' && p.qty === 0) ||
      (['FOOTWEAR', 'CLOTHING', 'ACCESSORIES', 'HOME'].includes(activeFilter) && p.category === activeFilter);
    return matchesQuery && matchesFilter;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-3">
        <h3 className="font-bold text-sm mb-1">No products found</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Try a different search term or clear filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
      ))}
    </div>
  );
}
