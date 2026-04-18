import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

function BrandMark() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logos/gmp-international-landscape.png`}
      alt="GMP+ International"
      className="h-8 w-auto shrink-0"
    />
  );
}

export default function Header() {
  const currentUser = useSettingsStore((s) => s.currentUser);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isDark = theme === 'dark';
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <BrandMark />
        <span className="text-sm font-semibold tracking-tight text-slate-700">
          GMP+ Data Quality app
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500">Signed in as</span>
        <span className="rounded-full bg-gmp-purple-50 px-3 py-1 font-medium text-gmp-purple-700">
          {currentUser}
        </span>
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
