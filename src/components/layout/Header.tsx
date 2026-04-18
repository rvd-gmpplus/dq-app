import { useSettingsStore } from '@/stores/settingsStore';

function BrandMark() {
  return (
    <img
      src="/logos/GMP+international-landscape.png"
      alt="GMP+ International"
      className="h-8 w-auto shrink-0"
    />
  );
}

export default function Header() {
  const currentUser = useSettingsStore((s) => s.currentUser);
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
      </div>
    </header>
  );
}
