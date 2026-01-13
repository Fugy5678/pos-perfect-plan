import { Product, FilterType, CATEGORIES } from '@/types/inventory';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  activeFilter: FilterType;
  onProductClick: (product: Product) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  FOOTWEAR: '👟 Shoes',
  CLOTHING: '👕 Clothing',
  ACCESSORIES: '👜 Accessories',
  HOME: '🏠 Home & Appliances',
};

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

  // Group by category when showing all or when searching
  const shouldGroup = activeFilter === 'ALL' || activeFilter === 'LOW' || activeFilter === 'OUT' || searchQuery.trim();
  
  if (shouldGroup) {
    const grouped = CATEGORIES.reduce((acc, cat) => {
      const items = filteredProducts.filter((p) => p.category === cat);
      if (items.length > 0) {
        acc[cat] = items;
      }
      return acc;
    }, {} as Record<string, Product[]>);

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              {CATEGORY_LABELS[category] || category}
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Single category view (no grouping needed)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
      ))}
    </div>
  );
}
