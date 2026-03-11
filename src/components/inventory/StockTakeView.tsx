import { useRef, useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, CATEGORIES } from '@/types/inventory';
import { toast } from 'sonner';
import { useUpdatePricing } from '@/hooks/useInventory';
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface StockTakeViewProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function StockTakeView({ products, onProductClick }: StockTakeViewProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const { mutate: updateProduct } = useUpdatePricing();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<string>(CATEGORIES[0]);
  const [newQty, setNewQty] = useState(0);
  const [newReorder, setNewReorder] = useState(5);
  const [newSellPrice, setNewSellPrice] = useState<number | ''>('');
  const [newCostPrice, setNewCostPrice] = useState<number | ''>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSku || !newCategory || newSellPrice === '' || newCostPrice === '') {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsCreating(true);
    try {
      await fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          sku: newSku,
          category: newCategory,
          qty: newQty,
          reorder: newReorder,
          sellPrice: Number(newSellPrice),
          costPrice: Number(newCostPrice),
        }),
      });
      toast.success(`"${newName}" added to inventory!`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Reset form
      setNewName(''); setNewSku(''); setNewCategory(CATEGORIES[0]);
      setNewQty(0); setNewReorder(5); setNewSellPrice(''); setNewCostPrice('');
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create product');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageUpload = (product: Product) => {
    setUploadingId(product.id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processImage = (file: File, product: Product) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 500;
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.8) || canvas.toDataURL('image/jpeg', 0.8);
        updateProduct({ ...product, imageUrl: compressedDataUrl }, {
          onSuccess: () => { toast.success('Image updated!'); setUploadingId(null); },
          onError: () => { toast.error('Failed to update image'); setUploadingId(null); }
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingId) {
      const product = products.find(p => p.id === uploadingId);
      if (product) processImage(file, product);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Add New Product Section */}
      {isAdmin && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary rounded-lg p-1.5">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm">Add New Product</p>
                <p className="text-[11px] text-muted-foreground">Add completely new inventory item</p>
              </div>
            </div>
            {showAddForm ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {showAddForm && (
            <form onSubmit={handleCreateProduct} className="border-t border-border p-4 space-y-3 bg-muted/20">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="border border-border rounded-[12px] p-2.5 bg-card col-span-2">
                  <label className="block text-[10px] text-muted-foreground mb-1">Product Name *</label>
                  <input type="text" placeholder="e.g. Nike Air Max" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full border-none outline-none text-sm bg-transparent" />
                </div>
                <div className="border border-border rounded-[12px] p-2.5 bg-card">
                  <label className="block text-[10px] text-muted-foreground mb-1">SKU *</label>
                  <input type="text" placeholder="e.g. FW-099" value={newSku} onChange={e => setNewSku(e.target.value)} required className="w-full border-none outline-none text-sm bg-transparent" />
                </div>
                <div className="border border-border rounded-[12px] p-2.5 bg-card">
                  <label className="block text-[10px] text-muted-foreground mb-1">Category *</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full border-none outline-none text-sm bg-transparent">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="border border-border rounded-[12px] p-2.5 bg-card">
                  <label className="block text-[10px] text-muted-foreground mb-1">Sell Price (KES) *</label>
                  <input type="number" placeholder="0" value={newSellPrice} onChange={e => setNewSellPrice(e.target.value === '' ? '' : Number(e.target.value))} required min={0} className="w-full border-none outline-none text-sm bg-transparent" />
                </div>
                <div className="border border-border rounded-[12px] p-2.5 bg-card">
                  <label className="block text-[10px] text-muted-foreground mb-1">Cost Price (KES) *</label>
                  <input type="number" placeholder="0" value={newCostPrice} onChange={e => setNewCostPrice(e.target.value === '' ? '' : Number(e.target.value))} required min={0} className="w-full border-none outline-none text-sm bg-transparent" />
                </div>
                <div className="border border-border rounded-[12px] p-2.5 bg-card">
                  <label className="block text-[10px] text-muted-foreground mb-1">Opening Qty</label>
                  <input type="number" placeholder="0" value={newQty} onChange={e => setNewQty(Number(e.target.value))} min={0} className="w-full border-none outline-none text-sm bg-transparent" />
                </div>
                <div className="border border-border rounded-[12px] p-2.5 bg-card">
                  <label className="block text-[10px] text-muted-foreground mb-1">Reorder Level</label>
                  <input type="number" placeholder="5" value={newReorder} onChange={e => setNewReorder(Number(e.target.value))} min={0} className="w-full border-none outline-none text-sm bg-transparent" />
                </div>
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-primary text-primary-foreground rounded-[12px] py-2.5 font-bold text-sm disabled:opacity-60"
              >
                {isCreating ? 'Adding...' : '+ Add to Inventory'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Info header */}
      <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
        <h3 className="font-bold text-sm mb-1">Existing Inventory ({products.length} items)</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tap "Count / Adjust" to update stock levels for existing items.
        </p>
      </div>

      {/* Product list */}
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="bg-card border border-border rounded-2xl p-3 shadow-sm">
            <h3 className="font-bold text-sm mb-1">{product.name}</h3>
            <div className="flex gap-3 mb-2.5">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">{product.sku} • {product.category}</p>
                <p className="text-xs text-muted-foreground mt-1">On Hand: <strong className="text-foreground">{product.qty}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onProductClick(product)}
                className="bg-primary text-primary-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
              >
                Count / Adjust
              </button>
              <button
                onClick={() => toast.success('Marked as counted')}
                className="bg-card border border-border text-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
              >
                Mark Counted
              </button>
            </div>
            {isAdmin && (
              <button
                onClick={() => handleImageUpload(product)}
                disabled={uploadingId === product.id}
                className="mt-2.5 w-full bg-secondary text-secondary-foreground rounded-[14px] py-2.5 px-3 font-bold text-xs border border-border"
              >
                {uploadingId === product.id ? 'Compressing & Uploading...' : '📸 Add/Update Image'}
              </button>
            )}
          </div>
        ))}
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={onFileInputChange}
        className="hidden"
      />
    </div>
  );
}
