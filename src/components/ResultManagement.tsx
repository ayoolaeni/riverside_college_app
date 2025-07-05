import React, { useState, useEffect } from 'react';
import { resultsAPI, usersAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Award,
  TrendingUp,
  User,
  Calendar
} from 'lucide-react';

interface Result {
  id: string;
  student_id: string;
  student_name: string;
  class_level: string;
  subject: string;
  score: number;
  total_score: number;
  file_url: string | null;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  class_level: string;
}

const ResultManagement: React.FC = () => {
  const { isAdmin, isTeacher, isStudent, profile } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    class_level: '',
    subject: '',
    score: '',
    total_score: '',
    file_url: ''
  });

  const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];
  const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Economics', 'Government', 'Literature'];

  useEffect(() => {
    fetchResults();
    if (isAdmin || isTeacher) {
      fetchStudents();
    }
  }, []);

  const fetchResults = async () => {
    try {
      const response = await resultsAPI.getAll();
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await usersAPI.getAll();
      let studentUsers = response.data.filter((user: any) => user.role === 'student');
      
      // If user is a teacher, filter students by their class level
      if (isTeacher && profile?.class_level) {
        studentUsers = studentUsers.filter((user: any) => user.class_level === profile.class_level);
      }
      
      setStudents(studentUsers);
    } catch (error) {
      // Error fetching students - could show user notification
    }
  };

  const handleStudentChange = (studentId: string) => {
    // Update form data with selected student
    setFormData({
      ...formData,
      student_id: studentId,
      // Keep class_level as is - it will be selected separately
    });
  };

  // New handler for class level change
  const handleClassLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      class_level: e.target.value
    }));
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.student_id || !formData.class_level || !formData.subject || !formData.score || !formData.total_score) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.score) > parseInt(formData.total_score)) {
      alert('Score cannot be greater than total score');
      return;
    }

    try {
      const resultData = {
        student_id: formData.student_id,
        class_level: formData.class_level,
        subject: formData.subject,
        score: parseInt(formData.score),
        total_score: parseInt(formData.total_score),
        file_url: formData.file_url || null
      };
      
      await resultsAPI.create(resultData);
      setShowCreateModal(false);
      setFormData({
        student_id: '',
        class_level: '',
        subject: '',
        score: '',
        total_score: '',
        file_url: ''
      });
      fetchResults();
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.error || (error as any)?.message || 'Unknown error occurred';
      const errorDetails = (error as any)?.response?.data?.details || '';
      alert(`Error creating result: ${errorMessage}${errorDetails ? '\nDetails: ' + errorDetails : ''}`);
    }
  };

  const handleEditResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResult) return;
    
    try {
      await resultsAPI.update(selectedResult.id, {
        ...formData,
        score: parseInt(formData.score),
        total_score: parseInt(formData.total_score)
      });
      setShowEditModal(false);
      setSelectedResult(null);
      fetchResults();
    } catch (error) {
      console.error('Error updating result:', error);
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await resultsAPI.delete(resultId);
        fetchResults();
      } catch (error) {
        console.error('Error deleting result:', error);
      }
    }
  };

  const openEditModal = (result: Result) => {
    setSelectedResult(result);
    setFormData({
      student_id: result.student_id,
      class_level: result.class_level,
      subject: result.subject,
      score: result.score.toString(),
      total_score: result.total_score.toString(),
      file_url: result.file_url || ''
    });
    setShowEditModal(true);
  };

  const getPercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-blue-600 bg-blue-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || result.class_level === classFilter;
    const matchesSubject = subjectFilter === 'all' || result.subject === subjectFilter;
    return matchesSearch && matchesClass && matchesSubject;
  });

  const canEditResult = (result: Result) => {
    return isAdmin || (isTeacher && result.uploaded_by === profile?.id);
  };

  const getUniqueSubjects = () => {
    const uniqueSubjects = [...new Set(results.map(result => result.subject))];
    return uniqueSubjects.sort();
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
              <BarChart3 className="w-8 h-8 mr-3 text-riverside-blue-600" />
              Result Management
            </h2>
            <p className="text-gray-600 mt-1">
              {isStudent ? 'View your academic results' : 'Manage student results and performance'}
            </p>
          </div>
          {(isAdmin || isTeacher) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-riverside-blue-600 to-riverside-purple-600 text-white px-6 py-3 rounded-lg hover:from-riverside-blue-700 hover:to-riverside-purple-700 transition-all duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Result
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {!isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-riverside-blue-600">{results.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-riverside-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {results.length > 0 
                    ? Math.round(results.reduce((acc, result) => acc + getPercentage(result.score, result.total_score), 0) / results.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Performers</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {results.filter(result => getPercentage(result.score, result.total_score) >= 80).length}
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-purple-600">{getUniqueSubjects().length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by student name or subject..."
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
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-riverside-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {getUniqueSubjects().map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                {(isAdmin || isTeacher) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => {
                const percentage = getPercentage(result.score, result.total_score);
                const grade = getGrade(percentage);
                const gradeColor = getGradeColor(percentage);
                
                return (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{result.student_name}</div>
                        <div className="text-sm text-gray-500">{result.class_level}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{result.subject}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {result.score}/{result.total_score}
                        </div>
                        <div className="text-sm text-gray-500">{percentage}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${gradeColor}`}>
                        {grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{result.uploaded_by_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(result.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    {(isAdmin || isTeacher) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {canEditResult(result) && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(result)}
                              className="text-riverside-blue-600 hover:text-riverside-blue-900 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResult(result.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">
            {searchTerm || classFilter !== 'all' || subjectFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding student results'
            }
          </p>
        </div>
      )}

      {/* Create Result Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Result</h3>
            <form onSubmit={handleCreateResult} className="space-y-4">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.class_level})
                    </option>
                  ))}
                </select>
                {isTeacher && students.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No students found in your class ({profile?.class_level})</p>
                )}
              </div>
              
              {/* Class Level Selection - Now a dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Level</label>
                <select
                  value={formData.class_level}
                  onChange={handleClassLevelChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  required
                >
                  <option value="">Select Class Level</option>
                  {classLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              {/* Score Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                  <input
                    type="number"
                    placeholder="Score"
                    value={formData.score}
                    onChange={(e) => setFormData({...formData, score: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Score</label>
                  <input
                    type="number"
                    placeholder="Total Score"
                    value={formData.total_score}
                    onChange={(e) => setFormData({...formData, total_score: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                    required
                    min="1"
                  />
                </div>
              </div>
              
              {/* File URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File URL (Optional)</label>
                <input
                  type="url"
                  placeholder="File URL (optional)"
                  value={formData.file_url}
                  onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-riverside-blue-600 text-white py-2 rounded-lg hover:bg-riverside-blue-700 transition-colors"
                >
                  Add Result
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

      {/* Edit Result Modal */}
      {showEditModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Result</h3>
            <form onSubmit={handleEditResult} className="space-y-4">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.class_level})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Class Level Selection - Now a dropdown in Edit Modal too */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Level</label>
                <select
                  value={formData.class_level}
                  onChange={handleClassLevelChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  required
                >
                  <option value="">Select Class Level</option>
                  {classLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              {/* Score Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                  <input
                    type="number"
                    placeholder="Score"
                    value={formData.score}
                    onChange={(e) => setFormData({...formData, score: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Score</label>
                  <input
                    type="number"
                    placeholder="Total Score"
                    value={formData.total_score}
                    onChange={(e) => setFormData({...formData, total_score: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                    required
                    min="1"
                  />
                </div>
              </div>
              
              {/* File URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File URL (Optional)</label>
                <input
                  type="url"
                  placeholder="File URL (optional)"
                  value={formData.file_url}
                  onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-riverside-blue-600 text-white py-2 rounded-lg hover:bg-riverside-blue-700 transition-colors"
                >
                  Update Result
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

export default ResultManagement;