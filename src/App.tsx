import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './layouts/Layout';

const RoutesPage = lazy(() => import('./pages/RoutesPage').then((module) => ({ default: module.RoutesPage })));
const RouteDetailsPage = lazy(() => import('./pages/RouteDetailsPage').then((module) => ({ default: module.RouteDetailsPage })));
const BookingsPage = lazy(() => import('./pages/BookingsPage').then((module) => ({ default: module.BookingsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const RoleDashboardPage = lazy(() => import('./pages/RoleDashboardPage').then((module) => ({ default: module.RoleDashboardPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const WalletPage = lazy(() => import('./pages/WalletPage').then((module) => ({ default: module.WalletPage })));

function RouteLoadingFallback() {
  return <main className="page-content"><div className="route-grid" aria-label="გვერდი იტვირთება"><div className="route-skeleton"><span /><span /><span /><span /></div><div className="route-skeleton"><span /><span /><span /><span /></div></div></main>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route element={<Layout />}>
              <Route index element={<RoutesPage />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="routes/:id" element={<RouteDetailsPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="wallet" element={<ProtectedRoute allowedRoles={['passenger', 'driver', 'company', 'admin']}><WalletPage /></ProtectedRoute>} />
              <Route path="about" element={<AboutPage />} />
              <Route path="dashboard/driver" element={<ProtectedRoute allowedRoles={['driver', 'admin']}><RoleDashboardPage role="driver" /></ProtectedRoute>} />
              <Route path="dashboard/company" element={<ProtectedRoute allowedRoles={['company', 'admin']}><RoleDashboardPage role="company" /></ProtectedRoute>} />
              <Route path="dashboard" element={<Navigate to="/dashboard/driver" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
