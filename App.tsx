import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const Teachers = lazy(() => import('./pages/Teachers'));
const TeacherProfile = lazy(() => import('./pages/TeacherProfile'));
const Staff = lazy(() => import('./pages/Staff'));
const StaffProfile = lazy(() => import('./pages/StaffProfile'));
const Batches = lazy(() => import('./pages/Batches'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Reports = lazy(() => import('./pages/Reports'));
const TakeAttendance = lazy(() => import('./pages/TakeAttendance'));
const AttendanceRecords = lazy(() => import('./pages/AttendanceRecords'));
const SalaryAndPayments = lazy(() => import('./pages/SalaryAndPayments'));


const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<div className="p-6 text-center text-lg">Loading Page...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:studentId" element={<StudentProfile />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:teacherId" element={<TeacherProfile />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/:staffId" element={<StaffProfile />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/finance" element={<SalaryAndPayments />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/attendance/take" element={<TakeAttendance />} />
            <Route path="/attendance/records" element={<AttendanceRecords />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};

export default App;