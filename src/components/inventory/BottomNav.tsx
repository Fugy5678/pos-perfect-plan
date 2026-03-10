import { ClipboardList, Package, BarChart3, Tag, Users } from 'lucide-react';
import { ViewType } from '@/types/inventory';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface BottomNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';

  // Agents only see Products (sales). Admins see everything.
  const navItems = isAgent
    ? [{ view: 'products' as ViewType, label: 'My Sales', icon: ClipboardList }]
    : [
      { view: 'products' as ViewType, label: 'Products', icon: ClipboardList },
      { view: 'stocktake' as ViewType, label: 'Stock Take', icon: Package },
      { view: 'reports' as ViewType, label: 'Reports', icon: BarChart3 },
      { view: 'pricing' as ViewType, label: 'Pricing', icon: Tag },
      { view: 'team' as ViewType, label: 'Team', icon: Users },
    ];

  return (
    <nav className="fixed left-0 right-0 bottom-0 z-50 bg-card border-t border-border py-2.5 px-2">
      <div className="flex justify-around gap-2 max-w-[1200px] mx-auto">
        {navItems.map(({ view, label, icon: Icon }) => (
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
