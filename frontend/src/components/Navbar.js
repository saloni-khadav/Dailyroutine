import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  CheckSquare, 
  Target, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Bell,
  Search
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Routine Master
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} className="text-gray-600" /> : <Sun size={20} className="text-gray-600" />}
              </button>
              
              <Link
                to="/login"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }



  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Routine Master
            </span>
          </Link>
          


          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Search size={20} className="text-gray-600" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} className="text-gray-600" /> : <Sun size={20} className="text-gray-600" />}
            </button>
            
            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-gray-700 font-medium">{user.name}</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                  >
                    <User size={18} />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200"
                  >
                    <Settings size={18} />
                    <span>Preferences</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;