import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for premium performance & holographic loading feel
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Verify2FA = lazy(() => import('./pages/Verify2FA'));
const InvitationResponse = lazy(() => import('./pages/InvitationResponse'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const EditProject = lazy(() => import('./pages/EditProject'));

// Dashboard Router to determine which dashboard to show
const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'Manager' || user?.role === 'Admin') {
    return <AdminDashboard />;
  }
  return <StudentDashboard />;
};

// Manager Dashboard Alias (for backward compatibility if needed)
const ManagerDashboard = () => <AdminDashboard />;

// Premium holographic loading spinner
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#020617] flex items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-holo-cyan/20 border-t-holo-cyan rounded-full animate-spin shadow-[0_0_15px_rgba(0,243,255,0.5)]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-holo-cyan/10 rounded-full blur-md animate-pulse"></div>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/verify-2fa" element={<Verify2FA />} />
              <Route path="/invitations/:projectId/:action" element={<InvitationResponse />} />

              {/* Protected Routes Wrapped in Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<DashboardRouter />} />
                        <Route path="/projects/:id" element={<ProjectDetails />} />
                        <Route path="/projects/:id/edit" element={<EditProject />} />
                        <Route path="/manager" element={<ManagerDashboard />} />
                        {/* Catch all for protected routes */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
