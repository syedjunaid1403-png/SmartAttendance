import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import api from '../utils/api';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Percent, 
  AlertTriangle,
  Award,
  Clock,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Edit2,
  X,
  Bell,
  Download,
  BookOpen,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const StudentPortal = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchStudentData = async () => {
    if (!user?.studentId) return;
    try {
      const res = await api.get(`/attendance/student/${user.studentId}`);
      setData(res.data);
      
      // Seed edit form values
      setEditName(res.data.student.name || '');
      setEditEmail(res.data.student.email || '');
      setEditPhone(res.data.student.phone || '');
      setEditAddress(res.data.student.address || '');
    } catch (err) {
      console.error('Error fetching student data:', err);
      addToast('Failed to load attendance records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user, addToast]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      addToast('Name and Email are required.', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.put(`/students/${data.student._id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress
      });
      addToast('Profile updated successfully!', 'success');
      setEditOpen(false);
      fetchStudentData();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const downloadReport = () => {
    if (!data || !data.history || data.history.length === 0) {
      addToast('No attendance logs to download.', 'error');
      return;
    }

    const headers = ['Date', 'Status', 'Remarks / Logs'];
    const rows = data.history.map(h => [
      h.date,
      h.status.toUpperCase(),
      `"${(h.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `My_Attendance_Report_${user.studentId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Attendance report CSV downloaded!', 'success');
  };

  if (loading) {
    return (
      <Layout title="Student Portal">
        <div className="flex items-center justify-center min-h-[70vh]">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  const stats = data?.stats || { totalDays: 0, presentDays: 0, absentDays: 0, leaveDays: 0, attendancePercentage: 100, subjects: [] };
  const history = data?.history || [];
  const student = data?.student || user;

  const isLowAttendance = stats.attendancePercentage < 75;

  // Format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  // Compile line graph data (last 10 classes)
  const getTrendData = () => {
    const subset = [...history].slice(-10).reverse();
    let accumPresent = 0;
    return subset.map((h, idx) => {
      if (h.status === 'present') accumPresent++;
      const currentRate = Math.round((accumPresent / (idx + 1)) * 100);
      const dateObj = new Date(h.date);
      const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return {
        name: formatted,
        rate: currentRate
      };
    });
  };

  // Static notification feed
  const notifications = [
    { id: 1, message: 'Welcome to your new Student Portal dashboard!', time: 'Today', type: 'info' },
    isLowAttendance && { id: 2, message: `Warning: Your cumulative attendance of ${stats.attendancePercentage}% is below the mandatory 75% rate.`, time: 'Yesterday', type: 'warning' },
    { id: 3, message: 'Final term attendance locks on next Friday. Contact admin for excuses.', time: '3 days ago', type: 'info' }
  ].filter(Boolean);

  return (
    <Layout title={`Student Portal - ${student.name}`}>
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 to-emerald-600 dark:from-primary-900/40 dark:to-emerald-950/20 text-white rounded-3xl p-6 mb-8 border border-primary-400/20 dark:border-primary-800/20 shadow-lg glow-green flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={student.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentId}`} 
            alt={student.name}
            className="w-16 h-16 rounded-full border-2 border-white/40 bg-white"
          />
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-sans">Hello, {student.name}!</h2>
            <p className="text-xs text-primary-100 dark:text-gray-300 font-medium">
              ID: {student.studentId} | Class: {student.class || 'N/A'} | Roll: {student.rollNumber || '—'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 border border-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile Info
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadReport}
            className="px-4 py-2.5 rounded-xl bg-white text-primary-600 hover:bg-primary-50 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Download report
          </motion.button>
        </div>
      </div>

      {/* Grid: Profile cards & stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Info detail Cards */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4.5 h-4.5 text-primary-500" />
              Academic & Contact Profile
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><Building className="w-3.5 h-3.5" />Department</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250">{student.department}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Year / Semester</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250">{student.year || 'N/A'} | {student.semester || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Email</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250 truncate max-w-[170px]">{student.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/50">
                <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250">{student.phone || '—'}</span>
              </div>
              <div className="flex justify-between items-start py-1">
                <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5 flex-shrink-0 mt-0.5"><MapPin className="w-3.5 h-3.5" />Address</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250 text-right max-w-[170px] leading-normal">{student.address || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary Stat Card */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Attendance"
            value={`${stats.attendancePercentage}%`}
            icon={<Percent className="w-5 h-5" />}
            description="Overall compliancy"
            type={isLowAttendance ? 'danger' : 'primary'}
          />
          <StatCard
            title="Classes Logged"
            value={stats.totalDays}
            icon={<Calendar className="w-5 h-5" />}
            description="Total working days"
            type="info"
          />
          <StatCard
            title="Present Days"
            value={stats.presentDays}
            icon={<CheckCircle className="w-5 h-5" />}
            description="Attended status"
            type="primary"
          />
          <StatCard
            title="Absent & Leaves"
            value={stats.absentDays + stats.leaveDays}
            icon={<XCircle className="w-5 h-5" />}
            description={`${stats.absentDays} Abs | ${stats.leaveDays} Leaves`}
            type={stats.absentDays > 0 ? 'danger' : 'primary'}
          />
        </div>
      </div>

      {/* Grid: Charts, Subject list & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Trend Line Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 h-[300px] flex flex-col">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            Recent 10-Class Attendance Rate Trend (%)
          </h3>
          <div className="flex-1 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getTrendData()} margin={{ left: -25, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#22c55e" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, stroke: '#22c55e', fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications list */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col h-[300px]">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800/50 pb-2.5">
            <Bell className="w-4 h-4 text-primary-500 animate-pulse" />
            Alerts & Notifications
          </h3>
          
          <div className="flex-grow overflow-y-auto space-y-3.5 pr-1">
            {notifications.map(n => (
              <div key={n.id} className="text-xs flex gap-2.5 items-start">
                <div className={`p-1.5 rounded-lg mt-0.5 ${
                  n.type === 'warning' ? 'bg-red-50 dark:bg-red-950/20 text-red-600' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'
                }`}>
                  {n.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Compliance Breakdown */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 space-y-4">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4.5 h-4.5 text-primary-500" />
            Subject-wise Attendance details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stats.subjects.map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <span className="truncate max-w-[180px]">{sub.subject}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-150">{sub.percentage}% ({sub.present}/{sub.total} classes)</span>
                </div>
                <div className="h-2 w-full bg-gray-150 dark:bg-dark-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance log calendar view snippet */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-200/50 dark:border-gray-800/40 flex flex-col h-[230px] lg:h-[210px] overflow-hidden">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800/50 pb-2.5">
            <Clock className="w-4 h-4 text-primary-500" />
            Recent Class Logs
          </h3>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 pr-1 text-xs">
            {history.slice(0, 5).map(rec => (
              <div key={rec._id} className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-gray-850 dark:text-gray-200">{formatDate(rec.date)}</span>
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                  rec.status === 'present' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                }`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-6 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setEditOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-500">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Edit Profile Information
                </h3>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                    placeholder="+1 (555) 010-0199"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Residential Address</label>
                  <textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs h-20 resize-none"
                    placeholder="100 University Lane, Suite 10"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 py-3 px-4 rounded-xl text-white font-semibold bg-primary-500 hover:bg-primary-600 active:scale-98 shadow-md shadow-primary-500/10 flex items-center justify-center gap-1.5 transition-all text-xs disabled:opacity-50"
                  >
                    {submitLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </Layout>
  );
};

export default StudentPortal;
