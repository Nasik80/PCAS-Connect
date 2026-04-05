import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Teachers from './pages/Teachers';
import Syllabus from './pages/Syllabus';
import Students from './pages/Students';
import Timetable from './pages/Timetable';
import Attendance from './pages/Attendance';
import Placeholder from './pages/Placeholder';
import Reports from './pages/Reports';

import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherInternalMarks from './pages/teacher/TeacherInternalMarks';
import InternalMarkEntry from './pages/teacher/InternalMarkEntry';
import HODDashboard from './pages/hod/HODDashboard';
import HODStudentList from './pages/hod/HODStudentList';
import HODTeacherList from './pages/hod/HODTeacherList';
import HODAssignTeacher from './pages/hod/HODAssignTeacher';
import HODPromote from './pages/hod/HODPromote';
import HODAnnouncement from './pages/hod/HODAnnouncement';
import HODInternalMarks from './pages/hod/HODInternalMarks';
import StudentStudyNotes from './pages/student/StudentStudyNotes';
import TeacherStudyNotes from './pages/teacher/TeacherStudyNotes';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }

    // Check if user has one of the allowed roles
    // 'user.role' should match 'admin', 'student', 'teacher', 'HOD'
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their appropriate dashboard if they try to access unauthorized page
      if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
      if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
      if (user.role === 'HOD') return <Navigate to="/hod/dashboard" replace />;
      if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Departments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/syllabus"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Syllabus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetable"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Timetable />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Placeholder title="System Settings" />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/study-notes"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentStudyNotes />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'HOD']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/study-notes"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'HOD']}>
            <TeacherStudyNotes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'HOD']}>
            <TeacherAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/internal-marks"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'HOD']}>
            <TeacherInternalMarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/internal-marks/:subjectId"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'HOD']}>
            <InternalMarkEntry />
          </ProtectedRoute>
        }
      />

      {/* HOD Routes */}
      <Route
        path="/hod/dashboard"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HODDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/students"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HODStudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/teachers"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HODTeacherList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/assign"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HODAssignTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/promote"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HODPromote />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/announcement"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HODAnnouncement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/internal-marks"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HODInternalMarks />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
