import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usersAPI, tasksAPI, goalsAPI, diaryAPI } from '../utils/api';
import { Settings as SettingsIcon, Moon, Sun, Bell, BellOff, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications ?? true
  });

  const handleNotificationToggle = async () => {
    setLoading(true);
    const newNotificationSetting = !preferences.notifications;
    
    try {
      const response = await usersAPI.updatePreferences({
        theme: user?.preferences?.theme || 'light',
        notifications: newNotificationSetting
      });
      
      setPreferences({ notifications: newNotificationSetting });
      updateUser(response.data.user);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <SettingsIcon className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        {/* First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {theme === 'light' ? (
                    <Sun className="w-5 h-5 text-yellow-500 mr-3" />
                  ) : (
                    <Moon className="w-5 h-5 text-blue-500 mr-3" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose between light and dark mode</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {preferences.notifications ? (
                    <Bell className="w-5 h-5 text-green-500 mr-3" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500 mr-3" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications for tasks and reminders</p>
                  </div>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  disabled={loading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                    preferences.notifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data & Privacy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data & Privacy</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Export Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Download a copy of your data</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      toast.loading('Generating PDF...');
                      
                      const [tasksRes, goalsRes, diaryRes] = await Promise.all([
                        tasksAPI.getAll({ page: 1, limit: 1000 }),
                        goalsAPI.getAll({ page: 1, limit: 1000 }),
                        diaryAPI.getAll({ page: 1, limit: 1000 })
                      ]);
                      
                      const tasks = tasksRes.data?.tasks || tasksRes.data || [];
                      const goals = goalsRes.data?.goals || goalsRes.data || [];
                      const diary = diaryRes.data?.entries || diaryRes.data || [];
                      
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Routine Master - Data Export</title>
                            <style>
                              body { font-family: Arial, sans-serif; margin: 20px; }
                              h1 { color: #2563eb; text-align: center; }
                              h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
                              .section { margin-bottom: 30px; }
                              .item { margin-bottom: 15px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 5px; }
                              .title { font-weight: bold; color: #1f2937; }
                              .status { padding: 2px 8px; border-radius: 12px; font-size: 12px; }
                              .completed { background: #dcfce7; color: #166534; }
                              .in-progress { background: #dbeafe; color: #1d4ed8; }
                              .pending { background: #f3f4f6; color: #374151; }
                              .high { background: #fecaca; color: #dc2626; }
                              .medium { background: #fef3c7; color: #d97706; }
                              .low { background: #dcfce7; color: #16a34a; }
                            </style>
                          </head>
                          <body>
                            <h1>📋 Routine Master - Data Export</h1>
                            <p style="text-align: center; color: #6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
                            
                            <div class="section">
                              <h2>📝 Tasks (${tasks.length})</h2>
                              ${tasks.length > 0 ? tasks.map(task => `
                                <div class="item">
                                  <div class="title">${task.title || 'Untitled'}</div>
                                  ${task.description ? `<p>${task.description}</p>` : ''}
                                  <p><strong>Due:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'} | <strong>Priority:</strong> <span class="status ${task.priority || 'medium'}">${(task.priority || 'medium').toUpperCase()}</span> | <strong>Status:</strong> <span class="status ${task.status || 'pending'}">${(task.status || 'pending').replace('-', ' ').toUpperCase()}</span></p>
                                  ${task.startTime || task.endTime ? `<p><strong>Time:</strong> ${task.startTime || ''} ${task.startTime && task.endTime ? '-' : ''} ${task.endTime || ''}</p>` : ''}
                                </div>
                              `).join('') : '<p>No tasks found</p>'}
                            </div>
                            
                            <div class="section">
                              <h2>🎯 Goals (${goals.length})</h2>
                              ${goals.length > 0 ? goals.map(goal => `
                                <div class="item">
                                  <div class="title">${goal.title || 'Untitled'}</div>
                                  ${goal.description ? `<p>${goal.description}</p>` : ''}
                                  <p><strong>Deadline:</strong> ${goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'} | <strong>Progress:</strong> ${goal.progress || 0}% ${goal.completed ? '<span class="status completed">Completed</span>' : ''}</p>
                                </div>
                              `).join('') : '<p>No goals found</p>'}
                            </div>
                            
                            <div class="section">
                              <h2>📖 Diary Entries (${diary.length})</h2>
                              ${diary.length > 0 ? diary.map(entry => `
                                <div class="item">
                                  <div class="title">${entry.date ? new Date(entry.date).toLocaleDateString() : 'No date'} ${entry.mood || ''}</div>
                                  <p>${entry.content || 'No content'}</p>
                                </div>
                              `).join('') : '<p>No diary entries found</p>'}
                            </div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                      
                      toast.dismiss();
                      toast.success('PDF ready for download!');
                    } catch (error) {
                      toast.dismiss();
                      toast.error('Export failed');
                    }
                  }}
                  className="px-4 py-2 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Clear All Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remove all tasks, goals, and diary entries</p>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete ALL your data? This action cannot be undone.')) {
                      const confirmation = prompt('Type "DELETE" to confirm:');
                      if (confirmation === 'DELETE') {
                        try {
                          toast.loading('Clearing all data...');
                          const [tasksRes, goalsRes, diaryRes] = await Promise.all([
                            tasksAPI.getAll({ page: 1, limit: 1000 }),
                            goalsAPI.getAll({ page: 1, limit: 1000 }),
                            diaryAPI.getAll({ page: 1, limit: 1000 })
                          ]);
                          
                          const tasks = tasksRes.data?.tasks || tasksRes.data || [];
                          const goals = goalsRes.data?.goals || goalsRes.data || [];
                          const diary = diaryRes.data?.entries || diaryRes.data || [];
                          
                          const deletePromises = [];
                          if (tasks.length > 0) deletePromises.push(...tasks.map(task => tasksAPI.delete(task._id).catch(() => null)));
                          if (goals.length > 0) deletePromises.push(...goals.map(goal => goalsAPI.delete(goal._id).catch(() => null)));
                          if (diary.length > 0) deletePromises.push(...diary.map(entry => diaryAPI.delete(entry._id).catch(() => null)));
                          
                          if (deletePromises.length > 0) {
                            await Promise.allSettled(deletePromises);
                          }
                          
                          toast.dismiss();
                          toast.success('All data cleared successfully');
                          setTimeout(() => window.location.reload(), 1000);
                        } catch (error) {
                          toast.dismiss();
                          toast.error('Failed to clear data');
                        }
                      } else {
                        toast.error('Confirmation failed. Data not cleared.');
                      }
                    }
                  }}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;