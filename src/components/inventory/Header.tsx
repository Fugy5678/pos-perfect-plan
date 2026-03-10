import { Search, Settings2, Camera, LogOut } from 'lucide-react';
import { FilterType } from '@/types/inventory';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

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
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-3 py-3 md:px-5">
      {/* Top row: Logo | User info + Sign Out */}
      <div className="flex items-center justify-between mb-2.5">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Perfect Plan POS"
            className="w-8 h-8 object-contain rounded"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <strong className="text-sm font-bold leading-tight">Perfect Plan POS</strong>
        </div>

        {/* Right: User role badge + Sign Out */}
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-xs text-muted-foreground border border-border py-1 px-2.5 rounded-full bg-muted whitespace-nowrap hidden sm:inline-flex">
              {user.name} · {user.role.replace('_', ' ')}
            </span>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-destructive border border-destructive/30 bg-destructive/5 hover:bg-destructive hover:text-white px-3 py-1.5 rounded-full transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Search + controls row */}
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
