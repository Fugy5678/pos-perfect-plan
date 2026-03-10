export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  qty: number;
  reorder: number;
  sellPrice: number;
  costPrice: number;
  imageUrl?: string | null;
}

export type PaymentType = 'cash' | 'bnpl';

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
  paymentType?: PaymentType;
  bnplDueDate?: Date;
  saleAmount?: number;
  costAmount?: number;
}

export type StockStatus = 'ok' | 'low' | 'out';

export type FilterType = 'ALL' | 'LOW' | 'OUT' | 'FOOTWEAR' | 'CLOTHING' | 'ACCESSORIES' | 'HOME';

export type ViewType = 'products' | 'stocktake' | 'reports' | 'pricing' | 'team';

export const ADJUSTMENT_REASONS = [
  'Supplier Delivery',
  'Stock Transfer',
  'Customer Return',
  'Damage / Spoilage',
  'Shrink / Theft',
  'Stock Count Correction',
] as const;

export const SALE_REASONS = ['Sale'] as const;

export const CATEGORIES = ['FOOTWEAR', 'CLOTHING', 'ACCESSORIES', 'HOME'] as const;
