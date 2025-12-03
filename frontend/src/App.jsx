import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from '@/contexts/AuthContext';

// Preload utility for route-based code splitting
const preloadRoute = (importFn) => {
  const component = lazy(importFn);
  // Preload on hover/focus for better UX
  component.preload = importFn;
  return component;
};

/* ------------------ Lazy loaded components ------------------ */

// Core components (loaded immediately)
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';

// Critical pages (preload)
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const OAuthCallback = lazy(() => import("./pages/auth/OAuthCallback"));

// Auth pages (medium priority)
const AlumniLogin = lazy(() => import("./pages/auth/AlumniLogin"));
const AlumniSignUp = lazy(() => import("./pages/auth/AlumniSignUp"));
const StudentLogin = lazy(() => import("./pages/auth/StudentLogin"));
const StudentSignUp = lazy(() => import("./pages/auth/StudentSignUp"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const ResetPasswordConfirm = lazy(() => import("./pages/auth/ResetPasswordConfirm"));

// Student pages (lazy loaded)
const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
const StudentProfile = lazy(() => import("./pages/Profile/StudentProfile"));
const StudentApplications = lazy(() => import("./pages/student/Applications"));
const StudentBookmarks = lazy(() => import("./pages/student/Bookmarks"));
const StudentLayout = lazy(() => import("@/components/layout/StudentLayout"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));

// Alumni pages (lazy loaded)
const AlumniLayout = lazy(() => import("@/components/layout/AlumniLayout"));
const AlumniIndex = lazy(() => import("./pages/AlumniIndex"));
const PostingsPage = lazy(() => import("./pages/PostingsPage"));
const PostJobPage = lazy(() => import("./pages/PostJobPage"));
const AddCompany = lazy(() => import("./pages/AddCompany"));
const CompanyProfilePage = lazy(() => import("./pages/CompanyProfilePage"));
const EditCompanyProfilePage = lazy(() => import("./pages/EditCompanyProfilePage"));
const EditMyProfilePage = lazy(() => import("./pages/EditMyProfilePage"));
const JobApplicantsPage = lazy(() => import("./pages/JobApplicantsPage"));

// Admin pages (lazy loaded - least priority)
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CompaniesManagement = lazy(() => import("./pages/admin/CompaniesManagement"));
const PostingsManagement = lazy(() => import("./pages/admin/PostingsManagement"));
const ApplicationsManagement = lazy(() => import("./pages/admin/ApplicationsManagement"));
const TaxonomiesManagement = lazy(() => import("./pages/admin/TaxonomiesManagement"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const Settings = lazy(() => import("./pages/admin/Settings"));
/* ---------------------------------------------------------- */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
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
                <Route
                  path="/reset-password/confirm"
                  element={
                    <PublicRoute>
                      <ResetPasswordConfirm />
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}
