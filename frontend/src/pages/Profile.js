import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usersAPI } from '../utils/api';
import { User, Save, Upload, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      console.log('User data:', user);
      setFormData({
        name: user.name || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    console.log('FormData updated:', formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await usersAPI.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 200;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const base64Image = await convertToBase64(file);
      console.log('Converted image to base64');
      const updatedFormData = { ...formData, avatar: base64Image };
      setFormData(updatedFormData);
      
      // Auto-save the profile with new image
      const response = await usersAPI.updateProfile(updatedFormData);
      updateUser(response.data.user);
      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including tasks, goals, and diary entries.'
    );
    
    if (confirmed) {
      const doubleConfirm = window.confirm(
        'This is your final warning. Are you absolutely sure you want to permanently delete your account?'
      );
      
      if (doubleConfirm) {
        try {
          await usersAPI.deleteAccount();
          toast.success('Account deleted successfully');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } catch (error) {
          toast.error('Failed to delete account');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-4">
          <User className="w-6 h-6 text-primary-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 relative group">
                <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img
                      className="h-full w-full object-cover"
                      src={formData.avatar}
                      alt="Profile"
                      onError={(e) => {
                        console.error('Image failed to load:', formData.avatar);
                        setFormData(prev => ({ ...prev, avatar: '' }));
                      }}
                      onLoad={() => console.log('Image loaded:', formData.avatar)}
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 h-5 w-5 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                  <Plus className="h-2.5 w-2.5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 h-16 w-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Photo
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click + to upload
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Save className="w-3 h-3 mr-1" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Stats & Danger Zone */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Account Statistics
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {theme}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Theme</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Member Since</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
                  Danger Zone
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Delete Account
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Permanently delete your account and all data.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;