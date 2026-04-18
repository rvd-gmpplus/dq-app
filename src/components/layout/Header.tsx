import { useSettingsStore } from '@/stores/settingsStore';

function BrandMark() {
  // Inline SVG brand mark so the header never emits a 404 for a missing
  // gmp-logo.png. When the real landscape logo lands in public/, swap this
  // for an <img src> that file.
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 32 32"
      className="shrink-0"
      role="img"
      aria-label="GMP+ International"
    >
      <rect width="32" height="32" rx="6" fill="#6859A7" />
      <rect x="6" y="6" width="9" height="9" fill="#38B769" />
      <rect x="17" y="6" width="9" height="9" fill="#FFFFFF" fillOpacity="0.3" />
      <rect x="6" y="17" width="9" height="9" fill="#EA8004" />
      <rect x="17" y="17" width="9" height="9" fill="#FFFFFF" fillOpacity="0.15" />
    </svg>
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
