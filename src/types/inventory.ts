export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  qty: number;
  reorder: number;
  sellPrice: number;
  costPrice: number;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  sku: string;
  productName: string;
  delta: number;
  before: number;
  after: number;
  reason: string;
  notes: string;
  session: string;
}

export type StockStatus = 'ok' | 'low' | 'out';

export type FilterType = 'ALL' | 'LOW' | 'OUT' | 'CLOTHING' | 'FOOTWEAR' | 'COSMETICS';

export type ViewType = 'products' | 'stocktake' | 'reports' | 'pricing';

export const ADJUSTMENT_REASONS = [
  'Supplier Delivery',
  'Stock Transfer',
  'Customer Return',
  'Damage / Spoilage',
  'Shrink / Theft',
  'Stock Count Correction',
] as const;
