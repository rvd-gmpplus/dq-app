import { createHashRouter } from 'react-router-dom';
import Shell from '@/components/layout/Shell';
import DashboardPage from '@/pages/DashboardPage';
import UseCaseListPage from '@/pages/UseCaseListPage';
import UseCaseDetailPage from '@/pages/UseCaseDetailPage';
import QuadrantPage from '@/pages/QuadrantPage';
import PillarsPage from '@/pages/PillarsPage';
import PhasesPage from '@/pages/PhasesPage';
import GovernancePage from '@/pages/GovernancePage';
import RisksPage from '@/pages/RisksPage';
import StakeholdersPage from '@/pages/StakeholdersPage';
import ExportsPage from '@/pages/ExportsPage';
import SettingsPage from '@/pages/SettingsPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'use-cases', element: <UseCaseListPage /> },
      { path: 'use-cases/:id', element: <UseCaseDetailPage /> },
      { path: 'quadrant', element: <QuadrantPage /> },
      { path: 'pillars', element: <PillarsPage /> },
      { path: 'phases', element: <PhasesPage /> },
      { path: 'governance', element: <GovernancePage /> },
      { path: 'risks', element: <RisksPage /> },
      { path: 'stakeholders', element: <StakeholdersPage /> },
      { path: 'exports', element: <ExportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
