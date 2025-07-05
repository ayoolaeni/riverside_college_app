import React, { useState, useEffect } from 'react';
import { dashboardAPI, usersAPI, videosAPI, resultsAPI } from '../lib/api';
import { 
  Activity, 
  Users, 
  Video, 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Wifi
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalVideos: number;
  totalResults: number;
  totalAnnouncements: number;
  usersByRole: { [key: string]: number };
  videosByClass: { [key: string]: number };
  recentActivity: any[];
}

const SystemOverview: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalVideos: 0,
    totalResults: 0,
    totalAnnouncements: 0,
    usersByRole: {},
    videosByClass: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    server: 'healthy',
    api: 'healthy'
  });

  useEffect(() => {
    fetchSystemData();
    checkSystemHealth();
  }, []);

  const fetchSystemData = async () => {
    try {
      const [dashboardResponse, usersResponse, videosResponse, resultsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        usersAPI.getAll(),
        videosAPI.getAll(),
        resultsAPI.getAll()
      ]);

      const users = usersResponse.data;
      const videos = videosResponse.data;
      const results = resultsResponse.data;

      // Calculate user distribution by role
      const usersByRole = users.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      // Calculate video distribution by class
      const videosByClass = videos.reduce((acc: any, video: any) => {
        acc[video.class_level] = (acc[video.class_level] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalUsers: users.length,
        totalVideos: videos.length,
        totalResults: results.length,
        totalAnnouncements: dashboardResponse.data.totalAnnouncements || 0,
        usersByRole,
        videosByClass,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSystemHealth = () => {
    // Simulate system health checks
    setSystemHealth({
      database: 'healthy',
      server: 'healthy',
      api: 'healthy'
    });
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-riverside-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="w-8 h-8 mr-3 text-riverside-blue-600" />
              System Overview
            </h2>
            <p className="text-gray-600 mt-1">Monitor system health and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">System Online</span>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Server className="w-5 h-5 mr-2 text-riverside-blue-600" />
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Database className="w-6 h-6 mr-3 text-gray-600" />
              <span className="font-medium text-gray-900">Database</span>
            </div>
            <div className="flex items-center">
              {getHealthIcon(systemHealth.database)}
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(systemHealth.database)}`}>
                {systemHealth.database}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Server className="w-6 h-6 mr-3 text-gray-600" />
              <span className="font-medium text-gray-900">Server</span>
            </div>
            <div className="flex items-center">
              {getHealthIcon(systemHealth.server)}
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(systemHealth.server)}`}>
                {systemHealth.server}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Wifi className="w-6 h-6 mr-3 text-gray-600" />
              <span className="font-medium text-gray-900">API</span>
            </div>
            <div className="flex items-center">
              {getHealthIcon(systemHealth.api)}
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(systemHealth.api)}`}>
                {systemHealth.api}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-riverside-blue-600">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Active accounts</p>
            </div>
            <Users className="w-8 h-8 text-riverside-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Videos</p>
              <p className="text-3xl font-bold text-riverside-purple-600">{stats.totalVideos}</p>
              <p className="text-xs text-gray-500 mt-1">Learning content</p>
            </div>
            <Video className="w-8 h-8 text-riverside-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Results</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalResults}</p>
              <p className="text-xs text-gray-500 mt-1">Student records</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Announcements</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalAnnouncements}</p>
              <p className="text-xs text-gray-500 mt-1">Active notices</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-riverside-blue-600" />
            User Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    role === 'admin' ? 'bg-red-500' :
                    role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{role}s</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 mr-2">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        role === 'admin' ? 'bg-red-500' :
                        role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Video className="w-5 h-5 mr-2 text-riverside-purple-600" />
            Video Distribution by Class
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.videosByClass).map(([classLevel, count]) => (
              <div key={classLevel} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-riverside-purple-500"></div>
                  <span className="text-sm font-medium text-gray-700">{classLevel}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 mr-2">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-riverside-purple-500"
                      style={{ width: `${(count / stats.totalVideos) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-riverside-blue-600" />
          Recent System Activity
        </h3>
        <div className="space-y-3">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-riverside-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No recent system activities</p>
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-lg font-bold text-gray-900">99.9%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Response Time</p>
            <p className="text-lg font-bold text-gray-900">120ms</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Storage Used</p>
            <p className="text-lg font-bold text-gray-900">45%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Last Backup</p>
            <p className="text-lg font-bold text-gray-900">2h ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;