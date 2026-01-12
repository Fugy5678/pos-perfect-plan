import { StockStatus } from '@/types/inventory';

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStockStatus(qty: number): StockStatus {
  if (qty === 0) return 'out';
  if (qty <= 5) return 'low';
  return 'ok';
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-KE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
