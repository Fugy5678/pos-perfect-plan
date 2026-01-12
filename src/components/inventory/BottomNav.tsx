import { ClipboardList, Package, BarChart3, Tag } from 'lucide-react';
import { ViewType } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const NAV_ITEMS: { view: ViewType; label: string; icon: typeof ClipboardList }[] = [
  { view: 'products', label: 'Products', icon: ClipboardList },
  { view: 'stocktake', label: 'Stock Take', icon: Package },
  { view: 'reports', label: 'Reports', icon: BarChart3 },
  { view: 'pricing', label: 'Pricing', icon: Tag },
];

export function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed left-0 right-0 bottom-0 z-50 bg-card border-t border-border py-2.5 px-2">
      <div className="flex justify-around gap-2 max-w-[1200px] mx-auto">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 px-1.5 rounded-[14px] cursor-pointer border border-transparent select-none transition-colors',
              activeView === view
                ? 'border-primary/35 bg-primary/10'
                : 'hover:bg-muted'
            )}
          >
            <Icon className={cn('w-5 h-5', activeView === view ? 'text-primary' : 'text-muted-foreground')} />
            <small className={cn('text-[11px]', activeView === view ? 'text-primary' : 'text-muted-foreground')}>
              {label}
            </small>
          </button>
        ))}
      </div>
    </nav>
  );
}
