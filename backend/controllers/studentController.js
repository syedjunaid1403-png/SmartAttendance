const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const mockStore = require('../config/mockStore');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
  try {
    const { search, department, class: studentClass, year } = req.query;

    if (global.useMockDb) {
      let filtered = mockStore.getStudents();

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(query) || 
          s.studentId.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
        );
      }

      if (department && department !== 'All') {
        filtered = filtered.filter(s => s.department === department);
      }

      if (studentClass && studentClass !== 'All') {
        filtered = filtered.filter(s => s.class === studentClass);
      }

      if (year && year !== 'All') {
        filtered = filtered.filter(s => s.year === year);
      }

      return res.json({ success: true, count: filtered.length, data: filtered });
    } else {
      let query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (department && department !== 'All') {
        query.department = department;
      }

      if (studentClass && studentClass !== 'All') {
        query.class = studentClass;
      }

      if (year && year !== 'All') {
        query.year = year;
      }

      const students = await Student.find(query).sort({ studentId: 1 });
      return res.json({ success: true, count: students.length, data: students });
    }
  } catch (err) {
    console.error(`GetStudents Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving students list' });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    const { 
      name, 
      studentId, 
      email, 
      department,
      phone,
      profileImage,
      dateOfBirth,
      gender,
      address,
      class: studentClass,
      year,
      semester,
      rollNumber,
      admissionDate
    } = req.body;

    if (!name || !studentId || !email || !department) {
      return res.status(400).json({ success: false, message: 'Please provide all student fields' });
    }

    if (global.useMockDb) {
      // Check if studentId or email already exists
      const studentsList = mockStore.getStudents();
      const idExists = studentsList.find(s => s.studentId === studentId);
      const emailExists = studentsList.find(s => s.email.toLowerCase() === email.toLowerCase());

      if (idExists) {
        return res.status(400).json({ success: false, message: 'Student ID already exists' });
      }
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Student Email already exists' });
      }

      const newStudent = mockStore.addStudent({ 
        name, 
        studentId, 
        email, 
        department,
        phone: phone || '',
        profileImage: profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/ /g, '')}`,
        dateOfBirth: dateOfBirth || '',
        gender: gender || '',
        address: address || '',
        class: studentClass || '',
        year: year || '',
        semester: semester || '',
        rollNumber: rollNumber || '',
        admissionDate: admissionDate ? new Date(admissionDate) : new Date()
      });
      return res.status(201).json({ success: true, data: newStudent });
    } else {
      // Check uniqueness in database
      const idExists = await Student.findOne({ studentId });
      const emailExists = await Student.findOne({ email });

      if (idExists) {
        return res.status(400).json({ success: false, message: 'Student ID already exists' });
      }
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Student Email already exists' });
      }

      const student = await Student.create({ 
        name, 
        studentId, 
        email, 
        department,
        phone: phone || '',
        profileImage: profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/ /g, '')}`,
        dateOfBirth: dateOfBirth || '',
        gender: gender || '',
        address: address || '',
        class: studentClass || '',
        year: year || '',
        semester: semester || '',
        rollNumber: rollNumber || '',
        admissionDate: admissionDate ? new Date(admissionDate) : new Date()
      });

      // Automatically create a student user account in real DB as well
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('student123', 10); // default password
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'student',
        studentId
      });

      return res.status(201).json({ success: true, data: student });
    }
  } catch (err) {
    console.error(`CreateStudent Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error creating student profile' });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      department,
      phone,
      profileImage,
      dateOfBirth,
      gender,
      address,
      class: studentClass,
      year,
      semester,
      rollNumber,
      admissionDate
    } = req.body;
    const studentIdParam = req.params.id; // Could be database _id or studentId

    if (global.useMockDb) {
      const updated = mockStore.updateStudent(studentIdParam, { 
        name, 
        email, 
        department,
        phone,
        profileImage,
        dateOfBirth,
        gender,
        address,
        class: studentClass,
        year,
        semester,
        rollNumber,
        admissionDate
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      return res.json({ success: true, data: updated });
    } else {
      // In mongoose, find the student first
      let student = await Student.findById(studentIdParam);
      if (!student) {
        student = await Student.findOne({ studentId: studentIdParam });
      }

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      // Update student fields
      student.name = name !== undefined ? name : student.name;
      student.email = email !== undefined ? email : student.email;
      student.department = department !== undefined ? department : student.department;
      student.phone = phone !== undefined ? phone : student.phone;
      student.profileImage = profileImage !== undefined ? profileImage : student.profileImage;
      student.dateOfBirth = dateOfBirth !== undefined ? dateOfBirth : student.dateOfBirth;
      student.gender = gender !== undefined ? gender : student.gender;
      student.address = address !== undefined ? address : student.address;
      student.class = studentClass !== undefined ? studentClass : student.class;
      student.year = year !== undefined ? year : student.year;
      student.semester = semester !== undefined ? semester : student.semester;
      student.rollNumber = rollNumber !== undefined ? rollNumber : student.rollNumber;
      student.admissionDate = admissionDate !== undefined ? new Date(admissionDate) : student.admissionDate;
      
      await student.save();

      // Update linked User profile as well
      await User.findOneAndUpdate(
        { studentId: student.studentId },
        { name: student.name, email: student.email }
      );

      return res.json({ success: true, data: student });
    }
  } catch (err) {
    console.error(`UpdateStudent Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error updating student profile' });
  }
};

// @desc    Delete student profile
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const studentIdParam = req.params.id;

    if (global.useMockDb) {
      const success = mockStore.deleteStudent(studentIdParam);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      return res.json({ success: true, message: 'Student and associated data deleted' });
    } else {
      let student = await Student.findById(studentIdParam);
      if (!student) {
        student = await Student.findOne({ studentId: studentIdParam });
      }

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      // Delete student, User account, and Attendance history
      const studentId = student.studentId;
      await Student.findByIdAndDelete(student._id);
      await User.findOneAndDelete({ studentId });
      await Attendance.deleteMany({ studentId });

      return res.json({ success: true, message: 'Student and associated records deleted successfully' });
    }
  } catch (err) {
    console.error(`DeleteStudent Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error deleting student' });
  }
};
