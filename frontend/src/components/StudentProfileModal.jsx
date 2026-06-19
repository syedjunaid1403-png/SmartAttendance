import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Percent, 
  Clock, 
  AlertTriangle, 
  Download,
  BookOpen,
  CheckCircle,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const StudentProfileModal = ({ studentId, isOpen, onClose }) => {
  const [profileData, setProfileData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('details'); // 'details' | 'performance' | 'history'

  const api = React.useRef(null);

  React.useEffect(() => {
    // Dynamic import to avoid cycles or setup issues
    import('../utils/api').then((m) => {
      api.current = m.default;
      if (isOpen && studentId) {
        fetchProfile();
      }
    });
  }, [isOpen, studentId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.current.get(`/attendance/student/${studentId}`);
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const student = profileData?.student || {};
  const stats = profileData?.stats || { totalDays: 0, presentDays: 0, absentDays: 0, leaveDays: 0, attendancePercentage: 100, subjects: [] };
  const history = profileData?.history || [];

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

  // Compile trend chart data (last 10 classes)
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

  // Download Individual Student CSV
  const downloadStudentCSV = () => {
    if (history.length === 0) return;

    const headers = ['Date', 'Status', 'Remarks / Log'];
    const rows = history.map(h => [
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
    link.setAttribute('download', `Attendance_Report_${student.studentId}_${student.name.replace(/ /g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-gray-950/40 backdrop-blur-sm p-0 sm:p-4">
      {/* Sidebar overlay clicks */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl h-screen sm:h-[95vh] bg-white dark:bg-dark-800 border-l sm:border sm:rounded-3xl border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-dark-900/20">
          <div className="flex items-center gap-4">
            <img 
              src={student.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentId}`} 
              alt={student.name}
              className="w-14 h-14 rounded-full border-2 border-primary-500 bg-white shadow-md"
            />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {student.name}
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400">
                  {student.studentId}
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {student.department} | Roll No: {student.rollNumber || '—'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3.5 border-b-2 transition-all ${
                  activeTab === 'details'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Profile details
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-3.5 border-b-2 transition-all ${
                  activeTab === 'performance'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Performance Dashboard
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3.5 border-b-2 transition-all ${
                  activeTab === 'history'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Attendance Log
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-6 animate-slide-up">
                  
                  {/* Academic Info */}
                  <div className="glass-panel p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-primary-500" />
                      Academic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Department</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5">{student.department}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Roster Class</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5">{student.class || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Year / Term</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5">{student.year || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Active Semester</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5">{student.semester || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Roll Number</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5 font-mono">{student.rollNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Admission Date</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5">{formatDate(student.admissionDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Contact */}
                  <div className="glass-panel p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary-500" />
                      Personal & Contact Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Email Address</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {student.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Phone Number</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {student.phone || '—'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Date of Birth</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(student.dateOfBirth)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 dark:text-gray-500">Gender</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5 capitalize">{student.gender || '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400 dark:text-gray-500">Residential Address</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-250 mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {student.address || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PERFORMANCE DASHBOARD */}
              {activeTab === 'performance' && (
                <div className="space-y-6 animate-slide-up">
                  
                  {/* Low Attendance Alert */}
                  {isLowAttendance && (
                    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold text-red-800 dark:text-red-300">Attendance Roster Warning</h5>
                        <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5 leading-normal">
                          This student is currently at <span className="font-bold">{stats.attendancePercentage}%</span> compliance, which falls below the mandatory 75% rate. Roster compliance is critical.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-dark-900/50 rounded-xl border border-gray-150 dark:border-gray-800/40 text-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Rate</span>
                      <p className={`text-xl font-bold mt-1 ${isLowAttendance ? 'text-red-500' : 'text-emerald-500'}`}>{stats.attendancePercentage}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-dark-900/50 rounded-xl border border-gray-150 dark:border-gray-800/40 text-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Present</span>
                      <p className="text-xl font-bold mt-1 text-gray-800 dark:text-white">{stats.presentDays}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-dark-900/50 rounded-xl border border-gray-150 dark:border-gray-800/40 text-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Absent</span>
                      <p className="text-xl font-bold mt-1 text-gray-800 dark:text-white">{stats.absentDays}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-dark-900/50 rounded-xl border border-gray-150 dark:border-gray-800/40 text-center">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Leaves</span>
                      <p className="text-xl font-bold mt-1 text-blue-500">{stats.leaveDays}</p>
                    </div>
                  </div>

                  {/* Trend chart */}
                  <div className="glass-panel p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 h-[220px] flex flex-col">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Recent 10-Class Trend Rate</h5>
                    <div className="flex-1 w-full text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getTrendData()} margin={{ left: -25, right: 10, top: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" stroke="#9CA3AF" />
                          <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                          <Tooltip />
                          <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Subject Compliance Breakdown */}
                  <div className="glass-panel p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 space-y-3.5">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-primary-500" />
                      Class Subject attendance Details
                    </h5>
                    
                    <div className="space-y-3">
                      {stats.subjects.map((sub, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
                            <span>{sub.subject}</span>
                            <span className="font-bold text-gray-800 dark:text-gray-100">{sub.percentage}% ({sub.present}/{sub.total} classes)</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                              style={{ width: `${sub.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: ATTENDANCE HISTORY LOG */}
              {activeTab === 'history' && (
                <div className="space-y-4 animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary-500" />
                      Historical Log Records
                    </h5>
                    <button
                      onClick={downloadStudentCSV}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Log Report
                    </button>
                  </div>

                  <div className="border border-gray-150 dark:border-gray-850 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-dark-900/60 border-b border-gray-200 dark:border-gray-800">
                          <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                          <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                          <th className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                        {history.map((rec) => (
                          <tr key={rec._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-750/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{formatDate(rec.date)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                rec.status === 'present' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' 
                                  : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                              }`}>
                                {rec.status === 'present' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{rec.remarks || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

// Simple inline LoadingSpinner helper just in case
const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClass = size === 'large' ? 'w-10 h-10 border-4' : 'w-5 h-5 border-2';
  return (
    <div className={`${sizeClass} rounded-full border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent animate-spin`} />
  );
};

export default StudentProfileModal;
