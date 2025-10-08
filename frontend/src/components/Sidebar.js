import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  CheckSquare, 
  Target, 
  Calendar, 
  TrendingUp, 
  BookOpen,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', color: 'text-blue-600' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks', color: 'text-green-600' },
    { to: '/goals', icon: Target, label: 'Goals', color: 'text-purple-600' },
    { to: '/calendar', icon: Calendar, label: 'Calendar', color: 'text-orange-600' },
    { to: '/progress', icon: TrendingUp, label: 'Progress', color: 'text-pink-600' },
    { to: '/diary', icon: BookOpen, label: 'Diary', color: 'text-indigo-600' }
  ];

  return (
    <div className="fixed left-0 top-16 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm z-40 flex flex-col" style={{height: 'calc(100vh - 4rem)'}}>
      <div className="p-6 flex-1">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`${isActive ? 'text-blue-600 dark:text-blue-400' : `group-hover:${item.color}`} transition-colors`} 
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;