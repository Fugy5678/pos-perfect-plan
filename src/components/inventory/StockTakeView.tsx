import { useRef, useState } from 'react';
import { Product } from '@/types/inventory';
import { toast } from 'sonner';
import { useUpdatePricing } from '@/hooks/useInventory';
import { useAuth } from '@/context/AuthContext';

interface StockTakeViewProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function StockTakeView({ products, onProductClick }: StockTakeViewProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const { mutate: updateProduct } = useUpdatePricing();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

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

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress as WebP at 80% quality (fallback to JPEG on very old browsers)
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.8) || canvas.toDataURL('image/jpeg', 0.8);

        updateProduct({
          ...product,
          imageUrl: compressedDataUrl
        }, {
          onSuccess: () => {
            toast.success('Image updated successfully');
            setUploadingId(null);
          },
          onError: () => {
            toast.error('Failed to update image');
            setUploadingId(null);
          }
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
    // Reset file input so the same file can be selected again
    e.target.value = '';
  };
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
            <div className="flex gap-3 mb-2.5">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs">No img</div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">
                  {product.sku} • {product.category}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  On Hand: <strong className="text-foreground">{product.qty}</strong>
                </p>
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
                onClick={() => toast.success('Marked as counted (mock)')}
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

      {/* Hidden file input for native camera or gallery selection */}
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
