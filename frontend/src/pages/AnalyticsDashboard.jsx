import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { 
  Award, 
  TrendingUp, 
  Building2, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('All'); // 'All' | 'Good' | 'At Risk'

  const { addToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setAnalytics(res.data.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        addToast('Failed to load analytics records.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [addToast]);

  if (loading) {
    return (
      <Layout title="Analytics & Trends">
        <div className="flex items-center justify-center min-h-[70vh]">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  const { summary, charts, allStudentStats } = analytics || {
    summary: { totalStudents: 0, overallPercentage: 0 },
    charts: { trendChart: [], pieChart: [], monthlyChart: [], departmentStats: [] },
    allStudentStats: []
  };

  // Filter student statistics
  const filteredStudentStats = allStudentStats.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (complianceFilter === 'Good') {
      return matchesSearch && student.percentage >= 75;
    } else if (complianceFilter === 'At Risk') {
      return matchesSearch && student.percentage < 75;
    }
    
    return matchesSearch;
  });

  return (
    <Layout title="Analytics & Trends">
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Compliance Rating Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Overall Compliance</span>
            <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">{summary.overallPercentage}%</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Average academic presence</p>
          </div>
        </div>

        {/* Total Departments Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Departments</span>
            <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">{charts.departmentStats.length}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Academic sectors monitored</p>
          </div>
        </div>

        {/* Students At Risk Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">At-Risk Students</span>
            <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">
              {allStudentStats.filter(s => s.percentage < 75 && s.totalClasses > 0).length}
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Attendance rates under 75%</p>
          </div>
        </div>
      </div>

      {/* Chart layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Department Comparison Chart */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            Department Performance Comparisons (%)
          </h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentStats} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="department" stroke="#9CA3AF" tickFormatter={(t) => t.split(' ')[0]} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    border: 'none'
                  }}
                  itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                />
                <Bar dataKey="percentage" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {charts.departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 80 ? '#10B981' : '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar compliance department chart */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            Department Distribution
          </h3>
          <div className="flex-1 w-full text-xs flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={charts.departmentStats}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="department" tickFormatter={(t) => t.split(' ')[0]} stroke="#9CA3AF" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" />
                <Radar name="Attendance" dataKey="percentage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Roster Compliance List */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-gray-200/60 dark:border-gray-800/40">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Student Attendance Compliance
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Compliance scores based on logged terms</p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 w-full sm:w-48 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="All">All Compliance</option>
              <option value="Good">Good (&ge; 75%)</option>
              <option value="At Risk">At Risk (&lt; 75%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-900/60 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Classes Attended</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Compliance Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredStudentStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No compliance records match search query.
                  </td>
                </tr>
              ) : (
                filteredStudentStats.map((stat) => (
                  <tr key={stat.studentId} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-mono">{stat.studentId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{stat.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{stat.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {stat.presentClasses} / {stat.totalClasses} classes
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold ${
                          stat.percentage >= 75 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                        }`}>
                          {stat.percentage}%
                        </span>
                        <div className="h-1.5 w-24 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden hidden md:block">
                          <div 
                            className={`h-full rounded-full ${stat.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </Layout>
  );
};

export default AnalyticsDashboard;
