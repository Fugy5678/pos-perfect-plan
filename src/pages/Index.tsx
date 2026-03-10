import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Product, FilterType, ViewType, PaymentType } from '@/types/inventory';
import { Header } from '@/components/inventory/Header';
import { ProductGrid } from '@/components/inventory/ProductGrid';
import { ProductSheet } from '@/components/inventory/ProductSheet';
import { BottomNav } from '@/components/inventory/BottomNav';
import { StockTakeView } from '@/components/inventory/StockTakeView';
import { ReportsView } from '@/components/inventory/ReportsView';
import { PricingView } from '@/components/inventory/PricingView';
import { TeamView } from '@/components/inventory/TeamView';
import { MySalesView } from '@/components/inventory/MySalesView';
import { useAuth } from '@/context/AuthContext';
import { useProducts, useCreateSale, useAdjustStock, useUpdatePricing } from '@/hooks/useInventory';


export default function Index() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const { data: products = [], isLoading } = useProducts();
  const { mutate: createSale } = useCreateSale();
  const { mutate: adjustStock } = useAdjustStock();
  const { mutate: updatePricing } = useUpdatePricing();

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
    if (!products.length) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    toast.info(`Scanned: ${randomProduct.sku}`);
    handleProductClick(randomProduct);
  }, [products, handleProductClick]);

  const handleStockAdjust = useCallback((delta: number, reason: string, notes: string, paymentType?: PaymentType, bnplDueDate?: Date, attributedToName?: string | null) => {
    if (!selectedProduct) return;

    const isSale = reason === 'Sale';

    if (isSale) {
      if (delta >= 0) {
        toast.error("Sales must reduce stock quantity.");
        return;
      }
      createSale({
        items: [{ productId: selectedProduct.id, qty: Math.abs(delta) }],
        amountPaid: Number(selectedProduct.sellPrice) * Math.abs(delta),
        paymentMode: (paymentType || 'CASH').toUpperCase(),
        notes,
        attributedToName: attributedToName ?? null,
      }, {
        onSuccess: () => {
          toast.success(`Sale recorded: ${paymentType === 'cash' ? '💵 Cash' : paymentType === 'bnpl' ? '📅 BNPL' : '💵 Cash'}`);
          setIsSheetOpen(false);
        },
        onError: (err: any) => toast.error(err.message)
      });
    } else {
      const type = delta > 0 ? 'PURCHASE' : 'ADJUSTMENT';
      const after = Math.max(0, selectedProduct.qty + delta);
      adjustStock({
        id: selectedProduct.id,
        qty: after,
        type,
        reason: notes || reason,
      }, {
        onSuccess: () => {
          toast.success(`${delta > 0 ? 'Stock in' : 'Adjustment'} saved to Database`);
          setIsSheetOpen(false);
        },
        onError: (err: any) => toast.error(err.message)
      });
    }
  }, [selectedProduct, createSale, adjustStock]);

  const handlePricingSave = useCallback((sellPrice: number, costPrice: number) => {
    if (!selectedProduct) return;
    updatePricing({
      id: selectedProduct.id,
      name: selectedProduct.name,
      category: selectedProduct.category,
      qty: selectedProduct.qty,
      reorder: selectedProduct.reorder,
      sellPrice,
      costPrice,
    }, {
      onSuccess: () => {
        toast.success('Pricing successfully updated in database');
        setIsSheetOpen(false);
      },
      onError: (err: any) => toast.error(err.message)
    });
  }, [selectedProduct, updatePricing]);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
    setIsSheetOpen(false);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading pos terminal...</div>;
  }

  return (
    <div className="min-h-screen bg-background relative">
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

        {activeView === 'stocktake' && isAdmin && (
          <StockTakeView products={products} onProductClick={handleProductClick} />
        )}

        {activeView === 'reports' && isAdmin && <ReportsView />}

        {activeView === 'pricing' && isAdmin && <PricingView />}

        {activeView === 'team' && isAdmin && <TeamView />}
        {activeView === 'team' && isAgent && <MySalesView />}
      </main>

      <ProductSheet
        product={selectedProduct}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        onStockAdjust={handleStockAdjust}
        onPricingSave={handlePricingSave}
        auditEntries={[]}
      />

      <BottomNav activeView={activeView} onViewChange={handleViewChange} />
    </div>
  );
}
