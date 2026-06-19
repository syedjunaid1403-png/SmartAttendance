const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const mockStore = require('../config/mockStore');

// Helper to compute attendance percentage
const calculatePercentage = (records, studentId) => {
  const studentRecords = records.filter(rec => rec.studentId === studentId);
  if (studentRecords.length === 0) return 100; // default to 100 if no records
  const presentCount = studentRecords.filter(rec => rec.status === 'present').length;
  return Math.round((presentCount / studentRecords.length) * 100);
};

// @desc    Mark attendance for students
// @route   POST /api/attendance/mark
// @access  Private/Admin
exports.markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body; // records = [{ studentId, status, remarks }]
    const markedBy = req.user.id;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide attendance records list' });
    }

    const todayStr = date || new Date().toISOString().split('T')[0];

    if (global.useMockDb) {
      const recordsToMark = records.map(rec => ({
        studentId: rec.studentId,
        dateString: todayStr,
        status: rec.status,
        remarks: rec.remarks || ''
      }));

      mockStore.markAttendance(recordsToMark, markedBy);
      return res.json({ success: true, message: `Attendance marked successfully for date ${todayStr}` });
    } else {
      // For real MongoDB, iterate through records and upsert
      for (const rec of records) {
        const { studentId, status, remarks } = rec;
        
        const studentObj = await Student.findOne({ studentId });
        if (!studentObj) continue;

        await Attendance.findOneAndUpdate(
          { student: studentObj._id, dateString: todayStr },
          {
            student: studentObj._id,
            studentId: studentId,
            date: new Date(todayStr),
            dateString: todayStr,
            status: status,
            markedBy: markedBy,
            remarks: remarks || ''
          },
          { upsert: true, new: true }
        );
      }

      return res.json({ success: true, message: `Attendance marked successfully for date ${todayStr}` });
    }
  } catch (err) {
    console.error(`MarkAttendance Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error marking attendance' });
  }
};

// @desc    Get attendance history with filters
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const { date, department } = req.query;

    if (global.useMockDb) {
      const allAttendance = mockStore.getAttendance();
      const allStudents = mockStore.getStudents();
      
      // Filter students by department first if set
      let targetStudents = allStudents;
      if (department && department !== 'All') {
        targetStudents = allStudents.filter(s => s.department === department);
      }
      
      const targetStudentIds = targetStudents.map(s => s.studentId);

      // Filter attendance records by student IDs and date
      let filteredAttendance = allAttendance.filter(att => targetStudentIds.includes(att.studentId));
      
      if (date) {
        filteredAttendance = filteredAttendance.filter(att => att.dateString === date);
      }

      // Map to return required table data
      const data = filteredAttendance.map(att => {
        const student = allStudents.find(s => s.studentId === att.studentId);
        return {
          _id: att._id,
          studentId: att.studentId,
          studentName: student ? student.name : 'Unknown Student',
          department: student ? student.department : 'N/A',
          date: att.dateString,
          status: att.status,
          remarks: att.remarks,
          attendancePercentage: calculatePercentage(allAttendance, att.studentId)
        };
      });

      // Sort by student ID and Date
      data.sort((a, b) => b.date.localeCompare(a.date) || a.studentId.localeCompare(b.studentId));

      return res.json({ success: true, count: data.length, data });
    } else {
      // MongoDB lookup
      let studentQuery = {};
      if (department && department !== 'All') {
        studentQuery.department = department;
      }
      
      const matchedStudents = await Student.find(studentQuery);
      const studentIds = matchedStudents.map(s => s.studentId);
      const studentObjectIds = matchedStudents.map(s => s._id);

      let attendanceQuery = { student: { $in: studentObjectIds } };
      if (date) {
        attendanceQuery.dateString = date;
      }

      const records = await Attendance.find(attendanceQuery)
        .populate('student', 'name department')
        .sort({ dateString: -1 });

      // Get all attendance history for percentage calculation
      const allHistory = await Attendance.find({ studentId: { $in: studentIds } });

      const data = records.map(att => {
        return {
          _id: att._id,
          studentId: att.studentId,
          studentName: att.student ? att.student.name : 'Unknown Student',
          department: att.student ? att.student.department : 'N/A',
          date: att.dateString,
          status: att.status,
          remarks: att.remarks,
          attendancePercentage: calculatePercentage(allHistory, att.studentId)
        };
      });

      return res.json({ success: true, count: data.length, data });
    }
  } catch (err) {
    console.error(`GetAttendance Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving attendance records' });
  }
};

