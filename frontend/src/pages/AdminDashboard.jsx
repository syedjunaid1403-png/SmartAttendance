import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import api from '../utils/api';
import { 
  Users, 
  CalendarCheck, 
  Percent, 
  UserX,
  AlertTriangle,
  Mail,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { addToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setAnalytics(res.data.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        addToast('Failed to load dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [addToast]);

  if (loading) {
    return (
      <Layout title="Dashboard Overview">
        <div className="flex items-center justify-center min-h-[70vh]">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  const { summary, charts, lowAttendanceAlerts } = analytics || {
    summary: { totalStudents: 0, overallPercentage: 0, todayAttendancePercentage: 0, absentStudentsCount: 0, activeDate: '', isTodayMarked: false },
    charts: { trendChart: [], pieChart: [], monthlyChart: [], departmentStats: [] },
    lowAttendanceAlerts: []
  };

  // Safe color constants
  const COLORS = ['#10B981', '#EF4444']; // Present Green, Absent Red

  return (
    <Layout title="Dashboard Overview">
      
      {/* Welcome & Date status banner */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-sans tracking-tight">
            Academic Performance
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Overview of stats for date <span className="font-semibold text-primary-600 dark:text-primary-400">{summary.activeDate}</span>.
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${
          summary.isTodayMarked 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-400' 
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-400'
        }`}>
          {summary.isTodayMarked ? "✓ Today's Attendance Completed" : "⚠ Today's Attendance Pending"}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={summary.totalStudents}
          icon={<Users className="w-5 h-5" />}
          description="Active student body"
          trend={{ value: '+2 new', isPositive: true }}
          type="info"
        />
        <StatCard
          title="Today's Attendance"
          value={`${summary.todayAttendancePercentage}%`}
          icon={<CalendarCheck className="w-5 h-5" />}
          description="Marked on latest date"
          trend={summary.todayAttendancePercentage > 80 ? { value: 'High', isPositive: true } : { value: 'Low', isPositive: false }}
          type="primary"
        />
        <StatCard
          title="Attendance Rate"
          value={`${summary.overallPercentage}%`}
          icon={<Percent className="w-5 h-5" />}
          description="Historical average"
          type="primary"
        />
        <StatCard
          title="Absent Students"
          value={summary.absentStudentsCount}
          icon={<UserX className="w-5 h-5" />}
          description="Count on latest date"
          type={summary.absentStudentsCount > 0 ? 'danger' : 'primary'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Trend Line Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            Daily Attendance Trend (%)
          </h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.trendChart} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                    backgroundColor: '#fff',
                    border: 'none'
                  }}
                  itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#22c55e" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, stroke: '#22c55e', fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Present/Absent Pie Chart */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            Status Share (Overall)
          </h3>
          <div className="flex-1 w-full text-xs relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={charts.pieChart}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.pieChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center percentage rate visual overlay */}
            <div className="absolute top-[40%] flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-200">{summary.overallPercentage}%</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Present</span>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            Monthly Average Rate (%)
          </h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyChart} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    border: 'none'
                  }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Stats Summary */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col h-[320px] overflow-hidden">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Department Performance
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
            {charts.departmentStats.map((dept) => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <span className="truncate max-w-[170px]">{dept.department}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{dept.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.percentage >= 85 
                        ? 'bg-emerald-500' 
                        : dept.percentage >= 75 
                          ? 'bg-blue-500' 
                          : 'bg-red-500'
                    }`} 
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400">{dept.studentCount} Students Roster</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roster alerts and Quick tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low Attendance Alerts List */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700/50 pb-3">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              Low Attendance Alerts (&lt; 75%)
            </h3>
            <span className="text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full border border-red-200/50 dark:border-red-900/30">
              {lowAttendanceAlerts.length} Students At Risk
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto max-h-[220px] pr-1">
            {lowAttendanceAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                All students comply with attendance standards.
              </div>
            ) : (
              lowAttendanceAlerts.map((student) => (
                <div key={student.studentId} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{student.name}</span>
                    <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                      {student.department} | {student.studentId}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-red-600 dark:text-red-400 font-mono">
                      {student.percentage}%
                    </span>
                    <a
                      href={`mailto:${student.email}?subject=Attendance Warning - Action Required`}
                      className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-800 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                      title="Send warning email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Utilities */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-700/50 pb-3">
            Quick Actions
          </h3>
          <div className="flex-1 flex flex-col justify-center gap-3">
            <a
              href="/attendance"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 text-primary-800 dark:text-primary-300 font-semibold hover:translate-x-1 transition-transform group text-xs"
            >
              Mark Today's Attendance
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="/students"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300 font-semibold hover:translate-x-1 transition-transform group text-xs"
            >
              Roster & Student Database
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="/reports"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 font-semibold hover:translate-x-1 transition-transform group text-xs"
            >
              Export spreadsheets/reports
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default AdminDashboard;
