const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const mockStore = require('../config/mockStore');

// Helper: Calculate attendance rate for a list of student records
const getAttendanceRateForRecords = (records) => {
  if (records.length === 0) return 0;
  const present = records.filter(r => r.status === 'present').length;
  return Math.round((present / records.length) * 100);
};

// @desc    Get dashboard statistics, charts, and alerts
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    let allStudents = [];
    let allAttendance = [];

    if (global.useMockDb) {
      allStudents = mockStore.getStudents();
      allAttendance = mockStore.getAttendance();
    } else {
      allStudents = await Student.find({});
      allAttendance = await Attendance.find({});
    }

    const totalStudents = allStudents.length;

    // 1. Determine "Today" or "Latest Marked Date" for Today's Stats
    let latestDateStr = new Date().toISOString().split('T')[0];
    const todayRecords = allAttendance.filter(r => r.dateString === latestDateStr);
    
    let activeDateStr = latestDateStr;
    let targetDayRecords = todayRecords;

    // If today is empty, fall back to the most recent marked date
    if (todayRecords.length === 0 && allAttendance.length > 0) {
      // Find the max dateString in attendance records
      const dates = allAttendance.map(r => r.dateString);
      const uniqueDates = [...new Set(dates)].sort();
      activeDateStr = uniqueDates[uniqueDates.length - 1] || latestDateStr;
      targetDayRecords = allAttendance.filter(r => r.dateString === activeDateStr);
    }

    const todayTotal = targetDayRecords.length;
    const todayPresent = targetDayRecords.filter(r => r.status === 'present').length;
    const todayAbsent = todayTotal - todayPresent;
    const todayPercentage = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

    // 2. Calculate Overall Attendance Percentage
    const overallPercentage = getAttendanceRateForRecords(allAttendance);

    // 3. Compute Attendance per student to generate alerts (< 75%)
    const studentStats = allStudents.map(student => {
      const studentRecs = allAttendance.filter(r => r.studentId === student.studentId);
      const percentage = studentRecs.length > 0 ? getAttendanceRateForRecords(studentRecs) : 100;
      return {
        studentId: student.studentId,
        name: student.name,
        department: student.department,
        email: student.email,
        totalClasses: studentRecs.length,
        presentClasses: studentRecs.filter(r => r.status === 'present').length,
        percentage
      };
    });

    const lowAttendanceAlerts = studentStats
      .filter(s => s.percentage < 75 && s.totalClasses > 0)
      .sort((a, b) => a.percentage - b.percentage);

    const absentStudentsCount = todayTotal > 0 ? todayAbsent : 0;

    // 4. Trend Line Chart (Last 15 days of activity)
    const datesList = [...new Set(allAttendance.map(r => r.dateString))].sort();
    const last15Dates = datesList.slice(-15);
    const trendChart = last15Dates.map(dateStr => {
      const dayRecs = allAttendance.filter(r => r.dateString === dateStr);
      const present = dayRecs.filter(r => r.status === 'present').length;
      const total = dayRecs.length;
      // Convert YYYY-MM-DD to readable format like "Jun 15"
      const dateObj = new Date(dateStr);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return {
        date: formattedDate,
        rawDate: dateStr,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    });

    // 5. Present/Absent Pie Chart (Based on overall history)
    const totalPresentCount = allAttendance.filter(r => r.status === 'present').length;
    const totalAbsentCount = allAttendance.length - totalPresentCount;
    const pieChart = [
      { name: 'Present', value: totalPresentCount, color: '#10B981' }, // Emerald
      { name: 'Absent', value: totalAbsentCount, color: '#EF4444' }   // Red
    ];

    // 6. Monthly Attendance Bar Chart
    const monthlyGroups = {};
    allAttendance.forEach(rec => {
      // Extract month name (e.g. "Jun 2026")
      const dateObj = new Date(rec.dateString);
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
      if (!monthlyGroups[monthName]) {
        monthlyGroups[monthName] = [];
      }
      monthlyGroups[monthName].push(rec);
    });

    const monthlyChart = Object.keys(monthlyGroups).map(month => {
      const recs = monthlyGroups[month];
      return {
        month,
        percentage: getAttendanceRateForRecords(recs)
      };
    }).sort((a, b) => new Date(a.month) - new Date(b.month)); // Chronological order

    // 7. Department Statistics Breakdown
    const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration'];
    const departmentStats = departments.map(dept => {
      const deptStudents = allStudents.filter(s => s.department === dept);
      const deptStudentIds = deptStudents.map(s => s.studentId);
      const deptRecs = allAttendance.filter(r => deptStudentIds.includes(r.studentId));
      
      return {
        department: dept,
        studentCount: deptStudents.length,
        percentage: deptRecs.length > 0 ? getAttendanceRateForRecords(deptRecs) : 100
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          overallPercentage,
          todayAttendancePercentage: todayPercentage,
          absentStudentsCount,
          activeDate: activeDateStr,
          isTodayMarked: todayRecords.length > 0
        },
        charts: {
          trendChart,
          pieChart,
          monthlyChart,
          departmentStats
        },
        lowAttendanceAlerts,
        allStudentStats: studentStats
      }
    });
  } catch (err) {
    console.error(`GetDashboardStats Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error compiling dashboard analytics' });
  }
};

// @desc    Get detailed report data for export
// @route   GET /api/analytics/report
// @access  Private
exports.getReportData = async (req, res) => {
  try {
    const { department, studentId, startDate, endDate } = req.query;
    
    let allStudents = [];
    let allAttendance = [];

    if (global.useMockDb) {
      allStudents = mockStore.getStudents();
      allAttendance = mockStore.getAttendance();
    } else {
      allStudents = await Student.find({});
      allAttendance = await Attendance.find({});
    }

    // Filter students by department / studentId
    let filteredStudents = allStudents;
    if (department && department !== 'All') {
      filteredStudents = filteredStudents.filter(s => s.department === department);
    }
    if (studentId) {
      filteredStudents = filteredStudents.filter(s => s.studentId === studentId);
    }

    const filteredStudentIds = filteredStudents.map(s => s.studentId);

    // Filter attendance records by student list & dates
    let filteredRecs = allAttendance.filter(r => filteredStudentIds.includes(r.studentId));

    if (startDate) {
      filteredRecs = filteredRecs.filter(r => r.dateString >= startDate);
    }
    if (endDate) {
      filteredRecs = filteredRecs.filter(r => r.dateString <= endDate);
    }

    // Formulate final report table rows
    const reportData = filteredRecs.map(rec => {
      const student = allStudents.find(s => s.studentId === rec.studentId);
      const studentHistory = allAttendance.filter(r => r.studentId === rec.studentId);
      return {
        studentId: rec.studentId,
        studentName: student ? student.name : 'Unknown',
        department: student ? student.department : 'N/A',
        email: student ? student.email : 'N/A',
        date: rec.dateString,
        status: rec.status,
        remarks: rec.remarks || '',
        overallPercentage: getAttendanceRateForRecords(studentHistory)
      };
    });

    // Sort descending by date, then studentId ascending
    reportData.sort((a, b) => b.date.localeCompare(a.date) || a.studentId.localeCompare(b.studentId));

    // Summary of filters applied
    const totalPresent = filteredRecs.filter(r => r.status === 'present').length;
    const totalRecords = filteredRecs.length;
    const summaryPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    res.json({
      success: true,
      summary: {
        totalRecords,
        totalPresent,
        totalAbsent: totalRecords - totalPresent,
        percentage: summaryPercentage
      },
      data: reportData
    });
  } catch (err) {
    console.error(`GetReportData Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error generating reports' });
  }
};
