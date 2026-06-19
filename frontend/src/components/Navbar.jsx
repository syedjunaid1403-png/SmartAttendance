import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar, title = '' }) => {
  const { user } = useAuth();
  
  // Format current date: e.g. "Friday, Jun 19, 2026"
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 flex items-center justify-between px-6 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-dark-700 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-sans dark:text-gray-100 hidden sm:block">
            {title || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Current Date (hidden on narrow screens) */}
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:block">
          {currentDate}
        </span>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Icon */}
        <button className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-500 dark:text-gray-400 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-dark-800" />
        </button>

        {/* Separation Divider */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        {/* User Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-900 border border-gray-200 dark:border-gray-700">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:block">
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
