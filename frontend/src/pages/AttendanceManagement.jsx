import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { 
  Check, 
  X, 
  Calendar, 
  Building, 
  Search, 
  CheckCircle, 
  XCircle, 
  ClipboardList, 
  History 
} from 'lucide-react';
import { motion } from 'framer-motion';

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'history'
  const [loading, setLoading] = useState(false);
  
  // Roster / Marking States
  const [students, setStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState('Computer Science');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStates, setAttendanceStates] = useState({}); // { studentId: { status: 'present' | 'absent', remarks: '' } }
  const [submitting, setSubmitting] = useState(false);
  
  // History States
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyDept, setHistoryDept] = useState('All');
  const [historyDate, setHistoryDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { addToast } = useToast();
  const departmentsList = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration'];

  // Load students for marking
  const fetchStudentsForMarking = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', {
        params: { department: selectedDept }
      });
      setStudents(res.data.data);
      
      // Initialize marking states: default to 'present'
      const initialStates = {};
      res.data.data.forEach(s => {
        initialStates[s.studentId] = { status: 'present', remarks: '' };
      });
      setAttendanceStates(initialStates);
    } catch (err) {
      console.error(err);
      addToast('Failed to load students list for marking.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load history records
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance', {
        params: { 
          department: historyDept,
          date: historyDate
        }
      });
      setHistoryRecords(res.data.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load attendance history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mark') {
      fetchStudentsForMarking();
    } else {
      fetchHistory();
    }
  }, [activeTab, selectedDept, historyDept, historyDate]);

  // Toggle status for a student during marking
  const handleStatusChange = (studentId, status) => {
    setAttendanceStates(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Handle remarks change during marking
  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceStates(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  // Submit marked attendance
  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) {
      addToast('No students available to mark.', 'error');
      return;
    }

    setSubmitting(true);
    const records = Object.keys(attendanceStates).map(studentId => ({
      studentId,
      status: attendanceStates[studentId].status,
      remarks: attendanceStates[studentId].remarks
    }));

    try {
      await api.post('/attendance/mark', {
        date: markDate,
        records
      });
      addToast(`Attendance for date ${markDate} marked successfully!`, 'success');
      // Switch to history tab to view results
      setActiveTab('history');
      setHistoryDate(markDate);
      setHistoryDept(selectedDept);
    } catch (err) {
      console.error(err);
      addToast('Error saving attendance records.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter history records on client search input
  const filteredHistory = historyRecords.filter(rec => 
    rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title="Attendance Management">
      
      {/* Tabs Toggles */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('mark')}
          className={`flex items-center gap-2 pb-4 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'mark'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 pb-4 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <History className="w-4 h-4" />
          View History Logs
        </button>
      </div>

      {activeTab === 'mark' ? (
        /* MARK ATTENDANCE INTERFACE */
        <div className="space-y-6">
          
          {/* Controls Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-dark-800 p-5 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm">
            {/* Select Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-500" />
                Select Attendance Date
              </label>
              <input
                type="date"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold text-sm transition-all"
              />
            </div>

            {/* Select Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-primary-500" />
                Filter Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold text-sm transition-all"
              >
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            {/* Information Badge */}
            <div className="flex items-end">
              <div className="w-full bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-gray-800/80 p-3.5 rounded-xl text-xs text-gray-500 dark:text-gray-400 leading-normal flex items-start gap-2">
                <ClipboardList className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                All student attendance records default to "Present". Toggle "Absent" where appropriate and supply custom remarks for late arrivals or excused leaves.
              </div>
            </div>
          </div>

          {/* Student Marking Table Card */}
          <div className="glass-panel border border-gray-200/50 dark:border-gray-800/40 rounded-3xl overflow-hidden shadow-lg">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner size="large" />
              </div>
            ) : students.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">
                No students enrolled in this department. Roster is empty.
              </div>
            ) : (
              <form onSubmit={handleMarkSubmit}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-dark-900/60 border-b border-gray-200 dark:border-gray-800">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Daily Status Toggle</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {students.map((student) => {
                        const state = attendanceStates[student.studentId] || { status: 'present', remarks: '' };

                        return (
                          <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/20 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-mono">{student.studentId}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{student.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-900 p-1 w-fit rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(student.studentId, 'present')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    state.status === 'present'
                                      ? 'bg-emerald-500 text-white shadow-sm glow-green'
                                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(student.studentId, 'absent')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    state.status === 'absent'
                                      ? 'bg-red-500 text-white shadow-sm glow-red'
                                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Absent
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={state.remarks}
                                onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                                placeholder="Add optional log remarks..."
                                className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Submit Actions Button */}
                <div className="p-5 bg-gray-50 dark:bg-dark-900/60 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl text-white font-semibold bg-primary-500 hover:bg-primary-600 active:scale-98 shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Submit Attendance Log
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* VIEW HISTORY LOGS INTERFACE */
        <div className="space-y-6">
          
          {/* Filtering Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* Filter Date */}
            <div className="relative">
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold text-sm transition-all shadow-sm"
              />
              {historyDate && (
                <button
                  onClick={() => setHistoryDate('')}
                  className="absolute right-3 top-3.5 text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Department */}
            <select
              value={historyDept}
              onChange={(e) => setHistoryDept(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-semibold text-sm transition-all shadow-sm"
            >
              <option value="All">All Departments</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* History Data Table */}
          <div className="glass-panel border border-gray-200/50 dark:border-gray-800/40 rounded-3xl overflow-hidden shadow-lg">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">
                No attendance logs match the specified criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-dark-900/60 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance Rate</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks / Logs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredHistory.map((rec) => {
                      const formattedDate = new Date(rec.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC'
                      });

                      return (
                        <tr key={rec._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{rec.studentName}</span>
                              <div className="text-[10px] text-gray-400 font-mono">{rec.studentId} | {rec.department}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {formattedDate}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              rec.status === 'present'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-400'
                                : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-400'
                            }`}>
                              {rec.status === 'present' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span className="capitalize">{rec.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold font-mono ${
                                rec.attendancePercentage >= 85 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : rec.attendancePercentage >= 75 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-red-600 dark:text-red-400'
                              }`}>
                                {rec.attendancePercentage}%
                              </span>
                              <div className="h-1.5 w-16 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                  className={`h-full rounded-full ${
                                    rec.attendancePercentage >= 85 
                                      ? 'bg-emerald-500' 
                                      : rec.attendancePercentage >= 75 
                                        ? 'bg-blue-500' 
                                        : 'bg-red-500'
                                  }`} 
                                  style={{ width: `${rec.attendancePercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                            {rec.remarks || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AttendanceManagement;
