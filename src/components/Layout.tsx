import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Bell, 
  BookOpen, 
  Users, 
  FileText, 
  Video,
  BarChart3,
  GraduationCap,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut, isAdmin, isTeacher, isStudent } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { name: 'User Management', icon: Users, path: '/users' },
        { name: 'Video Management', icon: Video, path: '/videos' },
        { name: 'Results Management', icon: FileText, path: '/results' },
        { name: 'Announcements', icon: Bell, path: '/announcements' },
        { name: 'System Overview', icon: Activity, path: '/overview' },
      ];
    }

    if (isTeacher) {
      return [
        { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { name: 'My Videos', icon: Video, path: '/videos' },
        { name: 'Assignments', icon: BookOpen, path: '/assignments' },
        { name: 'Class Results', icon: BarChart3, path: '/results' },
        { name: 'Announcements', icon: Bell, path: '/announcements' },
      ];
    }

    if (isStudent) {
      return [
        { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { name: 'Class Videos', icon: Video, path: '/videos' },
        { name: 'Assignments', icon: BookOpen, path: '/assignments' },
        { name: 'My Results', icon: FileText, path: '/results' },
        { name: 'Announcements', icon: Bell, path: '/announcements' },
      ];
    }

    return [
      { name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
      { name: 'Videos', icon: Video, path: '/videos' },
      { name: 'Assignments', icon: BookOpen, path: '/assignments' },
      { name: 'Results', icon: FileText, path: '/results' },
      { name: 'Announcements', icon: Bell, path: '/announcements' },
    ];
  };

  const navItems = getNavItems();

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-riverside-blue-50 to-riverside-purple-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-riverside-blue-600 to-riverside-purple-600 flex-shrink-0">
          <div className="flex items-center">
            <GraduationCap className="w-8 h-8 text-white mr-3" />
            <span className="text-white font-bold text-lg">Riverside College</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-riverside-blue-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 mt-8 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-riverside-blue-50 hover:to-riverside-purple-50 hover:text-riverside-blue-700 transition-all duration-200 ${
                isActiveRoute(item.path) 
                  ? 'bg-gradient-to-r from-riverside-blue-50 to-riverside-purple-50 text-riverside-blue-700 border-r-4 border-riverside-blue-600' 
                  : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 relative z-10 flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {profile?.full_name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600 capitalize">{profile?.role}</span>
                {profile?.class_level && (
                  <span className="text-sm bg-riverside-blue-100 text-riverside-blue-800 px-2 py-1 rounded-full">
                    {profile.class_level}
                  </span>
                )}
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;