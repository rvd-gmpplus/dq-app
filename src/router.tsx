import { lazy, Suspense } from 'react';
import { createHashRouter } from 'react-router-dom';
import Shell from '@/components/layout/Shell';
import PageFallback from '@/components/common/PageFallback';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const UseCaseListPage = lazy(() => import('@/pages/UseCaseListPage'));
const UseCaseDetailPage = lazy(() => import('@/pages/UseCaseDetailPage'));
const QuadrantPage = lazy(() => import('@/pages/QuadrantPage'));
const PillarsPage = lazy(() => import('@/pages/PillarsPage'));
const PhasesPage = lazy(() => import('@/pages/PhasesPage'));
const GovernancePage = lazy(() => import('@/pages/GovernancePage'));
const RisksPage = lazy(() => import('@/pages/RisksPage'));
const StakeholdersPage = lazy(() => import('@/pages/StakeholdersPage'));
const ExportsPage = lazy(() => import('@/pages/ExportsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function lazyPage(Element: React.ComponentType) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Element />
    </Suspense>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: lazyPage(DashboardPage) },
      { path: 'use-cases', element: lazyPage(UseCaseListPage) },
      { path: 'use-cases/:id', element: lazyPage(UseCaseDetailPage) },
      { path: 'quadrant', element: lazyPage(QuadrantPage) },
      { path: 'pillars', element: lazyPage(PillarsPage) },
      { path: 'phases', element: lazyPage(PhasesPage) },
      { path: 'governance', element: lazyPage(GovernancePage) },
      { path: 'risks', element: lazyPage(RisksPage) },
      { path: 'stakeholders', element: lazyPage(StakeholdersPage) },
      { path: 'exports', element: lazyPage(ExportsPage) },
      { path: 'settings', element: lazyPage(SettingsPage) },
    ],
  },
]);
