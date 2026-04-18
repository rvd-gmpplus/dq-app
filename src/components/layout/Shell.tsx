import { Outlet } from 'react-router-dom';
import Header from './Header';
import NavSidebar from './NavSidebar';
import { useFirstRun } from '@/hooks/useFirstRun';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

export default function Shell() {
  useFirstRun();
  return (
    <div className="flex h-full min-h-screen flex-col">
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
    </div>
  );
}
