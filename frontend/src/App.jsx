import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from '@/contexts/AuthContext';

/* ------------------ Admin module imports ------------------ */
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CompaniesManagement from "./pages/admin/CompaniesManagement";
import PostingsManagement from "./pages/admin/PostingsManagement";
import ApplicationsManagement from "./pages/admin/ApplicationsManagement";
import TaxonomiesManagement from "./pages/admin/TaxonomiesManagement";
import Analytics from "./pages/admin/Analytics";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";

/* ------------------ Student / Public module imports ------------------ */
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import AlumniLogin from "./pages/auth/AlumniLogin";
import AlumniSignUp from "./pages/auth/AlumniSignUp";
import StudentLogin from "./pages/auth/StudentLogin";
import StudentSignUp from "./pages/auth/StudentSignUp";
import ResetPassword from "./pages/auth/ResetPassword";
import OAuthCallback from "./pages/auth/OAuthCallback";
import StudentDashboard from "./components/StudentDashboard";
import StudentProfile from "./pages/Profile/StudentProfile";
import StudentApplications from "./pages/student/Applications";
import StudentBookmarks from "./pages/student/Bookmarks";
import MessagesPage from "./pages/MessagesPage";
import PublicProfilePage from "./pages/PublicProfilePage";

/* ------------------ Alumni module imports ------------------ */
import { AlumniLayout } from "@/components/layout/AlumniLayout";
import AlumniIndex from "./pages/AlumniIndex";
import PostingsPage from "./pages/PostingsPage";
import PostJobPage from "./pages/PostJobPage";
import AddCompany from "./pages/AddCompany";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import EditCompanyProfilePage from "./pages/EditCompanyProfilePage";
import EditMyProfilePage from "./pages/EditMyProfilePage";
import JobApplicantsPage from "./pages/JobApplicantsPage";

/* ------------------ Shared ------------------ */
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import NotFound from "./pages/NotFound";
import { StudentLayout } from "@/components/layout/StudentLayout";
import Privacy from "./pages/Privacy";
import ProfileSetup from "./pages/ProfileSetup";
/* ---------------------------------------------------------- */

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* ---------- Student / public routes ---------- */}
                <Route path="/" element={<Index />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />

                {/* Auth */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <SignUp />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/alumni/login"
                  element={
                    <PublicRoute>
                      <AlumniLogin />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/alumni/signup"
                  element={
                    <PublicRoute>
                      <AlumniSignUp />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/student/login"
                  element={
                    <PublicRoute>
                      <StudentLogin />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/student/signup"
                  element={
                    <PublicRoute>
                      <StudentSignUp />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  }
                />
                <Route path="/auth/callback" element={<OAuthCallback />} />

                {/* Static pages */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />

                {/* Public profile viewing */}
                <Route path="/student/profile/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
                <Route path="/alumni/profile/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />

                {/* Student workspace */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="applications" element={<StudentApplications />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="bookmarks" element={<StudentBookmarks />} />
                </Route>
                <Route path="/dashboard" element={<Navigate to="/student" replace />} />

                {/* ---------------- Admin routes (nested) ----------------- */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="companies" element={<CompaniesManagement />} />
                  <Route path="postings" element={<PostingsManagement />} />
                  <Route path="applications" element={<ApplicationsManagement />} />
                  <Route path="taxonomies" element={<TaxonomiesManagement />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                </Route>

                {/* ---------------- Alumni routes (nested) ----------------- */}
                <Route path="/alumni" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniLayout /></ProtectedRoute>}>
                  <Route index element={<AlumniIndex />} />
                  <Route path="postings" element={<PostingsPage />} />
                  <Route path="post-job" element={<PostJobPage />} />
                  <Route path="add-company" element={<AddCompany />} />
                  <Route path="company-profile" element={<CompanyProfilePage />} />
                  <Route path="edit-company-profile" element={<EditCompanyProfilePage />} />
                  <Route path="profile" element={<EditMyProfilePage />} />
                  <Route path="applications" element={<JobApplicantsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                </Route>

                {/* ---------------- Catch-all for everything ---------------- */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}
