import { useSettingsStore } from '@/stores/settingsStore';

export default function Header() {
  const currentUser = useSettingsStore((s) => s.currentUser);
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <img
          src={`${import.meta.env.BASE_URL}gmp-logo.png`}
          alt="GMP+ International"
          className="h-10 w-auto"
          onError={(e) => {
            // When the logo is not yet on disk during scaffolding, hide the broken image.
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="text-sm font-semibold tracking-tight text-slate-700">
          Data Quality app
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
