import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CourseManagement from './pages/CourseManagement';
import RegistrationManagement from './pages/RegistrationManagement';
import SemesterManagement from './pages/SemesterManagement';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherCourses from './pages/TeacherCourses';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="my-registrations" element={<MyRegistrations />} />
        <Route path="profile" element={<Profile />} />

        {/* Teacher Routes */}
        <Route path="teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="teacher/courses" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherCourses />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="admin/courses" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <CourseManagement />
          </ProtectedRoute>
        } />
        <Route path="admin/registrations" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <RegistrationManagement />
          </ProtectedRoute>
        } />
        <Route path="admin/semesters" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SemesterManagement />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// App Component with Context
const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App; 