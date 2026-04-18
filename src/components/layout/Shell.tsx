import { Outlet } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from './Header';
import NavSidebar from './NavSidebar';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFirstRun } from '@/hooks/useFirstRun';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import ToastContainer from '@/components/common/ToastContainer';

function useLastPush() {
  const [label, setLabel] = useState<string>('...');
  useEffect(() => {
    fetch('https://api.github.com/repos/rvd-gmpplus/dq-app/branches/v1')
      .then((r) => r.json())
      .then((data) => {
        const d = new Date(data.commit.commit.committer.date);
        const time = d.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
        const weekday = d.toLocaleString('en-GB', { weekday: 'long' });
        const day = d.getDate();
        const month = d.toLocaleString('en-GB', { month: 'long' });
        const year = d.getFullYear();
        setLabel(`${time} on ${weekday} ${day} ${month} ${year}`);
      })
      .catch(() => setLabel('unavailable'));
  }, []);
  return label;
}

function NarrowViewportNotice() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center lg:hidden"
      aria-labelledby="narrow-viewport-title"
    >
      <div className="rounded-full bg-gmp-purple-50 p-4 text-gmp-purple-700">
        <Monitor size={32} aria-hidden="true" />
      </div>
      <h1 id="narrow-viewport-title" className="text-lg font-semibold text-slate-900">
        Please open the DQ app on a wider screen
      </h1>
      <p className="max-w-md text-sm text-slate-600">
        The app is desktop-first for v1 and needs at least 1024 pixels of width to lay out the
        quadrant, tables, and timelines correctly. Try a laptop or rotate your tablet to
        landscape.
      </p>
      <p className="text-xs text-slate-500">A mobile layout is on the v1.1 roadmap.</p>
    </main>
  );
}

export default function Shell() {
  useFirstRun();
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  const lastPush = useLastPush();
  return (
    <>
      <NarrowViewportNotice />
      <div className="hidden h-full min-h-screen flex-col lg:flex">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <NavSidebar />
          <main className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
        <OnboardingModal />
        <footer className="border-t border-slate-100 bg-slate-50 px-6 py-1.5 text-center text-xs text-slate-400">
          Rick van Dijk &middot; IT Lead &middot; GMP+ International &middot; Version 1.0 &middot; Last modified: {lastPush}
        </footer>
      </div>
      <ToastContainer />
    </>
  );
}
