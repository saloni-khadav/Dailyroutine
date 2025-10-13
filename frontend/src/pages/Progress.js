import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { tasksAPI, goalsAPI } from '../utils/api';
import { TrendingUp, CheckSquare, Target, Calendar } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Progress = () => {
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0, inProgress: 0 },
    goals: { total: 0, completed: 0 },
    weeklyProgress: [],
    averageDailyTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      console.log('Fetching progress data...');
      
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

      // Calculate weekly progress (last 7 days)
      const weeklyProgress = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const dayTasks = tasks.filter(task => 
          new Date(task.createdAt).toDateString() === dateStr
        );
        const completedTasks = dayTasks.filter(task => task.status === 'completed').length;
        
        weeklyProgress.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          tasks: dayTasks.length,
          completed: completedTasks
        });
      }

      // Calculate average daily tasks based on total tasks and days since first task
      let averageDailyTasks = 0;
      if (tasks.length > 0) {
        const firstTaskDate = new Date(Math.min(...tasks.map(task => new Date(task.createdAt))));
        const today = new Date();
        const daysSinceFirstTask = Math.max(1, Math.ceil((today - firstTaskDate) / (1000 * 60 * 60 * 24)));
        averageDailyTasks = Math.round((tasks.length / daysSinceFirstTask) * 10) / 10;
      }

      // Calculate task statistics
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      
      setStats({
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks
        },
        goals: {
          total: goals.length,
          completed: goals.filter(goal => goal.completed).length
        },
        weeklyProgress,
        averageDailyTasks
      });
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [stats.tasks.completed, stats.tasks.inProgress, stats.tasks.pending],
        backgroundColor: ['#10B981', '#F59E0B', '#6B7280'],
        borderWidth: 0,
      },
    ],
  };

  const weeklyProgressData = {
    labels: stats.weeklyProgress.map(day => day.date),
    datasets: [
      {
        label: 'Tasks Created',
        data: stats.weeklyProgress.map(day => day.tasks),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Tasks Completed',
        data: stats.weeklyProgress.map(day => day.completed),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
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
        <div className="flex items-center mb-6">
          <TrendingUp className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress Tracker</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckSquare className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasks.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tasks.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.goals.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.tasks.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Progress
            </h2>
            <Bar data={weeklyProgressData} options={chartOptions} />
          </div>

          {/* Task Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Task Status Distribution
            </h2>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut data={taskStatusData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Goals Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.goals.total}</div>
              <div className="text-gray-600 dark:text-gray-400">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.goals.completed}</div>
              <div className="text-gray-600 dark:text-gray-400">Completed Goals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.goals.total > 0 ? Math.round((stats.goals.completed / stats.goals.total) * 100) : 0}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Productivity Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Most Productive Day
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                {stats.weeklyProgress.length > 0 
                  ? stats.weeklyProgress.reduce((max, day) => 
                      day.completed > max.completed ? day : max
                    ).date
                  : 'No data yet'
                }
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Average Daily Tasks
              </h3>
              <p className="text-green-700 dark:text-green-300">
                {stats.averageDailyTasks} tasks per day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;