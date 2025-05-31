
import { NavLink } from 'react-router-dom';
import { Database, Workflow, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Data Mapping',
    href: '/mapping',
    icon: Database,
  },
  {
    name: 'Lineage',
    href: '/lineage',
    icon: Workflow,
  },
  {
    name: 'Metadata',
    href: '/metadata',
    icon: Search,
  },
];

export const Navigation = () => {
  return (
    <nav className="w-64 bg-background border-r border-border p-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground mb-4">Data Mapping Platform</h2>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
