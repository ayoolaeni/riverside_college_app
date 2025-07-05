import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../lib/api';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Video, 
  FileText, 
  Bell, 
  TrendingUp, 
  BookOpen,
  Award,
  Clock,
  BarChart3,
  Plus,
  Eye,
  Activity,
  ArrowRight,
  Calendar,
  Target
} from 'lucide-react';

interface DashboardStats {
  totalUsers?: number;
  totalVideos?: number;
  totalAssignments?: number;
  totalAnnouncements?: number;
  classVideos?: number;
  myResults?: number;
  pendingAssignments?: number;
  averageScore?: number;
}

const Dashboard: React.FC = () => {
  const { profile, isAdmin, isTeacher, isStudent } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getActivities()
      ]);

      setStats(statsResponse.data);
      setRecentActivities(activitiesResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${profile?.full_name}!`;
  };

  // Helper function to get activity dot color
  function getActivityDotColor(activityType: string) {
    const colorMap: { [key: string]: string } = {
      'login': 'bg-green-500',
      'logout': 'bg-gray-500',
      'user_create': 'bg-blue-500',
      'user_update': 'bg-yellow-500',
      'user_delete': 'bg-red-500',
      'video_upload': 'bg-purple-500',
      'video_update': 'bg-yellow-500',
      'video_delete': 'bg-red-500',
      'assignment_create': 'bg-indigo-500',
      'assignment_update': 'bg-yellow-500',
      'assignment_delete': 'bg-red-500',
      'assignment_submit': 'bg-green-500',
      'assignment_grade': 'bg-orange-500',
      'result_upload': 'bg-teal-500',
      'result_update': 'bg-yellow-500',
      'result_delete': 'bg-red-500',
      'announcement_create': 'bg-blue-500',
      'announcement_update': 'bg-yellow-500',
      'announcement_delete': 'bg-red-500',
      'password_reset': 'bg-orange-500'
    };
    
    return colorMap[activityType] || 'bg-riverside-blue-600';
  }

  // Helper function to get role badge color
  function getRoleBadgeColor(role: string) {
    const colorMap: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800',
      'teacher': 'bg-blue-100 text-blue-800',
      'student': 'bg-green-100 text-green-800'
    };
    
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-riverside-blue-50 to-riverside-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-riverside-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-riverside-blue-600 to-riverside-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold mb-3">{getWelcomeMessage()}</h1>
              <p className="text-riverside-blue-100 text-lg max-w-2xl">
                {isAdmin && "Manage your school's learning platform from here. Monitor system health, manage users, and oversee all educational content."}
                {isTeacher && `Teaching ${profile?.class_level} - Continue inspiring young minds with engaging content and meaningful assessments.`}
                {isStudent && `${profile?.class_level} Student - Keep up the great work! Access your learning materials and track your progress.`}
              </p>
            </div>
            <div className="flex items-center space-x-6 text-riverside-blue-100">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Today</p>
                <p className="text-lg font-semibold text-white">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Time</p>
                <p className="text-lg font-semibold text-white">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-riverside-blue-600">{stats.totalUsers || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Active accounts
                  </p>
                </div>
                <div className="bg-gradient-to-br from-riverside-blue-100 to-riverside-blue-200 p-4 rounded-xl">
                  <Users className="w-8 h-8 text-riverside-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Videos</p>
                  <p className="text-3xl font-bold text-riverside-purple-600">{stats.totalVideos || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Video className="w-3 h-3 mr-1" />
                    Learning content
                  </p>
                </div>
                <div className="bg-gradient-to-br from-riverside-purple-100 to-riverside-purple-200 p-4 rounded-xl">
                  <Video className="w-8 h-8 text-riverside-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Assignments</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalAssignments || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    Active tasks
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Announcements</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.totalAnnouncements || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Bell className="w-3 h-3 mr-1" />
                    Recent updates
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl">
                  <Bell className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {isTeacher && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">My Videos</p>
                  <p className="text-3xl font-bold text-riverside-blue-600">{stats.totalVideos || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Video className="w-3 h-3 mr-1" />
                    Uploaded content
                  </p>
                </div>
                <div className="bg-gradient-to-br from-riverside-blue-100 to-riverside-blue-200 p-4 rounded-xl">
                  <Video className="w-8 h-8 text-riverside-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">My Assignments</p>
                  <p className="text-3xl font-bold text-riverside-purple-600">{stats.totalAssignments || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Created tasks
                  </p>
                </div>
                <div className="bg-gradient-to-br from-riverside-purple-100 to-riverside-purple-200 p-4 rounded-xl">
                  <BookOpen className="w-8 h-8 text-riverside-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">My Announcements</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalAnnouncements || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Bell className="w-3 h-3 mr-1" />
                    Posted updates
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
                  <Bell className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {isStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Class Videos</p>
                  <p className="text-3xl font-bold text-riverside-blue-600">{stats.classVideos || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Video className="w-3 h-3 mr-1" />
                    Available content
                  </p>
                </div>
                <div className="bg-gradient-to-br from-riverside-blue-100 to-riverside-blue-200 p-4 rounded-xl">
                  <Video className="w-8 h-8 text-riverside-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">My Results</p>
                  <p className="text-3xl font-bold text-riverside-purple-600">{stats.myResults || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    Test scores
                  </p>
                </div>
                <div className="bg-gradient-to-br from-riverside-purple-100 to-riverside-purple-200 p-4 rounded-xl">
                  <FileText className="w-8 h-8 text-riverside-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Assignments</p>
                  <p className="text-3xl font-bold text-green-600">{stats.pendingAssignments || 0}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Pending tasks
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Average Score</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.averageScore || 0}%</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Performance
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-riverside-blue-600" />
                  Quick Actions
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Get things done faster</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isAdmin && (
                  <>
                    <Link to="/users" className="group p-6 bg-gradient-to-br from-riverside-blue-50 to-riverside-blue-100 hover:from-riverside-blue-100 hover:to-riverside-blue-200 rounded-xl transition-all duration-300 border border-riverside-blue-200 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-riverside-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-riverside-blue-700 text-lg">Manage Users</p>
                            <p className="text-sm text-riverside-blue-600">Add, edit, or remove users</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-riverside-blue-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                    
                    <Link to="/videos" className="group p-6 bg-gradient-to-br from-riverside-purple-50 to-riverside-purple-100 hover:from-riverside-purple-100 hover:to-riverside-purple-200 rounded-xl transition-all duration-300 border border-riverside-purple-200 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-riverside-purple-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-riverside-purple-700 text-lg">Video Management</p>
                            <p className="text-sm text-riverside-purple-600">Upload and organize content</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-riverside-purple-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                    
                    <Link to="/results" className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 border border-green-200 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-green-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-green-700 text-lg">Results Management</p>
                            <p className="text-sm text-green-600">Track student performance</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                    
                    <Link to="/overview" className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-300 border border-orange-200 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-orange-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                            <Activity className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-orange-700 text-lg">System Overview</p>
                            <p className="text-sm text-orange-600">Monitor system health</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                  </>
                )}
                
                {isTeacher && (
                  <>
                    <Link to="/videos" className="group p-6 bg-gradient-to-br from-riverside-blue-50 to-riverside-blue-100 hover:from-riverside-blue-100 hover:to-riverside-blue-200 rounded-xl transition-all duration-300 border border-riverside-blue-200 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-riverside-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                            <Plus className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-riverside-blue-700 text-lg">Upload Video</p>
                            <p className="text-sm text-riverside-blue-600">Share new lesson content</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-riverside-blue-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                    
                    <Link to="/results" className="group p-6 bg-gradient-to-br from-riverside-purple-50 to-riverside-purple-100 hover:from-riverside-purple-100 hover:to-riverside-purple-200 rounded-xl transition-all duration-300 border border-riverside-purple-200 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-riverside-purple-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-riverside-purple-700 text-lg">Upload Results</p>
                            <p className="text-sm text-riverside-purple-600">Add student grades</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-riverside-purple-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                  </>
                )}
                
                {isStudent && (
                  <>
                    <Link to="/videos" className="group p-6 bg-gradient-to-br from-riverside-blue-50 to-riverside-blue-100 hover:from-riverside-blue-100 hover:to-riverside-blue-200 rounded-xl transition-all duration-300 border border-riverside-blue-200 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-riverside-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-riverside-blue-700 text-lg">Watch Videos</p>
                            <p className="text-sm text-riverside-blue-600">Continue learning</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-riverside-blue-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                    
                    <Link to="/results" className="group p-6 bg-gradient-to-br from-riverside-purple-50 to-riverside-purple-100 hover:from-riverside-purple-100 hover:to-riverside-purple-200 rounded-xl transition-all duration-300 border border-riverside-purple-200 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-riverside-purple-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-riverside-purple-700 text-lg">View Results</p>
                            <p className="text-sm text-riverside-purple-600">Check your performance</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-riverside-purple-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-3 text-riverside-blue-600" />
                Recent Activity
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Latest updates</span>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                    <div className={`w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0 shadow-sm ${getActivityDotColor(activity.type)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-gray-800 font-semibold">{activity.title}</p>
                        {activity.userRole && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(activity.userRole)}`}>
                            {activity.userRole}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{activity.description}</p>
                      {activity.user && (
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm font-medium">No recent activities</p>
                  <p className="text-gray-400 text-xs mt-2">Activity will appear here as you use the system</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;