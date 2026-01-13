import { Search, Settings2, Camera } from 'lucide-react';
import { FilterType } from '@/types/inventory';
import { cn } from '@/lib/utils';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LOW', label: 'Low stock' },
  { value: 'OUT', label: 'Out of stock' },
  { value: 'FOOTWEAR', label: 'Footwear' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'HOME', label: 'Home' },
];

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onScan: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  showFilters,
  onToggleFilters,
  onScan,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-3 py-3 md:px-5">
      <div className="flex gap-2.5 items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5 min-w-[140px]">
          <div 
            className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-foreground to-primary shadow-lg"
            aria-hidden="true"
          />
          <div className="leading-tight">
            <strong className="block text-sm font-bold">Millow Closset POS</strong>
          </div>
        </div>
        <div className="text-xs text-muted-foreground border border-border py-1.5 px-2.5 rounded-full bg-card whitespace-nowrap">
          Shared Login: FLOOR-AGENT
        </div>
      </div>

      <div className="flex gap-2.5 items-center">
        <div className="flex-1 flex gap-2 items-center bg-card border border-border rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search product, SKU, barcode"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-none outline-none w-full text-sm bg-transparent"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className="border border-border bg-card rounded-xl p-2.5 min-w-[44px] flex items-center justify-center hover:bg-muted transition-colors"
          title="Filters"
        >
          <Settings2 className="w-4 h-4" />
        </button>
        <button
          onClick={onScan}
          className="border border-border bg-card rounded-xl p-2.5 min-w-[44px] flex items-center justify-center hover:bg-muted transition-colors"
          title="Scan"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-2 flex-wrap mt-2.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={cn(
                'text-xs border py-2 px-2.5 rounded-full cursor-pointer transition-colors',
                activeFilter === filter.value
                  ? 'border-primary/35 bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
