import React, { useState, useEffect } from 'react';
import { assignmentsAPI, submissionsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'cbt';
  class_level: string;
  created_by: string;
  created_by_name: string;
  due_date: string | null;
  file_url: string | null;
  questions: any[] | null;
  created_at: string;
}

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
  points: number;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  file_url: string | null;
  answers: any[] | null;
  score: number | null;
  submitted_at: string;
  graded_at: string | null;
  graded_by: string | null;
  graded_by_name: string | null;
  assignment_title: string;
  assignment_type: string;
}

const AssignmentManagement: React.FC = () => {
  const { isAdmin, isTeacher, isStudent, profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTakeAssignmentModal, setShowTakeAssignmentModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Submission[]>([]);
  
  // Student assignment taking state
  const [studentAnswers, setStudentAnswers] = useState<number[]>([]);
  const [submissionFile, setSubmissionFile] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf' as 'pdf' | 'cbt',
    class_level: '',
    due_date: '',
    file_url: '',
    questions: [] as Question[]
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    points: 1
  });

  const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];

  useEffect(() => {
    fetchAssignments();
    if (isStudent) {
      fetchSubmissions();
    }
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await assignmentsAPI.getAll();
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await submissionsAPI.getAll();
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchAssignmentSubmissions = async (assignmentId: string) => {
    try {
      const response = await submissionsAPI.getByAssignment(assignmentId);
      setAssignmentSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assignmentData = {
        ...formData,
        questions: formData.type === 'cbt' ? formData.questions : null
      };
      
      await assignmentsAPI.create(assignmentData);
      setShowCreateModal(false);
      resetForm();
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment. Please try again.');
    }
  };

  const handleEditAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    
    try {
      const assignmentData = {
        ...formData,
        questions: formData.type === 'cbt' ? formData.questions : null
      };
      
      await assignmentsAPI.update(selectedAssignment.id, assignmentData);
      setShowEditModal(false);
      setSelectedAssignment(null);
      resetForm();
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Error updating assignment. Please try again.');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentsAPI.delete(assignmentId);
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      const submissionData: any = {
        assignment_id: selectedAssignment.id
      };

      if (selectedAssignment.type === 'pdf') {
        if (!submissionFile.trim()) {
          alert('Please provide a file URL for your submission');
          return;
        }
        submissionData.file_url = submissionFile;
      } else if (selectedAssignment.type === 'cbt') {
        if (studentAnswers.length !== selectedAssignment.questions?.length) {
          alert('Please answer all questions before submitting');
          return;
        }
        submissionData.answers = studentAnswers;
      }

      await submissionsAPI.create(submissionData);
      setShowTakeAssignmentModal(false);
      setSelectedAssignment(null);
      setStudentAnswers([]);
      setSubmissionFile('');
      setCurrentQuestionIndex(0);
      fetchSubmissions();
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    }
  };

  const handleGradeSubmission = async (submissionId: string, score: number) => {
    try {
      await submissionsAPI.update(submissionId, { score, approved: true });
      fetchAssignmentSubmissions(selectedAssignment!.id);
      alert('Submission graded successfully!');
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Error grading submission. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'pdf',
      class_level: '',
      due_date: '',
      file_url: '',
      questions: []
    });
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      points: 1
    });
  };

  const openEditModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      class_level: assignment.class_level,
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : '',
      file_url: assignment.file_url || '',
      questions: assignment.questions || []
    });
    setShowEditModal(true);
  };

  const openTakeAssignmentModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setStudentAnswers(new Array(assignment.questions?.length || 0).fill(-1));
    setSubmissionFile('');
    setCurrentQuestionIndex(0);
    setShowTakeAssignmentModal(true);
  };

  const openSubmissionsModal = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    await fetchAssignmentSubmissions(assignment.id);
    setShowSubmissionsModal(true);
  };

  const openSubmissionDetailModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionDetailModal(true);
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())) {
      alert('Please fill in all question fields');
      return;
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion }]
    });

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      points: 1
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleStudentAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...studentAnswers];
    newAnswers[questionIndex] = answerIndex;
    setStudentAnswers(newAnswers);
  };

  const getSubmissionStatus = (assignmentId: string) => {
    const submission = submissions.find(s => s.assignment_id === assignmentId);
    if (!submission) return 'not_submitted';
    if (submission.score !== null) return 'graded';
    return 'submitted';
  };

  const getSubmissionScore = (assignmentId: string) => {
    const submission = submissions.find(s => s.assignment_id === assignmentId);
    return submission?.score || 0;
  };

  const calculateCBTScore = (submission: Submission, assignment: Assignment) => {
    if (!submission.answers || !assignment.questions) return 0;
    
    let totalScore = 0;
    let maxScore = 0;
    
    assignment.questions.forEach((question, index) => {
      maxScore += question.points;
      if (submission.answers && submission.answers[index] === question.correct_answer) {
        totalScore += question.points;
      }
    });
    
    return { totalScore, maxScore };
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || assignment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const canEditAssignment = (assignment: Assignment) => {
    return isAdmin || (isTeacher && assignment.created_by === profile?.id);
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
              <BookOpen className="w-8 h-8 mr-3 text-riverside-blue-600" />
              Assignment Management
            </h2>
            <p className="text-gray-600 mt-1">
              {isStudent ? 'View and complete your assignments' : 'Create and manage assignments for your students'}
            </p>
          </div>
          {(isAdmin || isTeacher) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-riverside-blue-600 to-riverside-purple-600 text-white px-6 py-3 rounded-lg hover:from-riverside-blue-700 hover:to-riverside-purple-700 transition-all duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Assignment
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
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-riverside-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF Assignments</option>
              <option value="cbt">CBT Tests</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => {
          const submissionStatus = isStudent ? getSubmissionStatus(assignment.id) : null;
          const submissionScore = isStudent ? getSubmissionScore(assignment.id) : null;
          
          return (
            <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{assignment.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{assignment.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      assignment.type === 'pdf' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {assignment.type.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-riverside-blue-100 text-riverside-blue-800 rounded-full">
                      {assignment.class_level}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    <span>{assignment.created_by_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
                  </div>
                  {assignment.due_date && (
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {assignment.type === 'cbt' && assignment.questions && (
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      <span>{assignment.questions.length} questions</span>
                    </div>
                  )}
                </div>

                {/* Student Status */}
                {isStudent && (
                  <div className="mb-4">
                    {submissionStatus === 'not_submitted' && (
                      <div className="flex items-center text-orange-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span>Not submitted</span>
                      </div>
                    )}
                    {submissionStatus === 'submitted' && (
                      <div className="flex items-center text-blue-600 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Submitted - Awaiting grade</span>
                      </div>
                    )}
                    {submissionStatus === 'graded' && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>Graded - Score: {submissionScore}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {isStudent && submissionStatus === 'not_submitted' && (
                    <button
                      onClick={() => openTakeAssignmentModal(assignment)}
                      className="flex-1 bg-riverside-blue-600 text-white py-2 px-3 rounded-lg hover:bg-riverside-blue-700 transition-colors flex items-center justify-center text-sm"
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Take Assignment
                    </button>
                  )}
                  
                  {(isAdmin || isTeacher) && (
                    <>
                      <button
                        onClick={() => openSubmissionsModal(assignment)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Submissions
                      </button>
                      
                      {canEditAssignment(assignment) && (
                        <>
                          <button
                            onClick={() => openEditModal(assignment)}
                            className="bg-riverside-blue-50 text-riverside-blue-600 py-2 px-3 rounded-lg hover:bg-riverside-blue-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : isStudent 
                ? 'No assignments have been posted for your class yet'
                : 'Start by creating your first assignment'
            }
          </p>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">Create New Assignment</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <input
                  type="text"
                  placeholder="Assignment Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  required
                />
                
                <textarea
                  placeholder="Assignment Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500 h-24 resize-none"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'pdf' | 'cbt'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  >
                    <option value="pdf">PDF Assignment</option>
                    <option value="cbt">CBT Test</option>
                  </select>

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
                </div>

                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                />

                {formData.type === 'pdf' && (
                  <input
                    type="url"
                    placeholder="Assignment File URL (optional)"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  />
                )}

                {formData.type === 'cbt' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Add Questions</h4>
                    
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <input
                        type="text"
                        placeholder="Question"
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                      />
                      
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="correct_answer"
                            checked={currentQuestion.correct_answer === index}
                            onChange={() => setCurrentQuestion({...currentQuestion, correct_answer: index})}
                            className="text-riverside-blue-600"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[index] = e.target.value;
                              setCurrentQuestion({...currentQuestion, options: newOptions});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                          />
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Points:</label>
                        <input
                          type="number"
                          min="1"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value)})}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </button>
                    </div>

                    {formData.questions.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">Questions Added:</h5>
                        {formData.questions.map((q, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">Question {index + 1} ({q.points} points)</p>
                              <p className="text-sm text-gray-600">{q.question}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-riverside-blue-600 text-white py-3 rounded-lg hover:bg-riverside-blue-700 transition-colors font-medium"
                  >
                    Create Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">Edit Assignment</h3>
              <form onSubmit={handleEditAssignment} className="space-y-4">
                <input
                  type="text"
                  placeholder="Assignment Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  required
                />
                
                <textarea
                  placeholder="Assignment Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500 h-24 resize-none"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'pdf' | 'cbt'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  >
                    <option value="pdf">PDF Assignment</option>
                    <option value="cbt">CBT Test</option>
                  </select>

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
                </div>

                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                />

                {formData.type === 'pdf' && (
                  <input
                    type="url"
                    placeholder="Assignment File URL (optional)"
                    value={formData.file_url}
                    onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                  />
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-riverside-blue-600 text-white py-3 rounded-lg hover:bg-riverside-blue-700 transition-colors font-medium"
                  >
                    Update Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Take Assignment Modal (Student) */}
      {showTakeAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">{selectedAssignment.title}</h3>
              <p className="text-gray-600 mb-6">{selectedAssignment.description}</p>

              {selectedAssignment.type === 'pdf' && (
                <div className="space-y-4">
                  {selectedAssignment.file_url && (
                    <div className="mb-4">
                      <a
                        href={selectedAssignment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-riverside-blue-600 hover:text-riverside-blue-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Assignment File
                      </a>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submit your work (File URL)
                    </label>
                    <input
                      type="url"
                      placeholder="Paste your file URL here (Google Drive, Dropbox, etc.)"
                      value={submissionFile}
                      onChange={(e) => setSubmissionFile(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload your file to Google Drive or Dropbox and paste the shareable link here
                    </p>
                  </div>
                </div>
              )}

              {selectedAssignment.type === 'cbt' && selectedAssignment.questions && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Question {currentQuestionIndex + 1} of {selectedAssignment.questions.length}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-riverside-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / selectedAssignment.questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">
                      {selectedAssignment.questions[currentQuestionIndex].question}
                    </h4>
                    
                    <div className="space-y-2">
                      {selectedAssignment.questions[currentQuestionIndex].options.map((option: string, optionIndex: number) => (
                        <label key={optionIndex} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            checked={studentAnswers[currentQuestionIndex] === optionIndex}
                            onChange={() => handleStudentAnswerChange(currentQuestionIndex, optionIndex)}
                            className="text-riverside-blue-600"
                          />
                          <span className="flex-1">{String.fromCharCode(65 + optionIndex)}. {option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {currentQuestionIndex < selectedAssignment.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="px-4 py-2 bg-riverside-blue-600 text-white rounded-lg hover:bg-riverside-blue-700 transition-colors"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitAssignment}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Submit Test
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedAssignment.type === 'pdf' && (
                <div className="flex space-x-3 pt-6">
                  <button
                    onClick={handleSubmitAssignment}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Submit Assignment
                  </button>
                  <button
                    onClick={() => setShowTakeAssignmentModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {selectedAssignment.type === 'cbt' && currentQuestionIndex === 0 && (
                <div className="flex justify-end pt-6">
                  <button
                    onClick={() => setShowTakeAssignmentModal(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal (Teacher/Admin) */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">Submissions for: {selectedAssignment.title}</h3>
              
              {assignmentSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignmentSubmissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{submission.student_name}</h4>
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                          {submission.graded_at && (
                            <p className="text-sm text-green-600">
                              Graded: {new Date(submission.graded_at).toLocaleString()} by {submission.graded_by_name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {submission.score !== null && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Score: {submission.score}
                            </span>
                          )}
                          <button
                            onClick={() => openSubmissionDetailModal(submission)}
                            className="bg-riverside-blue-600 text-white px-4 py-2 rounded-lg hover:bg-riverside-blue-700 transition-colors text-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setShowSubmissionsModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Detail Modal (Teacher/Admin) */}
      {showSubmissionDetailModal && selectedSubmission && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">
                Submission by {selectedSubmission.student_name}
              </h3>
              
              {selectedAssignment.type === 'pdf' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Submitted File:</h4>
                    {selectedSubmission.file_url ? (
                      <a
                        href={selectedSubmission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-riverside-blue-600 hover:text-riverside-blue-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        View Submitted File
                      </a>
                    ) : (
                      <p className="text-gray-500">No file submitted</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Grade this submission:</h4>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Score"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const score = parseInt((e.target as HTMLInputElement).value);
                            if (score >= 0) {
                              handleGradeSubmission(selectedSubmission.id, score);
                              setShowSubmissionDetailModal(false);
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                          const score = parseInt(input.value);
                          if (score >= 0) {
                            handleGradeSubmission(selectedSubmission.id, score);
                            setShowSubmissionDetailModal(false);
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Grade
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedAssignment.type === 'cbt' && selectedSubmission.answers && selectedAssignment.questions && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {(() => {
                      const scoreResult = calculateCBTScore(selectedSubmission, selectedAssignment);
                      if (typeof scoreResult === 'number') return null;
                      const { totalScore, maxScore } = scoreResult;
                      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
                      return (
                        <div className="text-center">
                          <h4 className="text-lg font-semibold mb-2">Test Results</h4>
                          <div className="text-3xl font-bold text-riverside-blue-600 mb-2">
                            {totalScore}/{maxScore}
                          </div>
                          <div className="text-lg text-gray-600">
                            {percentage}% - {
                              percentage >= 80 ? 'Excellent' :
                              percentage >= 70 ? 'Good' :
                              percentage >= 60 ? 'Fair' :
                              'Needs Improvement'
                            }
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Answer Review:</h4>
                    {selectedAssignment.questions.map((question, index) => {
                      const studentAnswer = selectedSubmission.answers ? selectedSubmission.answers[index] : -1;
                      const isCorrect = studentAnswer === question.correct_answer;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-medium">Question {index + 1} ({question.points} points)</h5>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          
                          <p className="text-gray-900 mb-3">{question.question}</p>
                          
                          <div className="space-y-2">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div key={optionIndex} className={`p-2 rounded border ${
                                optionIndex === question.correct_answer ? 'bg-green-50 border-green-200' :
                                optionIndex === studentAnswer ? 'bg-red-50 border-red-200' :
                                'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center space-x-2">
                                  {optionIndex === studentAnswer && (
                                    <span className="text-blue-600 font-medium">Student:</span>
                                  )}
                                  {optionIndex === question.correct_answer && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Override Grade (Optional):</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Auto-calculated score: <span className="font-semibold">{(() => {
                        const scoreResult = calculateCBTScore(selectedSubmission, selectedAssignment);
                        if (typeof scoreResult === 'number') return '0/0';
                        const { totalScore, maxScore } = scoreResult;
                        return `${totalScore}/${maxScore}`;
                      })()}</span>
                      {selectedSubmission.score !== null && selectedSubmission.score !== (() => {
                        const scoreResult = calculateCBTScore(selectedSubmission, selectedAssignment);
                        if (typeof scoreResult === 'number') return 0;
                        const { totalScore } = scoreResult;
                        return totalScore;
                      })() && (
                        <span className="ml-2 text-orange-600">
                          (Overridden to: {selectedSubmission.score})
                        </span>
                      )}
                    </p>
                    <div className="flex items-center space-x-3">
                      {/* Approve Auto-Calculated Score Button */}
                      {selectedSubmission.score === null && (
                        <button
                          onClick={() => {
                            const scoreResult = calculateCBTScore(selectedSubmission, selectedAssignment);
                            if (typeof scoreResult === 'number') return;
                            const { totalScore } = scoreResult;
                            handleGradeSubmission(selectedSubmission.id, totalScore);
                            setShowSubmissionDetailModal(false);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Auto Score
                        </button>
                      )}
                      
                      {/* Override Score Input */}
                      <input
                        type="number"
                        min="0"
                        placeholder={selectedSubmission.score !== null ? `Current: ${selectedSubmission.score}` : "Override score"}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-riverside-blue-500"
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="score"]') as HTMLInputElement;
                          const score = parseInt(input.value);
                          if (score >= 0) {
                            handleGradeSubmission(selectedSubmission.id, score);
                            setShowSubmissionDetailModal(false);
                          }
                        }}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        {selectedSubmission.score !== null ? 'Update Grade' : 'Override Grade'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedSubmission.score !== null 
                        ? 'Enter a new score to update the current grade'
                        : 'Use "Approve Auto Score" to accept the calculated score, or enter a custom score to override'
                      }
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setShowSubmissionDetailModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;