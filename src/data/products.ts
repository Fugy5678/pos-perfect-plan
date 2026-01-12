import { Product } from '@/types/inventory';

export const initialProducts: Product[] = [
  { id: 1, name: 'Blue Shirt', sku: 'SKU-001', category: 'CLOTHING', qty: 25, reorder: 8, sellPrice: 1499, costPrice: 900 },
  { id: 2, name: 'Black Jeans', sku: 'SKU-002', category: 'CLOTHING', qty: 5, reorder: 10, sellPrice: 2399, costPrice: 1500 },
  { id: 3, name: 'White Sneakers', sku: 'SKU-003', category: 'FOOTWEAR', qty: 0, reorder: 6, sellPrice: 3999, costPrice: 2600 },
  { id: 4, name: 'Body Lotion 250ml', sku: 'SKU-004', category: 'COSMETICS', qty: 14, reorder: 12, sellPrice: 799, costPrice: 420 },
  { id: 5, name: 'Baseball Cap', sku: 'SKU-005', category: 'CLOTHING', qty: 9, reorder: 8, sellPrice: 699, costPrice: 320 },
  { id: 6, name: 'Running Socks (Pair)', sku: 'SKU-006', category: 'FOOTWEAR', qty: 3, reorder: 10, sellPrice: 299, costPrice: 110 },
];
