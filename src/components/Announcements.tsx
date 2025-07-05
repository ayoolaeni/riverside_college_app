import React, { useState, useEffect } from 'react';
import { announcementsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Calendar,
  User,
  Globe,
  Users
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_by_name: string;
  class_level: string | null;
  created_at: string;
  updated_at: string;
}

const Announcements: React.FC = () => {
  const { isAdmin, isTeacher, isStudent, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    class_level: ''
  });

  const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAll();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await announcementsAPI.create({
        ...formData,
        class_level: formData.class_level || null
      });
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        class_level: ''
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleEditAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    
    try {
      await announcementsAPI.update(selectedAnnouncement.id, {
        ...formData,
        class_level: formData.class_level || null
      });
      setShowEditModal(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementsAPI.delete(announcementId);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      class_level: announcement.class_level || ''
    });
    setShowEditModal(true);
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || 
                        (classFilter === 'school-wide' && !announcement.class_level) ||
                        announcement.class_level === classFilter;
    return matchesSearch && matchesClass;
  });

  const canEditAnnouncement = (announcement: Announcement) => {
    return isAdmin || (isTeacher && announcement.created_by === profile?.id);
  };

  const getAnnouncementScope = (classLevel: string | null) => {
    return classLevel ? `${classLevel} Only` : 'School-wide';
  };

  const getAnnouncementIcon = (classLevel: string | null) => {
    return classLevel ? <Users className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  const getAnnouncementColor = (classLevel: string | null) => {
    return classLevel ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
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
              <Bell className="w-8 h-8 mr-3 text-riverside-blue-600" />
              Announcements
            </h2>
            <p className="text-gray-600 mt-1">
              {isStudent ? 'Stay updated with school and class announcements' : 'Manage school and class announcements'}
            </p>
          </div>
          {(isAdmin || isTeacher) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-riverside-blue-600 to-riverside-purple-600 text-white px-6 py-3 rounded-lg hover:from-riverside-blue-700 hover:to-riverside-purple-700 transition-all duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-riverside-blue-500 focus:border-transparent"
            >
              <option value="all">All Announcements</option>
              <option value="school-wide">School-wide</option>
              {classLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getAnnouncementColor(announcement.class_level)}`}>
                    {getAnnouncementIcon(announcement.class_level)}
                    <span>{getAnnouncementScope(announcement.class_level)}</span>
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">{announcement.content}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{announcement.created_by_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                  </div>
                  {announcement.updated_at !== announcement.created_at && (
                    <span className="text-xs text-gray-400">
                      (Updated {new Date(announcement.updated_at).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
              
              {canEditAnnouncement(announcement) && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openEditModal(announcement)}
                    className="p-2 text-riverside-blue-600 hover:bg-riverside-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-500">
            {searchTerm || classFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No announcements have been posted yet'
            }
          </p>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <input
                type="text"
                placeholder="Announcement Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                required
              />
              <textarea
                placeholder="Announcement Content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500 h-32 resize-none"
                required
              />
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({...formData, class_level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
              >
                <option value="">School-wide Announcement</option>
                {classLevels.map(level => (
                  <option key={level} value={level}>{level} Only</option>
                ))}
              </select>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-riverside-blue-600 text-white py-2 rounded-lg hover:bg-riverside-blue-700 transition-colors"
                >
                  Create Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {showEditModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Announcement</h3>
            <form onSubmit={handleEditAnnouncement} className="space-y-4">
              <input
                type="text"
                placeholder="Announcement Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                required
              />
              <textarea
                placeholder="Announcement Content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500 h-32 resize-none"
                required
              />
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({...formData, class_level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
              >
                <option value="">School-wide Announcement</option>
                {classLevels.map(level => (
                  <option key={level} value={level}>{level} Only</option>
                ))}
              </select>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-riverside-blue-600 text-white py-2 rounded-lg hover:bg-riverside-blue-700 transition-colors"
                >
                  Update Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;