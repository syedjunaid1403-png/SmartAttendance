const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const mockStore = require('../config/mockStore');

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_smart_attendance_key_98765', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (Can restrict if needed, but useful for initial setup)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const selectedRole = role || 'student';

    if (selectedRole === 'student') {
      if (!studentId || !department) {
        return res.status(400).json({ success: false, message: 'Students must provide a Student ID and Department/Class' });
      }
    }

    if (global.useMockDb) {
      const exists = mockStore.findUserByEmail(email);
      if (exists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      if (selectedRole === 'student') {
        const studentExists = mockStore.getStudents().find(s => s.studentId === studentId);
        if (studentExists) {
          return res.status(400).json({ success: false, message: 'Student ID already registered' });
        }
        
        // Add student profile
        mockStore.getStudents().push({
          _id: `s_${Date.now()}`,
          studentId,
          name,
          email,
          department,
          joinedDate: new Date()
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = mockStore.addUser({
        name,
        email,
        password: hashedPassword,
        role: selectedRole,
        studentId: selectedRole === 'student' ? studentId : null
      });

      const token = generateToken(newUser._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          studentId: newUser.studentId
        }
      });
    } else {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      if (selectedRole === 'student') {
        const studentExists = await Student.findOne({ studentId });
        if (studentExists) {
          return res.status(400).json({ success: false, message: 'Student ID already registered' });
        }

        // Create student profile
        await Student.create({
          name,
          studentId,
          email,
          department
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: selectedRole,
        studentId: selectedRole === 'student' ? studentId : null
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId
        }
      });
    }
  } catch (err) {
    console.error(`Register Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    if (global.useMockDb) {
      const user = mockStore.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId
        }
      });
    } else {
      // Find user and select password (since it's hidden by default in mongoose schema)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId
        }
      });
    }
  } catch (err) {
    console.error(`Login Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        studentId: req.user.studentId
      }
    });
  } catch (err) {
    console.error(`GetMe Error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving user data' });
  }
};
