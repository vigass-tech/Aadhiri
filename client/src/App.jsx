import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import TrackComplaintPage from './pages/public/TrackComplaintPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Auth Pages
import UnifiedLoginPage from './pages/auth/UnifiedLoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Super Admin Pages
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import DepartmentManagement from './pages/superAdmin/DepartmentManagement';
import AdminManagement from './pages/superAdmin/AdminManagement';
import ReviewerManagement from './pages/superAdmin/ReviewerManagement';
import CitizenManagement from './pages/superAdmin/CitizenManagement';
import ComplaintManagement from './pages/superAdmin/ComplaintManagement';
import BudgetManagement from './pages/superAdmin/BudgetManagement';
import ReportsAnalytics from './pages/superAdmin/ReportsAnalytics';
import SuperAdminProfile from './pages/superAdmin/SuperAdminProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReviewers from './pages/admin/AdminReviewers';
import AdminCitizens from './pages/admin/AdminCitizens';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminBudgets from './pages/admin/AdminBudgets';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';

// Reviewer Pages
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard';
import AssignedComplaints from './pages/reviewer/AssignedComplaints';
import ReviewerHistory from './pages/reviewer/ReviewerHistory';
import ReviewerProfile from './pages/reviewer/ReviewerProfile';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import RaiseComplaint from './pages/citizen/RaiseComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import CitizenTrackComplaint from './pages/citizen/CitizenTrackComplaint';
import CitizenSupport from './pages/citizen/CitizenSupport';
import CitizenNotifications from './pages/citizen/CitizenNotifications';
import CitizenProfile from './pages/citizen/CitizenProfile';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes Wrapped in PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/track-complaint" element={<TrackComplaintPage />} />
            <Route path="/login" element={<UnifiedLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Super Admin Module */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="departments" element={<DepartmentManagement />} />
            <Route path="admins" element={<AdminManagement />} />
            <Route path="reviewers" element={<ReviewerManagement />} />
            <Route path="citizens" element={<CitizenManagement />} />
            <Route path="complaints" element={<ComplaintManagement />} />
            <Route path="budgets" element={<BudgetManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="profile" element={<SuperAdminProfile />} />
          </Route>

          {/* Admin Module */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reviewers" element={<AdminReviewers />} />
            <Route path="citizens" element={<AdminCitizens />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="budgets" element={<AdminBudgets />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Reviewer Module */}
          <Route
            path="/reviewer"
            element={
              <ProtectedRoute allowedRoles={['REVIEWER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/reviewer/dashboard" replace />} />
            <Route path="dashboard" element={<ReviewerDashboard />} />
            <Route path="assigned-complaints" element={<AssignedComplaints />} />
            <Route path="history" element={<ReviewerHistory />} />
            <Route path="profile" element={<ReviewerProfile />} />
          </Route>

          {/* Citizen Module */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/citizen/dashboard" replace />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="raise-complaint" element={<RaiseComplaint />} />
            <Route path="my-complaints" element={<MyComplaints />} />
            <Route path="track-complaint" element={<CitizenTrackComplaint />} />
            <Route path="support" element={<CitizenSupport />} />
            <Route path="notifications" element={<CitizenNotifications />} />
            <Route path="profile" element={<CitizenProfile />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

