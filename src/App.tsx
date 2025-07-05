import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import VideoManagement from './components/VideoManagement';
import ResultManagement from './components/ResultManagement';
import AssignmentManagement from './components/AssignmentManagement';
import Announcements from './components/Announcements';
import SystemOverview from './components/SystemOverview';

function App() {
  console.log('App - Rendering main app component');
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/videos" element={
            <ProtectedRoute>
              <Layout>
                <VideoManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <Layout>
                <ResultManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute>
              <Layout>
                <AssignmentManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute>
              <Layout>
                <Announcements />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/overview" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <SystemOverview />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;