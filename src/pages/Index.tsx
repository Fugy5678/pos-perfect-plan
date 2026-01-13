import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Product, AuditEntry, FilterType, ViewType, PaymentType } from '@/types/inventory';
import { initialProducts } from '@/data/products';
import { Header } from '@/components/inventory/Header';
import { ProductGrid } from '@/components/inventory/ProductGrid';
import { ProductSheet } from '@/components/inventory/ProductSheet';
import { BottomNav } from '@/components/inventory/BottomNav';
import { StockTakeView } from '@/components/inventory/StockTakeView';
import { ReportsView } from '@/components/inventory/ReportsView';
import { PricingView } from '@/components/inventory/PricingView';

const SESSION = 'FLOOR-AGENT';

export default function Index() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('products');

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const handleScan = useCallback(() => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    toast.info(`Scanned: ${randomProduct.sku} (mock)`);
    handleProductClick(randomProduct);
  }, [products, handleProductClick]);

  const handleStockAdjust = useCallback((delta: number, reason: string, notes: string, paymentType?: PaymentType, bnplDueDate?: Date) => {
    if (!selectedProduct) return;

    const before = selectedProduct.qty;
    const after = Math.max(0, before + delta);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id ? { ...p, qty: after } : p
      )
    );

    setSelectedProduct((prev) => (prev ? { ...prev, qty: after } : null));

    const isSale = reason === 'Sale';
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      sku: selectedProduct.sku,
      productName: selectedProduct.name,
      delta,
      before,
      after,
      reason,
      notes,
      session: SESSION,
      paymentType: isSale ? paymentType : undefined,
      bnplDueDate: isSale ? bnplDueDate : undefined,
      saleAmount: isSale ? selectedProduct.sellPrice * Math.abs(delta) : undefined,
      costAmount: isSale ? selectedProduct.costPrice * Math.abs(delta) : undefined,
    };

    setAuditLog((prev) => [entry, ...prev]);
    
    if (isSale) {
      toast.success(`Sale recorded: ${paymentType === 'cash' ? '💵 Cash' : '📅 BNPL'}`);
    } else {
      toast.success(`${delta > 0 ? 'Stock in' : 'Adjustment'} saved`);
    }
  }, [selectedProduct]);

  const handlePricingSave = useCallback((sellPrice: number, costPrice: number) => {
    if (!selectedProduct) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, sellPrice: Math.max(0, sellPrice), costPrice: Math.max(0, costPrice) }
          : p
      )
    );

    setSelectedProduct((prev) =>
      prev ? { ...prev, sellPrice: Math.max(0, sellPrice), costPrice: Math.max(0, costPrice) } : null
    );

    toast.success('Pricing saved (mock)');
  }, [selectedProduct]);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
    setIsSheetOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onScan={handleScan}
      />

      <main className="p-3 pb-[86px] max-w-[1200px] mx-auto md:p-5 md:pb-[86px]">
        {activeView === 'products' && (
          <ProductGrid
            products={products}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onProductClick={handleProductClick}
          />
        )}

        {activeView === 'stocktake' && (
          <StockTakeView products={products} onProductClick={handleProductClick} />
        )}

        {activeView === 'reports' && <ReportsView auditLog={auditLog} />}

        {activeView === 'pricing' && <PricingView />}
      </main>

      <ProductSheet
        product={selectedProduct}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        onStockAdjust={handleStockAdjust}
        onPricingSave={handlePricingSave}
        auditEntries={auditLog}
      />

      <BottomNav activeView={activeView} onViewChange={handleViewChange} />
    </div>
  );
}
