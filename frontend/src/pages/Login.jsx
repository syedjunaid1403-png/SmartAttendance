import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/student-portal');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all credentials.', 'error');
      return;
    }

    setFormLoading(true);
    const result = await login(email, password);
    setFormLoading(false);

    if (result.success) {
      addToast('Welcome back! Login successful.', 'success');
      // Redirect happens in useEffect
    } else {
      addToast(result.error || 'Invalid credentials.', 'error');
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@smartattendance.com');
      setPassword('admin123');
    } else {
      setEmail('john@smartattendance.com');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-900 dark:via-dark-900 dark:to-dark-800 transition-colors duration-300 px-4">
      
      {/* Theme toggle position absolute */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white font-bold text-lg glow-green">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">
              Smart<span className="text-primary-500">Attend</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sign in to your Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Log in to manage or review daily attendance.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="name@university.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={formLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-primary-500 to-emerald-600 hover:from-primary-600 hover:to-emerald-700 shadow-md shadow-primary-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {formLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* SignUp Link */}
          <div className="mt-4 text-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
            <Link 
              to="/signup" 
              className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-colors inline-flex items-center gap-0.5"
            >
              Sign Up
            </Link>
          </div>

          {/* Quick-fill testing panel */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800/80 space-y-3.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-primary-500 animate-pulse" />
              Quick-Fill Testing Credentials
            </span>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuickFill('admin')}
                className="px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-900 rounded-lg text-gray-700 dark:text-gray-300 text-left transition-colors"
              >
                <div className="font-bold text-primary-600 dark:text-primary-400">Admin Role</div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">admin@smartattendance.com</div>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuickFill('student')}
                className="px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-900 rounded-lg text-gray-700 dark:text-gray-300 text-left transition-colors"
              >
                <div className="font-bold text-blue-600 dark:text-blue-400">Student Role</div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">john@smartattendance.com</div>
              </motion.button>
            </div>
            
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-3 rounded-xl text-left">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-normal">
                Credentials are pre-seeded in the database backend. Passwords are: <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-semibold">admin123</code> / <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-semibold">student123</code>.
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
