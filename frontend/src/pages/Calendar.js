import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { tasksAPI, goalsAPI, notesAPI } from '../utils/api';
import { Calendar as CalendarIcon, CheckSquare, Target, Plus, Edit, Trash2, StickyNote, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-calendar/dist/Calendar.css';
import '../calendar-styles.css';

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedDateNotes, setSelectedDateNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteFormData, setNoteFormData] = useState({
    title: '',
    content: '',
    date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEventsByDate(date);
  }, [date, tasks, goals, notes]);

  const fetchData = async () => {
    try {
      const [tasksRes, goalsRes, notesRes] = await Promise.all([
        tasksAPI.getAll({ limit: 1000 }),
        goalsAPI.getAll({ limit: 1000 }),
        notesAPI.getAll()
      ]);
      setTasks(tasksRes.data.tasks || tasksRes.data);
      setGoals(goalsRes.data.goals || goalsRes.data);
      setNotes(notesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Calendar fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = (selectedDate) => {
    const dateStr = selectedDate.toDateString();
    
    const dayTasks = tasks.filter(task => 
      new Date(task.dueDate).toDateString() === dateStr
    );
    
    const dayGoals = goals.filter(goal => 
      new Date(goal.deadline).toDateString() === dateStr
    );

    const dayNotes = notes.filter(note => 
      new Date(note.date).toDateString() === dateStr
    );

    setSelectedDateEvents([
      ...dayTasks.map(task => ({ ...task, type: 'task' })),
      ...dayGoals.map(goal => ({ ...goal, type: 'goal' }))
    ]);
    
    setSelectedDateNotes(dayNotes);
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await notesAPI.update(editingNote._id, noteFormData);
        toast.success('Note updated successfully');
      } else {
        await notesAPI.create(noteFormData);
        toast.success('Note added successfully');
      }
      setShowNoteModal(false);
      setEditingNote(null);
      setNoteFormData({ title: '', content: '', date: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteFormData({
      title: note.title,
      content: note.content,
      date: note.date.split('T')[0]
    });
    setShowNoteModal(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.delete(noteId);
        toast.success('Note deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      const dayTasks = tasks.filter(task => 
        new Date(task.dueDate).toDateString() === dateStr
      );
      const dayGoals = goals.filter(goal => 
        new Date(goal.deadline).toDateString() === dateStr
      );
      const dayNotes = notes.filter(note => 
        new Date(note.date).toDateString() === dateStr
      );

      const totalEvents = dayTasks.length + dayGoals.length + dayNotes.length;

      if (totalEvents > 0) {
        return (
          <div className="flex justify-center space-x-1">
            {dayTasks.length > 0 && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
            {dayGoals.length > 0 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
            {dayNotes.length > 0 && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>}
          </div>
        );
      }
    }
    return null;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-lg p-8">
              <div className="w-full">
                <Calendar
                  onChange={setDate}
                  value={date}
                  tileContent={tileContent}
                  className="!w-full !max-w-none border-none calendar-large"
                />
              </div>
            </div>
          </div>

          {/* Events and Notes for Selected Date */}
          <div className="xl:col-span-1 space-y-6">
            {/* Notes Section */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <StickyNote className="w-5 h-5 mr-2 text-yellow-500" />
                  Notes for {date.toLocaleDateString()}
                </h2>
                <button
                  onClick={() => {
                    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    setNoteFormData({ 
                      title: '', 
                      content: '', 
                      date: selectedDate.toISOString().split('T')[0] 
                    });
                    setShowNoteModal(true);
                  }}
                  className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {selectedDateNotes.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateNotes.map((note) => (
                    <div key={note._id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{note.title}</h3>
                          <p className="text-gray-600 text-sm">{note.content}</p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <StickyNote className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notes for this date</p>
                </div>
              )}
            </div>

            {/* Events Section */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
                Events for {date.toLocaleDateString()}
              </h2>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={`${event.type}-${event._id}`}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start">
                        {event.type === 'task' ? (
                          <CheckSquare className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                        ) : (
                          <Target className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.type === 'task' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {event.type === 'task' ? 'Task' : 'Goal'}
                            </span>
                            {event.type === 'task' && (
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                event.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {event.priority}
                              </span>
                            )}
                            {event.type === 'goal' && (
                              <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                                {event.progress}% complete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No events scheduled for this date
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Quick Stats - Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20 -translate-y-10 translate-x-10"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border-blue-100 group-hover:scale-110 transition-transform duration-300">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +12%
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800">{tasks.length}</p>
            </div>
          </div>

          <div className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full opacity-20 -translate-y-10 translate-x-10"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-green-50 text-green-600 border-green-100 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +8%
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Goals</p>
              <p className="text-3xl font-bold text-gray-800">{goals.length}</p>
            </div>
          </div>

          <div className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full opacity-20 -translate-y-10 translate-x-10"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border-purple-100 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +15%
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-600 mb-1">Completed Tasks</p>
              <p className="text-3xl font-bold text-gray-800">{tasks.filter(task => task.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        {/* Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-2 border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {editingNote ? '📝 Edit Note' : '✨ Add New Note'}
              </h2>
              <form onSubmit={handleNoteSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={noteFormData.title}
                    onChange={(e) => setNoteFormData({ ...noteFormData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter note title..."
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Content
                  </label>
                  <textarea
                    required
                    value={noteFormData.content}
                    onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                    rows="4"
                    placeholder="Write your note content..."
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={noteFormData.date}
                    onChange={(e) => setNoteFormData({ ...noteFormData, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex justify-center space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNoteModal(false);
                      setEditingNote(null);
                      setNoteFormData({ title: '', content: '', date: '' });
                    }}
                    className="px-8 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                  >
                    {editingNote ? 'Update Note' : 'Save Note'}
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

export default CalendarPage;