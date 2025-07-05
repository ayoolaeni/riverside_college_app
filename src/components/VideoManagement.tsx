import React, { useState, useEffect } from 'react';
import { videosAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Video, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Play,
  Calendar,
  User
} from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  class_level: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

const VideoManagement: React.FC = () => {
  const { isAdmin, isTeacher, profile } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    class_level: ''
  });

  const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videosAPI.getAll();
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await videosAPI.create(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        url: '',
        class_level: ''
      });
      fetchVideos();
    } catch (error) {
      console.error('Error creating video:', error);
    }
  };

  const handleEditVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo) return;
    
    try {
      await videosAPI.update(selectedVideo.id, formData);
      setShowEditModal(false);
      setSelectedVideo(null);
      fetchVideos();
    } catch (error) {
      alert('Error updating video: ' + ((error as any)?.response?.data?.error || (error as any)?.message));
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await videosAPI.delete(videoId);
        fetchVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const openEditModal = (video: VideoItem) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      url: video.url,
      class_level: video.class_level
    });
    setShowEditModal(true);
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg` : null;
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || video.class_level === classFilter;
    return matchesSearch && matchesClass;
  });

  const canEditVideo = (video: VideoItem) => {
    return isAdmin || (isTeacher && video.uploaded_by === profile?.id);
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
              <Video className="w-8 h-8 mr-3 text-riverside-blue-600" />
              Video Management
            </h2>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage all educational videos' : 'Manage your class videos'}
            </p>
          </div>
          {(isAdmin || isTeacher) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-riverside-blue-600 to-riverside-purple-600 text-white px-6 py-3 rounded-lg hover:from-riverside-blue-700 hover:to-riverside-purple-700 transition-all duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Video
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
                placeholder="Search videos..."
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
              <option value="all">All Classes</option>
              {classLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="relative">
              {getYouTubeThumbnail(video.url) ? (
                <img
                  src={getYouTubeThumbnail(video.url)!}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-riverside-blue-100 to-riverside-purple-100 flex items-center justify-center">
                  <Video className="w-16 h-16 text-riverside-blue-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                >
                  <Play className="w-12 h-12 text-white" />
                </a>
              </div>
              <div className="absolute top-2 right-2">
                <span className="bg-riverside-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {video.class_level}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {video.uploaded_by_name}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(video.created_at).toLocaleDateString()}
                </div>
              </div>
              
              {canEditVideo(video) && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(video)}
                    className="flex-1 bg-riverside-blue-50 text-riverside-blue-600 py-2 px-3 rounded-lg hover:bg-riverside-blue-100 transition-colors flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-500">
            {searchTerm || classFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first video'
            }
          </p>
        </div>
      )}

      {/* Create Video Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Video</h3>
            <form onSubmit={handleCreateVideo} className="space-y-4">
              <input
                type="text"
                placeholder="Video Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                required
              />
              <textarea
                placeholder="Video Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500 h-24 resize-none"
                required
              />
              <input
                type="url"
                placeholder="Video URL (YouTube, etc.)"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                required
              />
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({...formData, class_level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                required
              >
                <option value="">Select Class Level</option>
                {classLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-riverside-blue-600 text-white py-2 rounded-lg hover:bg-riverside-blue-700 transition-colors"
                >
                  Add Video
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

      {/* Edit Video Modal */}
      {showEditModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Video</h3>
            <form onSubmit={handleEditVideo} className="space-y-4">
              <input
                type="text"
                placeholder="Video Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                required
              />
              <textarea
                placeholder="Video Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500 h-24 resize-none"
                required
              />
              <input
                type="url"
                placeholder="Video URL (YouTube, etc.)"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                required
              />
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({...formData, class_level: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                required
              >
                <option value="">Select Class Level</option>
                {classLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-riverside-blue-600 text-white py-2 rounded-lg hover:bg-riverside-blue-700 transition-colors"
                >
                  Update Video
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

export default VideoManagement;