// @desc    Get single student's attendance profile & history
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const getSubjectStats = (department, baseRate) => {
      const subjects = {
        'Computer Science': ['Data Structures', 'Operating Systems', 'Software Engineering', 'Database Systems'],
        'Electrical Engineering': ['Circuit Theory', 'Signal Processing', 'Control Systems', 'Electromagnetics'],
        'Mechanical Engineering': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Materials Science'],
        'Business Administration': ['Marketing Management', 'Financial Accounting', 'Microeconomics', 'Business Law']
      };
      const list = subjects[department] || ['Course Alpha', 'Course Beta', 'Course Gamma', 'Course Delta'];
      return list.map((subject, idx) => {
        const variation = idx % 2 === 0 ? 5 : -7;
        const rate = Math.min(100, Math.max(0, baseRate + variation));
        return {
          subject,
          percentage: rate,
          total: 20,
          present: Math.round(20 * (rate / 100))
        };
      });
    };

    if (global.useMockDb) {
      const student = mockStore.findStudentById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const allAttendance = mockStore.getAttendance();
      const studentRecords = allAttendance.filter(att => att.studentId === studentId);

      // Sort history descending by date
      studentRecords.sort((a, b) => b.dateString.localeCompare(a.dateString));

      const totalDays = studentRecords.length;
      const presentDays = studentRecords.filter(rec => rec.status === 'present').length;
      const rawAbsentDays = totalDays - presentDays;
      
      // Calculate leave days: absent with remarks containing "leave", "excused", or "sick"
      const leaveDays = studentRecords.filter(rec => 
        rec.status === 'absent' && 
        rec.remarks && 
        (rec.remarks.toLowerCase().includes('leave') || 
         rec.remarks.toLowerCase().includes('excused') || 
         rec.remarks.toLowerCase().includes('sick'))
      ).length;
      
      const absentDays = rawAbsentDays - leaveDays;
      const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
      const subjectsBreakdown = getSubjectStats(student.department, rate);

      return res.json({
        success: true,
        student,
        stats: {
          totalDays,
          presentDays,
          absentDays,
          leaveDays,
          attendancePercentage: rate,
          subjects: subjectsBreakdown
        },
        history: studentRecords.map(rec => ({
          _id: rec._id,
          date: rec.dateString,
          status: rec.status,
          remarks: rec.remarks
        }))
      });
    } else {
      const student = await Student.findOne({ studentId });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const studentRecords = await Attendance.find({ studentId })
        .sort({ dateString: -1 });

      const totalDays = studentRecords.length;
      const presentDays = studentRecords.filter(rec => rec.status === 'present').length;
      const rawAbsentDays = totalDays - presentDays;

      // Calculate leave days
      const leaveDays = studentRecords.filter(rec => 
        rec.status === 'absent' && 
        rec.remarks && 
        (rec.remarks.toLowerCase().includes('leave') || 
         rec.remarks.toLowerCase().includes('excused') || 
         rec.remarks.toLowerCase().includes('sick'))
      ).length;

      const absentDays = rawAbsentDays - leaveDays;
      const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
      const subjectsBreakdown = getSubjectStats(student.department, rate);

      return res.json({
        success: true,
        student,
        stats: {
          totalDays,
          presentDays,
          absentDays,
          leaveDays,
          attendancePercentage: rate,
          subjects: subjectsBreakdown
        },
        history: studentRecords.map(rec => ({
          _id: rec._id,
          date: rec.dateString,
          status: rec.status,
          remarks: rec.remarks
        }))
      });
    }
  } catch (err) {
    console.error(`GetStudentAttendance Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving student attendance history' });
  }
};
