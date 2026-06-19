const bcrypt = require('bcryptjs');

// In-Memory Database State
let users = [];
let students = [];
let attendance = [];

// Seed Helper: Get Date String (YYYY-MM-DD)
const getDateString = (date) => {
  return date.toISOString().split('T')[0];
};

// Initialize Seed Data
const initializeMockDB = () => {
  console.log('🌱 Seeding Mock Database with rich sample data...');

  // 1. Seed Users (Admin & Student)
  users = [
    {
      _id: 'u1',
      name: 'System Admin',
      email: 'admin@smartattendance.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      studentId: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      _id: 'u2',
      name: 'John Doe (Student)',
      email: 'john@smartattendance.com',
      password: bcrypt.hashSync('student123', 10),
      role: 'student',
      studentId: 'S101',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ];

  // 2. Seed Students
  students = [
    { _id: 's1', studentId: 'S101', name: 'John Doe', email: 'john@smartattendance.com', department: 'Computer Science', joinedDate: new Date('2025-09-01') },
    { _id: 's2', studentId: 'S102', name: 'Jane Smith', email: 'jane@smartattendance.com', department: 'Computer Science', joinedDate: new Date('2025-09-01') },
    { _id: 's3', studentId: 'S103', name: 'Alex Johnson', email: 'alex@smartattendance.com', department: 'Electrical Engineering', joinedDate: new Date('2025-09-05') },
    { _id: 's4', studentId: 'S104', name: 'Emily Brown', email: 'emily@smartattendance.com', department: 'Mechanical Engineering', joinedDate: new Date('2025-09-05') },
    { _id: 's5', studentId: 'S105', name: 'Michael Davis', email: 'michael@smartattendance.com', department: 'Business Administration', joinedDate: new Date('2025-09-10') },
    { _id: 's6', studentId: 'S106', name: 'Sarah Wilson', email: 'sarah@smartattendance.com', department: 'Computer Science', joinedDate: new Date('2025-09-10') },
    { _id: 's7', studentId: 'S107', name: 'David Martinez', email: 'david@smartattendance.com', department: 'Electrical Engineering', joinedDate: new Date('2025-09-12') },
    { _id: 's8', studentId: 'S108', name: 'Jessica Taylor', email: 'jessica@smartattendance.com', department: 'Mechanical Engineering', joinedDate: new Date('2025-09-12') },
    { _id: 's9', studentId: 'S109', name: 'James Anderson', email: 'james@smartattendance.com', department: 'Business Administration', joinedDate: new Date('2025-09-15') },
    { _id: 's10', studentId: 'S110', name: 'Robert Thomas', email: 'robert@smartattendance.com', department: 'Computer Science', joinedDate: new Date('2025-09-15') },
  ];

  // Enrich Students with detailed Profile data
  students = students.map((s, index) => {
    const genders = ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Male'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '1st Year', '2nd Year', '3rd Year', '4th Year', '2nd Year', '3rd Year'];
    const semesters = ['Semester 1', 'Semester 3', 'Semester 5', 'Semester 7', 'Semester 1', 'Semester 3', 'Semester 5', 'Semester 7', 'Semester 3', 'Semester 5'];
    const classes = ['Alpha', 'Beta', 'Gamma', 'Delta'];
    const deptCodes = {
      'Computer Science': 'CS',
      'Electrical Engineering': 'EE',
      'Mechanical Engineering': 'ME',
      'Business Administration': 'BA'
    };
    const code = deptCodes[s.department] || 'UN';
    
    return {
      ...s,
      phone: `+1 (555) 010-01${10 + index}`,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name.replace(/ /g, '')}`,
      dateOfBirth: `200${3 + (index % 2)}-0${1 + (index % 8)}-${10 + index}`,
      gender: genders[index] || 'Other',
      address: `${100 + index * 12} University Lane, Campus Circle, Suite ${5 + index}`,
      class: `${code}-${classes[index % classes.length]}`,
      year: years[index],
      semester: semesters[index],
      rollNumber: `${code}-2026-${10 + index}`,
      admissionDate: new Date(s.joinedDate.getTime() - 15 * 24 * 60 * 60 * 1000)
    };
  });

  // Also make sure to add student user accounts if needed
  students.forEach((student, index) => {
    if (student.studentId !== 'S101') {
      users.push({
        _id: `u_student_${index + 3}`,
        name: student.name,
        email: student.email,
        password: bcrypt.hashSync('student123', 10),
        role: 'student',
        studentId: student.studentId,
        createdAt: new Date()
      });
    }
  });

  // 3. Seed Attendance Records for the last 30 days
  // Let's seed records for all students for each of the last 30 days (excluding today, which the user can mark)
  const today = new Date();
  const attendanceRate = {
    'S101': 0.85, // John Doe - 85%
    'S102': 0.95, // Jane Smith - 95%
    'S103': 0.68, // Alex Johnson - 68% (Low Attendance Alert!)
    'S104': 0.90, // Emily Brown - 90%
    'S105': 0.72, // Michael Davis - 72% (Low Attendance Alert!)
    'S106': 0.88, // Sarah Wilson - 88%
    'S107': 0.60, // David Martinez - 60% (Low Attendance Alert!)
    'S108': 0.92, // Jessica Taylor - 92%
    'S109': 0.78, // James Anderson - 78%
    'S110': 0.96, // Robert Thomas - 96%
  };

  for (let i = 30; i >= 1; i--) {
    const logDate = new Date();
    logDate.setDate(today.getDate() - i);
    
    // Skip weekends (Saturday and Sunday)
    const dayOfWeek = logDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = getDateString(logDate);

    students.forEach((student) => {
      // Determine status based on designated attendance rate + slight randomness
      const rate = attendanceRate[student.studentId] || 0.80;
      const status = Math.random() < rate ? 'present' : 'absent';
      
      attendance.push({
        _id: `att_${dateStr}_${student.studentId}`,
        student: student._id,
        studentId: student.studentId,
        date: new Date(logDate),
        dateString: dateStr,
        status: status,
        markedBy: 'u1',
        remarks: status === 'absent' ? 'Late / No Show' : 'On Time'
      });
    });
  }

  console.log(`✅ Seeded ${users.length} Users, ${students.length} Students, and ${attendance.length} Attendance records.`);
};

// Auto-initialize when mock database is required
initializeMockDB();

const mockStore = {
  // User Operations
  getUsers: () => users,
  findUserByEmail: (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => users.find(u => u._id === id),
  addUser: (user) => {
    const newUser = {
      _id: `u_${Date.now()}`,
      ...user,
      createdAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  // Student Operations
  getStudents: () => students,
  findStudentById: (id) => students.find(s => s._id === id || s.studentId === id),
  addStudent: (studentData) => {
    const newStudent = {
      _id: `s_${Date.now()}`,
      ...studentData,
      joinedDate: new Date()
    };
    students.push(newStudent);
    
    // Auto-create a student user account
    users.push({
      _id: `u_student_${newStudent._id}`,
      name: newStudent.name,
      email: newStudent.email,
      password: bcrypt.hashSync('student123', 10), // default student password
      role: 'student',
      studentId: newStudent.studentId,
      createdAt: new Date()
    });

    return newStudent;
  },
  updateStudent: (id, studentData) => {
    const index = students.findIndex(s => s._id === id || s.studentId === id);
    if (index === -1) return null;
    
    students[index] = { ...students[index], ...studentData };
    
    // Also update associated user account if email/name changes
    const userIndex = users.findIndex(u => u.studentId === students[index].studentId);
    if (userIndex !== -1) {
      users[userIndex].name = students[index].name;
      users[userIndex].email = students[index].email;
    }
    
    return students[index];
  },
  deleteStudent: (id) => {
    const student = students.find(s => s._id === id || s.studentId === id);
    if (!student) return false;

    // Delete student
    students = students.filter(s => s._id !== student._id);
    // Delete user
    users = users.filter(u => u.studentId !== student.studentId);
    // Delete attendance
    attendance = attendance.filter(att => att.studentId !== student.studentId);
    
    return true;
  },

  // Attendance Operations
  getAttendance: () => attendance,
  markAttendance: (records, markedById) => {
    const today = new Date();
    
    records.forEach(rec => {
      const { studentId, dateString, status, remarks } = rec;
      const student = students.find(s => s.studentId === studentId);
      if (!student) return;

      const dateStr = dateString || getDateString(today);
      const existingIndex = attendance.findIndex(att => att.studentId === studentId && att.dateString === dateStr);

      const attendanceRecord = {
        student: student._id,
        studentId: studentId,
        date: new Date(dateStr),
        dateString: dateStr,
        status: status,
        markedBy: markedById || 'u1',
        remarks: remarks || ''
      };

      if (existingIndex !== -1) {
        attendance[existingIndex] = {
          ...attendance[existingIndex],
          ...attendanceRecord,
          _id: attendance[existingIndex]._id
        };
      } else {
        attendanceRecord._id = `att_${dateStr}_${studentId}`;
        attendance.push(attendanceRecord);
      }
    });

    return true;
  }
};

module.exports = mockStore;
