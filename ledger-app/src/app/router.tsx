import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './shell/AppLayout'
import { BillsPage } from '../pages/BillsPage'
import { StatsPage } from '../pages/StatsPage'
import { AnalysisPage } from '../pages/AnalysisPage'
import { SettingsPage } from '../pages/SettingsPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/bills" replace /> },
      { path: 'bills', element: <BillsPage /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

