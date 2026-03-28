import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/auth.store';
import AppShell from './components/layout/AppShell';
import LoadingScreen from './components/ui/LoadingScreen';

// ── Code splitting par page ───────────────────────────────────
const LoginPage      = lazy(() => import('./pages/LoginPage'));
const RegisterPage   = lazy(() => import('./pages/RegisterPage'));

// Member pages
const DashboardPage     = lazy(() => import('./pages/member/DashboardPage'));
const ClusterPage       = lazy(() => import('./pages/member/ClusterPage'));
const ProjectsPage      = lazy(() => import('./pages/member/ProjectsPage'));
const InvestirPage      = lazy(() => import('./pages/member/InvestirPage'));
const PortfolioPage     = lazy(() => import('./pages/member/PortfolioPage'));
const KycPage           = lazy(() => import('./pages/member/KycPage'));
const ActualitesPage    = lazy(() => import('./pages/member/ActualitesPage'));
const ParrainagePage    = lazy(() => import('./pages/member/ParrainagePage'));
const CalendrierPage    = lazy(() => import('./pages/member/CalendrierPage'));
const AlertesPage       = lazy(() => import('./pages/member/AlertesPage'));
const MatchingPage      = lazy(() => import('./pages/member/MatchingPage'));
const MessagesPage      = lazy(() => import('./pages/member/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/member/NotificationsPage'));
const ProfilePage       = lazy(() => import('./pages/member/ProfilePage'));

// Admin pages
const AdminDashboardPage    = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminMembersPage      = lazy(() => import('./pages/admin/AdminMembersPage'));
const AdminClustersPage     = lazy(() => import('./pages/admin/AdminClustersPage'));
const AdminProjectsPage     = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminInvestPage       = lazy(() => import('./pages/admin/AdminInvestPage'));
const AdminKycPage          = lazy(() => import('./pages/admin/AdminKycPage'));
const AdminVotesPage        = lazy(() => import('./pages/admin/AdminVotesPage'));
const AdminArchivesPage     = lazy(() => import('./pages/admin/AdminArchivesPage'));
const AdminAnnouncementsPage= lazy(() => import('./pages/admin/AdminAnnouncementsPage'));
const AdminCalendrierPage   = lazy(() => import('./pages/admin/AdminCalendrierPage'));
const AdminModerationPage   = lazy(() => import('./pages/admin/AdminModerationPage'));
const AdminNdaPage          = lazy(() => import('./pages/admin/AdminNdaPage'));
const AdminAnalyticsPage    = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminAuditPage        = lazy(() => import('./pages/admin/AdminAuditPage'));
const AdminSettingsPage     = lazy(() => import('./pages/admin/AdminSettingsPage'));

// ── React Query config ────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,       // données fraîches 30s
      gcTime: 5 * 60_000,      // garbage collect après 5min
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (err: any) => {
        console.error('Mutation error:', err?.response?.data?.error || err.message);
      },
    },
  },
});

// ── Guards ────────────────────────────────────────────────────
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user || user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  return children;
}

// ── App Root ──────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
            <Route path="/"         element={<Navigate to="/dashboard" replace />} />

            {/* Member — protégé */}
            <Route path="/" element={<RequireAuth><AppShell /></RequireAuth>}>
              <Route path="dashboard"  element={<DashboardPage />} />
              <Route path="cluster"    element={<ClusterPage />} />
              <Route path="projects"   element={<ProjectsPage />} />
              <Route path="investir"   element={<InvestirPage />} />
              <Route path="portfolio"  element={<PortfolioPage />} />
              <Route path="kyc"        element={<KycPage />} />
              <Route path="actualites" element={<ActualitesPage />} />
              <Route path="parrainage" element={<ParrainagePage />} />
              <Route path="calendrier" element={<CalendrierPage />} />
              <Route path="alertes"    element={<AlertesPage />} />
              <Route path="matching"   element={<MatchingPage />} />
              <Route path="messages"   element={<MessagesPage />} />
              <Route path="notifs"     element={<NotificationsPage />} />
              <Route path="profile"    element={<ProfilePage />} />
            </Route>

            {/* Admin — protégé + rôle admin */}
            <Route path="/admin" element={<RequireAdmin><RequireAuth><AppShell /></RequireAuth></RequireAdmin>}>
              <Route index              element={<AdminDashboardPage />} />
              <Route path="members"     element={<AdminMembersPage />} />
              <Route path="clusters"    element={<AdminClustersPage />} />
              <Route path="projects"    element={<AdminProjectsPage />} />
              <Route path="invest"      element={<AdminInvestPage />} />
              <Route path="kyc"         element={<AdminKycPage />} />
              <Route path="votes"       element={<AdminVotesPage />} />
              <Route path="archives"    element={<AdminArchivesPage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="calendrier"  element={<AdminCalendrierPage />} />
              <Route path="moderation"  element={<AdminModerationPage />} />
              <Route path="nda"         element={<AdminNdaPage />} />
              <Route path="analytics"   element={<AdminAnalyticsPage />} />
              <Route path="audit"       element={<AdminAuditPage />} />
              <Route path="settings"    element={<AdminSettingsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '13px',
            borderRadius: '10px',
          },
        }}
      />

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
