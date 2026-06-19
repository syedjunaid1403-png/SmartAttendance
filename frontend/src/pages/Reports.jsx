import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { 
  Download, 
  Calendar, 
  Building, 
  User, 
  FileText,
  BarChart,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  
  // Filter States
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Report Result State
  const [reportSummary, setReportSummary] = useState({ totalRecords: 0, totalPresent: 0, totalAbsent: 0, percentage: 0 });
  const [reportData, setReportData] = useState([]);

  const { addToast } = useToast();
  const departmentsList = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration'];

  // Load students for dropdown when department changes
  useEffect(() => {
    const fetchStudentsForDropdown = async () => {
      try {
        const res = await api.get('/students', {
          params: { department: selectedDept }
        });
        setStudents(res.data.data);
        setSelectedStudent(''); // Reset student selection when department changes
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudentsForDropdown();
  }, [selectedDept]);

  // Generate Report
  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/report', {
        params: {
          department: selectedDept,
          studentId: selectedStudent,
          startDate,
          endDate
        }
      });
      setReportSummary(res.data.summary);
      setReportData(res.data.data);
      addToast('Report generated successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to compile report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [selectedDept, selectedStudent, startDate, endDate]);

  // Download Report as CSV
  const downloadCSV = () => {
    if (reportData.length === 0) {
      addToast('No data available to export.', 'error');
      return;
    }

    // Define CSV Headers
    const headers = ['Student ID', 'Student Name', 'Department', 'Email', 'Date', 'Status', 'Remarks', 'Cumulative Attendance %'];
    
    // Format rows
    const rows = reportData.map(rec => [
      rec.studentId,
      `"${rec.studentName.replace(/"/g, '""')}"`,
      `"${rec.department}"`,
      rec.email,
      rec.date,
      rec.status.toUpperCase(),
      `"${(rec.remarks || '').replace(/"/g, '""')}"`,
      `${rec.overallPercentage}%`
    ]);

    // Construct CSV String
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create Download Blob Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Attendance_Report_${selectedDept}_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Report spreadsheet downloaded!', 'success');
  };

  return (
    <Layout title="Reports & Export Center">
      
      {/* Filtering Controls */}
      <div className="bg-white dark:bg-dark-800 p-6 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm mb-8 space-y-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-4.5 h-4.5 text-primary-500" />
          Filter Report Roster
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Department Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-850 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
            >
              <option value="All">All Departments</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Individual Student Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Individual Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-850 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
            >
              <option value="">All Students (Summary)</option>
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>{s.name} ({s.studentId})</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-850 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-850 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
            />
          </div>
        </div>

        {/* Date Clear Action */}
        {(startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Clear Date Filters
            </button>
          </div>
        )}
      </div>

      {/* Query summary statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 text-center">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Filtered Records</span>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white mt-1">{reportSummary.totalRecords}</h4>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 text-center">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Present Count</span>
          <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{reportSummary.totalPresent}</h4>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 text-center">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Absent Count</span>
          <h4 className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{reportSummary.totalAbsent}</h4>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/40 text-center">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Compliance Average</span>
          <h4 className={`text-xl font-bold mt-1 ${reportSummary.percentage >= 75 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'}`}>
            {reportSummary.percentage}%
          </h4>
        </div>
      </div>

      {/* Roster Report Table Card */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-gray-200/60 dark:border-gray-800/40">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart className="w-4.5 h-4.5 text-primary-500" />
            Report Data Output
          </h3>
          
          <button
            onClick={downloadCSV}
            disabled={reportData.length === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 active:scale-95 shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV Report
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="large" />
          </div>
        ) : reportData.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">
            No records match report parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-900/60 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roster Compliance</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {reportData.map((rec, idx) => {
                  const formattedDate = new Date(rec.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC'
                  });

                  return (
                    <tr key={`${rec.studentId}-${rec.date}-${idx}`} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{rec.studentName}</span>
                          <div className="text-[10px] text-gray-400 font-mono">{rec.studentId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {rec.department}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
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
                      <td className="px-6 py-4 text-sm font-bold font-mono text-gray-700 dark:text-gray-300">
                        {rec.overallPercentage}%
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

    </Layout>
  );
};

export default Reports;
