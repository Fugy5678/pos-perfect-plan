import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Product, AuditEntry, ADJUSTMENT_REASONS, PaymentType } from '@/types/inventory';
import { formatDateTime } from '@/lib/formatters';

interface ProductSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onStockAdjust: (delta: number, reason: string, notes: string, paymentType?: PaymentType, bnplDueDate?: Date) => void;
  onPricingSave: (sellPrice: number, costPrice: number) => void;
  auditEntries: AuditEntry[];
}

export function ProductSheet({
  product,
  isOpen,
  onClose,
  onStockAdjust,
  onPricingSave,
  auditEntries,
}: ProductSheetProps) {
  const [sellPrice, setSellPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [adjustQty, setAdjustQty] = useState(1);
  const [reason, setReason] = useState<string>(ADJUSTMENT_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [bnplDueDate, setBnplDueDate] = useState<string>('');

  useEffect(() => {
    if (product) {
      setSellPrice(product.sellPrice);
      setCostPrice(product.costPrice);
      setAdjustQty(1);
      setNotes('');
      setPaymentType('cash');
      setBnplDueDate('');
    }
  }, [product]);

  const productAudit = auditEntries.filter((a) => a.sku === product?.sku).slice(0, 5);

  const handleStockIn = () => {
    if (adjustQty > 0) {
      onStockAdjust(adjustQty, reason, notes);
    }
  };

  const handleSale = () => {
    if (adjustQty > 0) {
      const dueDate = paymentType === 'bnpl' && bnplDueDate ? new Date(bnplDueDate) : undefined;
      onStockAdjust(-adjustQty, 'Sale', notes, paymentType, dueDate);
    }
  };

  const handleSavePricing = () => {
    onPricingSave(sellPrice, costPrice);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/35 z-35"
            onClick={onClose}
          />
          <motion.aside
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-[66px] z-40 bg-card border-t border-border rounded-t-[18px] shadow-lg max-w-[1200px] mx-auto md:left-auto md:right-5 md:w-[360px] md:rounded-[18px] md:border"
          >
            <div className="w-[46px] h-[5px] rounded-full bg-muted mx-auto mt-2 md:hidden" />
            
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
              <div>
                <strong className="block text-sm font-bold">{product?.name || 'Select a product'}</strong>
                <small className="text-xs text-muted-foreground">
                  {product ? `${product.sku} • ${product.category}` : 'SKU • Category'}
                </small>
              </div>
              <button
                onClick={onClose}
                className="border border-border bg-card rounded-xl p-2.5 hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-3 max-h-[62vh] overflow-auto">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="border border-border rounded-[14px] p-2.5 bg-card">
                  <label className="block text-[11px] text-muted-foreground mb-1.5">On Hand Qty</label>
                  <input
                    type="text"
                    value={product?.qty || 0}
                    readOnly
                    className="w-full border-none outline-none text-sm bg-transparent"
                  />
                </div>
                <div className="border border-border rounded-[14px] p-2.5 bg-card">
                  <label className="block text-[11px] text-muted-foreground mb-1.5">Reorder Level</label>
                  <input
                    type="text"
                    value={product?.reorder || 0}
                    readOnly
                    className="w-full border-none outline-none text-sm bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="border border-border rounded-[14px] p-2.5 bg-card">
                  <label className="block text-[11px] text-muted-foreground mb-1.5">Selling Price (KES)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="w-full border-none outline-none text-sm bg-transparent"
                  />
                </div>
                <div className="border border-border rounded-[14px] p-2.5 bg-card">
                  <label className="block text-[11px] text-muted-foreground mb-1.5">Cost Price (KES)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full border-none outline-none text-sm bg-transparent"
                  />
                </div>
              </div>

              <div className="border border-border rounded-[14px] p-2.5 bg-card">
                <label className="block text-[11px] text-muted-foreground mb-1.5">Adjustment Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border-none outline-none text-sm bg-transparent"
                >
                  {ADJUSTMENT_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="border border-border rounded-[14px] p-2.5 bg-card">
                  <label className="block text-[11px] text-muted-foreground mb-1.5">Adjust Qty (+/-)</label>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.abs(Number(e.target.value)))}
                    className="w-full border-none outline-none text-sm bg-transparent"
                  />
                </div>
                <div className="border border-border rounded-[14px] p-2.5 bg-card">
                  <label className="block text-[11px] text-muted-foreground mb-1.5">Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., INV-019, shelf A"
                    className="w-full border-none outline-none text-sm bg-transparent"
                  />
                </div>
              </div>

              {/* Payment Type for Sales */}
              <div className="border border-border rounded-[14px] p-2.5 bg-card">
                <label className="block text-[11px] text-muted-foreground mb-1.5">Payment Type (for Sales)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentType('cash')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                      paymentType === 'cash'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    onClick={() => setPaymentType('bnpl')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                      paymentType === 'bnpl'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    📅 Buy Now Pay Later
                  </button>
                </div>
              </div>

              {paymentType === 'bnpl' && (
                <div className="border border-border rounded-[14px] p-2.5 bg-card">
                  <label className="block text-[11px] text-muted-foreground mb-1.5">Payment Due Date</label>
                  <input
                    type="date"
                    value={bnplDueDate}
                    onChange={(e) => setBnplDueDate(e.target.value)}
                    className="w-full border-none outline-none text-sm bg-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleStockIn}
                  className="bg-success text-success-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
                >
                  + Stock In
                </button>
                <button
                  onClick={handleSale}
                  className="bg-destructive text-destructive-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
                >
                  💰 Sale
                </button>
              </div>

              <button
                onClick={handleSavePricing}
                className="bg-primary text-primary-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm"
              >
                Save Pricing (Mock)
              </button>

              <button className="bg-card border border-border text-foreground rounded-[14px] py-3 px-3 font-extrabold text-sm">
                View Product History
              </button>

              <div className="border border-border rounded-2xl bg-card p-2.5">
                <h4 className="text-[13px] font-bold mb-2">Recent Adjustments (Mock)</h4>
                {productAudit.length === 0 ? (
                  <div className="flex justify-between gap-2.5 text-xs text-muted-foreground">
                    <span>No adjustments yet</span>
                    <span>—</span>
                  </div>
                ) : (
                  productAudit.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between gap-2.5 text-xs text-muted-foreground py-2 border-t border-dashed border-border first:border-t-0 first:pt-0"
                    >
                      <div>
                        <div>{formatDateTime(entry.timestamp)}</div>
                        <strong className="text-foreground">
                          {entry.reason}
                          {entry.reason === 'Sale' && entry.paymentType && (
                            <span className="ml-1 text-xs">
                              ({entry.paymentType === 'cash' ? '💵 Cash' : '📅 BNPL'})
                            </span>
                          )}
                        </strong>
                        {entry.paymentType === 'bnpl' && entry.bnplDueDate && (
                          <div className="text-warning">Due: {formatDateTime(entry.bnplDueDate)}</div>
                        )}
                        <div>{entry.notes || <span className="text-muted-foreground">No notes</span>}</div>
                      </div>
                      <div className="text-right">
                        <strong className="text-foreground">
                          {entry.delta > 0 ? '+' : ''}{entry.delta}
                        </strong>
                        <div>{entry.before} → {entry.after}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Shared login works for all floor agents. If you want accountability later, add a 4-digit PIN per agent while keeping one shared login.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
