const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dateString: {
    type: String, // format: YYYY-MM-DD for timezone-safe daily matching
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String,
    default: ''
  }
});

// Ensure a student can only have one attendance record per day
AttendanceSchema.index({ student: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
