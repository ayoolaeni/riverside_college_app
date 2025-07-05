import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import { GraduationCap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();

  // console.log('ProtectedRoute - Check:', { 
  //   hasUser: !!user, 
  //   hasProfile: !!profile, 
  //   loading, 
  //   userRole: user?.role,
  //   requiredRole 
  // });

  if (loading) {
    console.log('ProtectedRoute - Still loading, showing spinner');
    return (
      <div className="min-h-screen bg-gradient-to-br from-riverside-blue-50 to-riverside-purple-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-riverside-blue-600 mx-auto mb-4 animate-pulse" />
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-riverside-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('ProtectedRoute - No user or profile, showing login');
    return <Login />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    console.log(`ProtectedRoute - Role mismatch. User: ${profile.role}, Required: ${requiredRole}`);
    return (
      <div className="min-h-screen bg-gradient-to-br from-riverside-blue-50 to-riverside-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Your role is <span className="font-semibold text-riverside-blue-600">{profile.role}</span> 
            but this page requires <span className="font-semibold text-red-600">{requiredRole}</span> access.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-riverside-blue-600 text-white px-6 py-3 rounded-lg hover:bg-riverside-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log(`ProtectedRoute - Access granted for ${profile.role}`);
  return <>{children}</>;
};

export default ProtectedRoute;