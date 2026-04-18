import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Grid2X2,
  Layers,
  Calendar,
  Shield,
  AlertTriangle,
  Users,
  Download,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const items: readonly Item[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/use-cases', label: 'Use cases', icon: ListChecks },
  { to: '/quadrant', label: 'Quadrant', icon: Grid2X2 },
  { to: '/pillars', label: 'Pillars', icon: Layers },
  { to: '/phases', label: 'Phases', icon: Calendar },
  { to: '/governance', label: 'Governance', icon: Shield },
  { to: '/risks', label: 'Risks', icon: AlertTriangle },
  { to: '/stakeholders', label: 'Stakeholders', icon: Users },
  { to: '/exports', label: 'Exports', icon: Download },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function NavSidebar() {
  return (
    <nav className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white py-4">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'mx-3 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-gmp-purple-50 text-gmp-purple-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )
          }
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
