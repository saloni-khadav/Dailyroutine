import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, goalsAPI } from '../utils/api';
import { CheckSquare, Target, Calendar, TrendingUp, BookOpen, Plus, Clock, ArrowRight, Zap, Star, Award, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import clndr from '../images/clndr.png';
import t1 from '../images/t1.png';
import goal from '../images/goal.png';
import d2 from '../images/d2.png';
import p1 from '../images/p1.png';
import t from '../images/t.png';
import img from '../images/img.png';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0 },
    goals: { total: 0, completed: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const checkTaskTimes = async () => {
    if (!user?.preferences?.notifications) return;
    
    try {
      const tasksRes = await tasksAPI.getAll({ page: 1, limit: 1000 });
      const tasks = tasksRes.data?.tasks || [];
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.status === 'completed') return;
        
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        
        // Task starting (due date reached)
        if (Math.abs(timeDiff) < 60000 && timeDiff <= 0) { // Within 1 minute of due time
          toast.success(`🚀 Task "${task.title}" is starting now!`, {
            duration: 4000
          });
        }
        
        // Task ending (1 hour after due date)
        const endTime = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour after due
        const endTimeDiff = endTime.getTime() - now.getTime();
        
        if (Math.abs(endTimeDiff) < 60000 && endTimeDiff <= 0) { // Within 1 minute of end time
          toast((t) => (
            <div className="flex flex-col space-y-2">
              <span>⏰ Task "{task.title}" time is up!</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    handleTaskStatusUpdate(task._id, 'completed');
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  Complete
                </button>
                <button
                  onClick={() => {
                    handleTaskStatusUpdate(task._id, 'in-progress');
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                >
                  In Progress
                </button>
                <button
                  onClick={() => {
                    handleTaskStatusUpdate(task._id, 'pending');
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Pending
                </button>
              </div>
            </div>
          ), {
            duration: 10000
          });
        }
      });
    } catch (error) {
      console.error('Failed to check task times:', error);
    }
  };
  
  const handleTaskStatusUpdate = async (taskId, status) => {
    try {
      const task = recentTasks.find(t => t._id === taskId);
      if (task) {
        await tasksAPI.update(taskId, { ...task, status });
        toast.success(`Task updated to ${status}`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Try to fetch tasks and goals, handle errors gracefully
      let tasks = [];
      let goals = [];
      
      try {
        const tasksRes = await tasksAPI.getAll({ page: 1, limit: 1000 });
        tasks = tasksRes.data?.tasks || [];
        console.log('Tasks fetched:', tasks.length);
      } catch (taskError) {
        console.error('Failed to fetch tasks:', taskError);
      }
      
      try {
        const goalsRes = await goalsAPI.getAll({ page: 1, limit: 1000 });
        goals = goalsRes.data?.goals || [];
        console.log('Goals fetched:', goals.length);
      } catch (goalError) {
        console.error('Failed to fetch goals:', goalError);
      }
      
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const completedGoals = goals.filter(goal => goal.completed).length;
      
      setStats({
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          pending: tasks.length - completedTasks
        },
        goals: {
          total: goals.length,
          completed: completedGoals
        }
      });
      
      // Get recent tasks (last 5)
      const sortedTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentTasks(sortedTasks.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleDragStart = (e, task) => {
    console.log('Drag started:', task.title);
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
    
    // Get status-based border color
    let borderColor = '#dc2626'; // red for pending
    if (task.status === 'in-progress') borderColor = '#d97706'; // yellow
    if (task.status === 'completed') borderColor = '#059669'; // darker green
    
    // Check if dark theme is active
    const isDarkTheme = document.documentElement.classList.contains('dark');
    
    // Create theme-aware drag image
    const dragElement = e.target.cloneNode(true);
    dragElement.style.backgroundColor = isDarkTheme ? '#374151' : '#ffffff';
    dragElement.style.color = isDarkTheme ? '#ffffff' : '#1f2937';
    dragElement.style.border = `2px solid ${borderColor}`;
    dragElement.style.borderRadius = '12px';
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-1000px';
    dragElement.style.zIndex = '9999';
    dragElement.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    dragElement.style.opacity = '1';
    dragElement.style.transform = 'none';
    
    // Remove all styling that might hide content
    const allElements = dragElement.querySelectorAll('*');
    allElements.forEach(el => {
      el.style.textDecoration = 'none';
      el.style.opacity = '1';
      el.style.color = isDarkTheme ? '#ffffff' : '#1f2937';
    });
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, e.target.offsetWidth / 2, e.target.offsetHeight / 2);
    
    setTimeout(() => {
      if (document.body.contains(dragElement)) {
        document.body.removeChild(dragElement);
      }
    }, 0);
    
    // Fade out original element
    e.target.style.opacity = '0.3';
    e.target.style.transform = 'scale(0.95)';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    console.log('Drop event:', targetStatus);
    
    // Reset all task elements opacity
    document.querySelectorAll('[draggable="true"]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    });
    
    if (!draggedTask) {
      console.log('No dragged task');
      return;
    }

    if (draggedTask.status === targetStatus) {
      console.log('Same status, no update needed');
      setDraggedTask(null);
      return;
    }

    try {
      console.log('Updating task:', draggedTask._id, 'to status:', targetStatus);
      await tasksAPI.update(draggedTask._id, { ...draggedTask, status: targetStatus });
      toast.success(`Task moved to ${targetStatus}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update task');
    }
    setDraggedTask(null);
  };

  const handleQuickComplete = async (task) => {
    try {
      await tasksAPI.update(task._id, { ...task, status: 'completed' });
      toast.success(`Task "${task.title}" completed! 🎉`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleQuickPending = async (task) => {
    try {
      await tasksAPI.update(task._id, { ...task, status: 'pending' });
      toast.success(`Task "${task.title}" moved to pending`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };
  const [recentTasks, setRecentTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const quickActions = [
    { 
      title: 'Add New Task', 
      icon: <CheckSquare className="w-6 h-6" />, 
      link: '/tasks', 
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Create a new task',
      image: t1,
    },
    { 
      title: 'Set New Goal', 
      icon: <Target className="w-6 h-6" />, 
      link: '/goals', 
      color: 'bg-green-50 text-green-600 border-green-100',
      description: 'Define your milestone',
      image: goal,
    },
    { 
      title: 'View Calendar', 
      icon: <Calendar className="w-6 h-6" />, 
      link: '/calendar', 
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      description: 'Check your schedule',
      image: clndr,
    },
    { 
      title: 'View Progress', 
      icon: <TrendingUp className="w-6 h-6" />, 
      link: '/progress', 
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      description: 'Track your analytics',
      image: p1,
    },
    { 
      title: 'Write Journal', 
      icon: <BookOpen className="w-6 h-6" />, 
      link: '/diary', 
      color: 'bg-pink-50 text-pink-600 border-pink-100',
      description: 'Capture your thoughts',
      image: d2,
    }
  ];

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.tasks.total,
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      change: '+12%',
      changeColor: 'text-green-600',
      bgGradient: 'from-blue-100 to-blue-200'
    },
    {
      title: 'Completed Today',
      value: stats.tasks.completed,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-green-50 text-green-600 border-green-100',
      change: '+8%',
      changeColor: 'text-green-600',
      bgGradient: 'from-green-100 to-green-200'
    },
    {
      title: 'Active Goals',
      value: stats.goals.total - stats.goals.completed,
      icon: <Target className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      change: '+3%',
      changeColor: 'text-green-600',
      bgGradient: 'from-purple-100 to-purple-200'
    },
    {
      title: 'Success Rate',
      value: stats.tasks.total > 0 ? `${Math.round((stats.tasks.completed / stats.tasks.total) * 100)}%` : '0%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      change: '+15%',
      changeColor: 'text-green-600',
      bgGradient: 'from-orange-100 to-orange-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-4">
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section with Image */}
        <div className="mb-4">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Ready to make today productive? Here's your overview.
              </p>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm w-fit">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="relative">
                <img 
                  src={img}
                  alt="Productivity"
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-3xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-3xl"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">Stay focused, stay productive!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-6 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="group relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.bgGradient} rounded-full opacity-20 -translate-y-10 translate-x-10`}></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <div className={`text-sm font-semibold ${card.changeColor} bg-green-50 px-2 py-1 rounded-full`}>
                  {card.change}
                </div>
              </div>
              
              <div className="relative z-10">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions with Images */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 dark:border-gray-700 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quick Actions</h2>
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group block p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={action.image} 
                          alt={action.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors text-sm">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 dark:border-gray-700 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Tasks</h2>
                <Link
                  to="/tasks"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium group"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Pending Tasks */}
                <div 
                  className="space-y-3 p-4 rounded-2xl bg-red-50/30 dark:bg-red-900/20 border-2 border-dashed border-red-200 dark:border-red-700"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'pending')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 flex items-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Pending </span>({recentTasks.filter(task => task.status === 'pending').length})
                    </h3>
                  </div>
                  {recentTasks.filter(task => task.status === 'pending').map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'scale(1)';
                      }}
                      className="group relative flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg transition-all duration-300 cursor-move"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400 animate-pulse"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm truncate">{task.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentTasks.filter(task => task.status === 'pending').length === 0 && (
                    <div className="p-6 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drop tasks here to mark as pending</p>
                    </div>
                  )}
                </div>

                {/* In Progress Tasks */}
                <div 
                  className="space-y-3 p-4 rounded-2xl bg-yellow-50/30 dark:bg-yellow-900/20 border-2 border-dashed border-yellow-200 dark:border-yellow-700"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'in-progress')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-yellow-600 dark:text-yellow-400 flex items-center">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">In Progress </span>({recentTasks.filter(task => task.status === 'in-progress').length})
                    </h3>
                  </div>
                  {recentTasks.filter(task => task.status === 'in-progress').map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'scale(1)';
                      }}
                      className="group relative flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700 hover:shadow-lg transition-all duration-300 cursor-move"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 animate-spin"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{task.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentTasks.filter(task => task.status === 'in-progress').length === 0 && (
                    <div className="p-6 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drop tasks here to mark as in progress</p>
                    </div>
                  )}
                </div>

                {/* Completed Tasks */}
                <div 
                  className="space-y-3 p-4 rounded-2xl bg-green-50/30 dark:bg-green-900/20 border-2 border-dashed border-green-200 dark:border-green-700"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'completed')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                      <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Completed </span>({recentTasks.filter(task => task.status === 'completed').length})
                    </h3>
                  </div>
                  {recentTasks.filter(task => task.status === 'completed').map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'scale(1)';
                      }}
                      className="group relative flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg transition-all duration-300 cursor-move"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{task.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Completed: {new Date(task.updatedAt || task.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <Star className="w-4 h-4 text-yellow-500" />

                      </div>
                    </div>
                  ))}
                  {recentTasks.filter(task => task.status === 'completed').length === 0 && (
                    <div className="p-6 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drop tasks here to mark as completed</p>
                    </div>
                  )}
                </div>
              </div>

              {recentTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="relative mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop&crop=center" 
                      alt="No tasks"
                      className="w-24 h-18 sm:w-28 sm:h-20 md:w-32 md:h-24 object-cover rounded-2xl mx-auto opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckSquare className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No tasks yet!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first task to get started on your productivity journey.</p>
                  <Link
                    to="/tasks"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Task
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Motivational Section with Image */}
        <div className="mt-4">
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="grid lg:grid-cols-3 gap-8 items-center relative z-10">
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-2">
                  "The secret of getting ahead is getting started."
                </h3>
                <p className="text-blue-100 mb-4">- Mark Twain</p>
                <p className="text-blue-100">
                  Keep pushing forward! You're doing great with your productivity journey.
                </p>
              </div>
              <div className="lg:col-span-1">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop&crop=center" 
                  alt="Motivation"
                  className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-2xl opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


// https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop&crop=center" 