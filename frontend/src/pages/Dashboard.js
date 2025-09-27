import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Target, Calendar, TrendingUp, BookOpen, Plus, Clock, ArrowRight, Zap, Star, Award, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    tasks: { total: 12, completed: 8, pending: 4 },
    goals: { total: 5, completed: 2 }
  });
  const [recentTasks] = useState([
    { _id: '1', title: 'Complete project proposal', dueDate: new Date(), status: 'in-progress', priority: 'high' },
    { _id: '2', title: 'Review team feedback', dueDate: new Date(), status: 'pending', priority: 'medium' },
    { _id: '3', title: 'Update documentation', dueDate: new Date(), status: 'completed', priority: 'low' }
  ]);

  const quickActions = [
    { 
      title: 'Add New Task', 
      icon: <CheckSquare className="w-6 h-6" />, 
      link: '/tasks', 
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Create a new task',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=200&fit=crop&crop=center'
    },
    { 
      title: 'Set New Goal', 
      icon: <Target className="w-6 h-6" />, 
      link: '/goals', 
      color: 'bg-green-50 text-green-600 border-green-100',
      description: 'Define your milestone',
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=200&fit=crop&crop=center'
    },
    { 
      title: 'View Calendar', 
      icon: <Calendar className="w-6 h-6" />, 
      link: '/calendar', 
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      description: 'Check your schedule',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center'
    },
    { 
      title: 'View Progress', 
      icon: <TrendingUp className="w-6 h-6" />, 
      link: '/progress', 
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      description: 'Track your analytics',
      image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=300&h=200&fit=crop&crop=center'
    },
    { 
      title: 'Write Journal', 
      icon: <BookOpen className="w-6 h-6" />, 
      link: '/diary', 
      color: 'bg-pink-50 text-pink-600 border-pink-100',
      description: 'Capture your thoughts',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop&crop=center'
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
      value: `${Math.round((stats.tasks.completed / stats.tasks.total) * 100)}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      change: '+15%',
      changeColor: 'text-green-600',
      bgGradient: 'from-orange-100 to-orange-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section with Image */}
        <div className="mb-10">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Good morning, {user?.name}! 👋
              </h1>
              <p className="text-lg text-gray-600 mb-4">
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
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop&crop=center" 
                  alt="Productivity"
                  className="w-full h-48 object-cover rounded-3xl shadow-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
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
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions with Images */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group block p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={action.image} 
                          alt={action.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-100 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recent Tasks</h2>
                <Link
                  to="/tasks"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium group"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentTasks.map((task, index) => (
                  <div
                    key={task._id}
                    className="group flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                      } group-hover:scale-125 transition-transform duration-300`}></div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {task.status === 'completed' && (
                        <Star className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {recentTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="relative mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop&crop=center" 
                      alt="No tasks"
                      className="w-32 h-24 object-cover rounded-2xl mx-auto opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckSquare className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks yet!</h3>
                  <p className="text-gray-600 mb-6">Create your first task to get started on your productivity journey.</p>
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
        <div className="mt-10">
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
                  className="w-full h-32 object-cover rounded-2xl opacity-80"
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