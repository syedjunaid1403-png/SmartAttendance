import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  BarChart3, 
  Users2, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  // Animation container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const features = [
    {
      title: 'Automated Attendance Tracker',
      description: 'Quickly record daily student status, add customized remarks, and maintain timezone-independent history.',
      icon: <CheckCircle2 className="w-6 h-6 text-primary-500" />
    },
    {
      title: 'Advanced Analytics Dashboard',
      description: 'Interact with visual trend lines, monthly bars, and present/absent ratios designed with Recharts.',
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Active Alerts & Alerts Manager',
      description: 'Receive real-time notifications for students whose cumulative attendance drops below the 75% threshold.',
      icon: <TrendingUp className="w-6 h-6 text-amber-500" />
    },
    {
      title: 'Robust Role Management',
      description: 'Separate authorization dashboards for Administrators (management) and Students (personalized calendars).',
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-900 dark:via-dark-900 dark:to-dark-800 transition-colors duration-300">
      
      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white font-bold text-xl glow-green">
            A
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">
            Smart<span className="text-primary-500">Attend</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-dark-700 transition-all"
            >
              Sign In
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-emerald-600 hover:from-primary-600 hover:to-emerald-700 shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 transition-all"
            >
              Sign Up
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Text */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6 text-left"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-400 text-xs font-semibold"
          >
            <Cpu className="w-4 h-4 animate-pulse" />
            AI-Driven Academic Analytics
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-gray-900 dark:text-white leading-[1.1]"
          >
            Next-Gen <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-emerald-600 dark:from-primary-400 dark:to-emerald-500">
              Attendance Analytics
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-xl"
          >
            An enterprise-level dashboard built to log attendance, monitor compliance, manage student rosters, and run real-time department statistics.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4 pt-2"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-emerald-600 hover:from-primary-600 hover:to-emerald-700 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all group"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="#features"
                className="block px-6 py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right UI Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 1, delay: 0.4 }}
          className="relative lg:ml-6"
        >
          {/* Background glow decorator */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary-500 to-emerald-500 opacity-20 blur-2xl dark:opacity-30" />
          
          <div className="relative border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl bg-white dark:bg-dark-800/80 backdrop-blur-md overflow-hidden">
            {/* Header Simulator */}
            <div className="h-10 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400 font-medium ml-2 select-none">smart-attendance.io</span>
            </div>
            
            {/* Landing UI Mockup */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-4">
                <div className="space-y-1">
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
                <div className="h-8 w-24 bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 rounded-lg flex items-center justify-center font-bold text-xs">
                  94.2% Attendance
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl space-y-2">
                    <div className="h-3 w-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="h-3 w-[90%] bg-gray-100 dark:bg-gray-800 rounded-full" />
                <div className="h-3 w-[70%] bg-gray-100 dark:bg-gray-800 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-gray-900 dark:text-white">
            Engineered for Modern Institutions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            A comprehensive list of core features enabling management of students, analytics reporting, and daily tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-2xl hover:shadow-xl dark:hover:shadow-black/10 transition-all border border-gray-200/60 dark:border-gray-800/40"
            >
              <div className="p-3 w-fit rounded-xl bg-gray-50 dark:bg-dark-900 mb-5">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800/50 py-10 bg-white dark:bg-dark-900/20 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Smart Attendance Analytics System. Built with React + Express + MongoDB.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
