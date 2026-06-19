import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import StudentProfileModal from '../components/StudentProfileModal';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  GraduationCap, 
  UserCheck, 
  Mail,
  Building,
  User,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Lock,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form states
  const [formTab, setFormTab] = useState('personal'); // 'personal' | 'academic' | 'contact'
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [year, setYear] = useState('1st Year');
  const [semester, setSemester] = useState('Semester 1');
  const [rollNumber, setRollNumber] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Profile Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('');

  const { addToast } = useToast();
  const departmentsList = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration'];
  const yearsList = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const semestersList = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
  const classesList = ['CS-Alpha', 'CS-Beta', 'EE-Alpha', 'ME-Alpha', 'BA-Alpha', 'Class A', 'Class B'];

  // Load students
  const fetchStudents = async () => {
    try {
      const res = await api.get('/students', {
        params: { 
          search, 
          department: selectedDept,
          class: selectedClass,
          year: selectedYear
        }
      });
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve student records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedDept, selectedClass, selectedYear]);

  const openAddModal = () => {
    setModalMode('add');
    setFormTab('personal');
    setName('');
    setStudentId('');
    setEmail('');
    setDepartment('Computer Science');
    setPhone('');
    setProfileImage('');
    setDateOfBirth('');
    setGender('Male');
    setAddress('');
    setStudentClass('CS-Alpha');
    setYear('1st Year');
    setSemester('Semester 1');
    setRollNumber('');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setSelectedStudent(null);
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setModalMode('edit');
    setFormTab('personal');
    setSelectedStudent(student);
    setName(student.name || '');
    setStudentId(student.studentId || '');
    setEmail(student.email || '');
    setDepartment(student.department || 'Computer Science');
    setPhone(student.phone || '');
    setProfileImage(student.profileImage || '');
    setDateOfBirth(student.dateOfBirth || '');
    setGender(student.gender || 'Male');
    setAddress(student.address || '');
    setStudentClass(student.class || '');
    setYear(student.year || '1st Year');
    setSemester(student.semester || 'Semester 1');
    setRollNumber(student.rollNumber || '');
    setAdmissionDate(student.admissionDate ? student.admissionDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const openProfileModal = (id) => {
    setSelectedProfileId(id);
    setProfileModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !studentId || !email || !department) {
      addToast('Please fill in Name, ID, Email, and Department.', 'error');
      return;
    }

    setSubmitLoading(true);
    const payload = {
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
    };

    try {
      if (modalMode === 'add') {
        await api.post('/students', payload);
        addToast('Student successfully added!', 'success');
      } else {
        await api.put(`/students/${selectedStudent._id}`, payload);
        addToast('Student profile updated!', 'success');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error processing request.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name} (${student.studentId})? This will permanently erase their entire attendance history.`)) {
      try {
        await api.delete(`/students/${student._id}`);
        addToast('Student profile deleted successfully.', 'success');
        fetchStudents();
      } catch (err) {
        console.error(err);
        addToast('Failed to delete student.', 'error');
      }
    }
  };

  return (
    <Layout title="Student Management">
      
      {/* Search and Filters Controls */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center mb-8">
        
        {/* Search & Select Grid */}
        <div className="w-full xl:w-auto flex flex-col md:flex-row gap-3 items-center flex-grow max-w-4xl">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or ID..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            {/* Dept Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm font-semibold text-xs min-w-[120px]"
            >
              <option value="All">All Departments</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm font-semibold text-xs min-w-[100px]"
            >
              <option value="All">All Classes</option>
              {classesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm font-semibold text-xs min-w-[100px]"
            >
              <option value="All">All Years</option>
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Student Button */}
        <button
          onClick={openAddModal}
          className="w-full xl:w-auto px-5 py-3 rounded-xl text-white font-semibold bg-primary-500 hover:bg-primary-600 active:scale-95 shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Roster Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-gray-200/60 dark:border-gray-800/40">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-900/60 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class / Roll</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No student records match filters.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-mono">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={student.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentId}`} 
                            alt={student.name}
                            className="w-8 h-8 rounded-full border bg-white border-gray-200"
                          />
                          <div className="space-y-0.5">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{student.name}</span>
                            <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-semibold text-gray-850 dark:text-gray-200">{student.class || 'N/A'}</span>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">Roll: {student.rollNumber || '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {student.department}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openProfileModal(student.studentId)}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-emerald-50 dark:bg-dark-900 dark:hover:bg-emerald-950/20 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-colors"
                            title="View Complete Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-primary-50 dark:bg-dark-900 dark:hover:bg-primary-950/20 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 border border-gray-200 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-900/40 transition-colors"
                            title="Edit student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 dark:bg-dark-900 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 border border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/40 transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Roster Modals (Add / Edit) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-6 relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-500">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {modalMode === 'add' ? 'Add New Student' : 'Edit Student Profile'}
                </h3>
              </div>

              {/* Form Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4 gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFormTab('personal')}
                  className={`pb-2 border-b-2 transition-all ${
                    formTab === 'personal' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400'
                  }`}
                >
                  Personal details
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('academic')}
                  className={`pb-2 border-b-2 transition-all ${
                    formTab === 'academic' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400'
                  }`}
                >
                  Academic details
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('contact')}
                  className={`pb-2 border-b-2 transition-all ${
                    formTab === 'contact' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400'
                  }`}
                >
                  Contact & Address
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 py-1">
                
                {/* TAB 1: PERSONAL INFO */}
                {formTab === 'personal' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Name input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                        placeholder="e.g. Robert Downy"
                        required
                      />
                    </div>

                    {/* Email input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                        placeholder="e.g. robert@university.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* DOB Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Date of Birth</label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                        />
                      </div>

                      {/* Gender Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Avatar selection image url */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Avatar Seed or Image URL (Optional)</label>
                      <input
                        type="text"
                        value={profileImage}
                        onChange={(e) => setProfileImage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                        placeholder="e.g. image link or dicebear seed"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: ACADEMIC INFO */}
                {formTab === 'academic' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      {/* ID input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Student ID</label>
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          disabled={modalMode === 'edit'}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs disabled:bg-gray-100 dark:disabled:bg-dark-900/40"
                          placeholder="e.g. S111"
                          required
                        />
                      </div>

                      {/* Roll Number */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Roll Number</label>
                        <input
                          type="text"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                          placeholder="e.g. CS-2026-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Dept select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Department</label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                        >
                          {departmentsList.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      {/* Class */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Class</label>
                        <input
                          type="text"
                          value={studentClass}
                          onChange={(e) => setStudentClass(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                          placeholder="e.g. CS-Alpha"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Year */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Year</label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs font-semibold"
                        >
                          {yearsList.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      {/* Semester */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Semester</label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          className="w-full px-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs font-semibold"
                        >
                          {semestersList.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Admission Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Admission Date</label>
                        <input
                          type="date"
                          value={admissionDate}
                          onChange={(e) => setAdmissionDate(e.target.value)}
                          className="w-full px-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CONTACT & ADDRESS */}
                {formTab === 'contact' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                        placeholder="e.g. +1 (555) 010-0199"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Residential Address</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs h-28 resize-none"
                        placeholder="e.g. 100 University Lane, Suite 10"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 py-3 px-4 rounded-xl text-white font-semibold bg-primary-500 hover:bg-primary-600 active:scale-98 shadow-md shadow-primary-500/10 flex items-center justify-center gap-1.5 transition-all text-xs disabled:opacity-50"
                  >
                    {submitLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      modalMode === 'add' ? 'Save Student' : 'Update Profile'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student complete Profile modal */}
      <StudentProfileModal 
        studentId={selectedProfileId}
        isOpen={profileModalOpen}
        onClose={() => { setProfileModalOpen(false); setSelectedProfileId(''); }}
      />

    </Layout>
  );
};

export default StudentManagement;
