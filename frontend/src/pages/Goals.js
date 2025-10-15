import React, { useState, useEffect } from 'react';
import { goalsAPI } from '../utils/api';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const Goals = () => {
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const goalsPerPage = 6;
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    sortBy: 'deadline'
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    progress: 0,
    type: 'short-term'
  });

  useEffect(() => {
    fetchGoals();
  }, [currentPage, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);



  const fetchGoals = async () => {
    try {
      const response = await goalsAPI.getAll({ ...filters, page: currentPage, limit: goalsPerPage });
      
      if (response.data.goals) {
        setGoals(response.data.goals);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setGoals(response.data);
        setTotalPages(Math.ceil(response.data.length / goalsPerPage));
      }
    } catch (error) {
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalsAPI.update(editingGoal._id, formData);
        toast.success('Goal updated successfully');
      } else {
        await goalsAPI.create(formData);
        toast.success('Goal created successfully');
      }
      setShowModal(false);
      setEditingGoal(null);
      setFormData({ title: '', description: '', deadline: '', progress: 0, type: 'short-term' });
      fetchGoals();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline.split('T')[0],
      progress: goal.progress,
      type: goal.type || 'short-term'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsAPI.delete(id);
        toast.success('Goal deleted successfully');
        fetchGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  const handleProgressUpdate = async (id, progress) => {
    try {
      const completed = progress >= 100;
      await goalsAPI.update(id, { progress, completed });
      toast.success('Progress updated');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-4 mb-4 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-3 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-bold text-primary-700 dark:text-primary-300">Filters:</span>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-medium"
            >
              <option value="">All Types</option>
              <option value="short-term">Short Term</option>
              <option value="long-term">Long Term</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-medium"
            >
              <option value="">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-medium"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="progress">Sort by Progress</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[280px]" style={{marginTop: '2rem'}}>
          {goals.length > 0 ? (
            goals.map((goal) => (
              <div key={goal._id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 p-4 mt-2 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-600">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Target className="w-6 h-6 text-primary-600 mr-3 animate-pulse" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">{goal.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{goal.description}</p>
                )}

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="mr-2">📊</span>Progress
                    </span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => handleProgressUpdate(goal._id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm mb-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <span className="mr-2">📅</span>
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm transform hover:scale-105 transition-transform duration-200 ${
                    goal.type === 'long-term' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {goal.type === 'long-term' ? 'LONG TERM' : 'SHORT TERM'}
                  </span>
                </div>
                <div className="text-center mt-4">
                  {goal.completed ? (
                    <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      ✅ COMPLETED!
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      🎯 IN PROGRESS
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {goals.length === 0 ? 'No goals yet. Set your first goal!' : 'No goals match your filters.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages} ({goals.length} goals)
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          >
            Next
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Goal Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="short-term">Short Term Goal</option>
                    <option value="long-term">Long Term Goal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingGoal(null);
                      setFormData({ title: '', description: '', deadline: '', progress: 0, type: 'short-term' });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingGoal ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;