const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a student name'],
    trim: true
  },
  studentId: {
    type: String,
    required: [true, 'Please add a student ID'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  department: {
    type: String,
    required: [true, 'Please specify department/class'],
    enum: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration'],
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: '' // Can store base64 string or URL
  },
  dateOfBirth: {
    type: String,
    default: '' // format: YYYY-MM-DD
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: '' // e.g., Class A, Class B
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', ''],
    default: ''
  },
  semester: {
    type: String,
    enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8', ''],
    default: ''
  },
  rollNumber: {
    type: String,
    default: ''
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
