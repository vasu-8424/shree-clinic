import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import {
  AppointmentsPage,
  HearingAidsPage,
  InventoryPage,
  BillingPage,
  ReportsPage,
  AuditLogPage,
  SettingsPage,
} from './pages/PlaceholderPages';

export const AdminApp: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login Route */}
        <Route path="login" element={<LoginPage />} />

        {/* Protected Admin Console Routes */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="hearing-aids" element={<HearingAidsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};
