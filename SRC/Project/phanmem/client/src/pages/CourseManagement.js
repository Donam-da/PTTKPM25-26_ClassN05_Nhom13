import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CourseManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    credits: 3,
    description: '',
    department: '',
    major: '',
    yearLevel: 1,
    semesterNumber: 1,
    maxStudents: 50,
    teacher: '',
    semester: '',
    registrationDeadline: '',
    withdrawalDeadline: '',
    schedule: {
      dayOfWeek: 2,
      startTime: '08:00',
      endTime: '10:00',
      room: ''
    },
    courseType: 'elective'
  });

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchSemesters();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data.courses);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/users/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách giảng viên');
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await api.get('/api/semesters');
      setSemesters(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách học kỳ');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      if (editingCourse) {
        await api.put(`/api/courses/${editingCourse._id}`, formData);
        toast.success('Cập nhật khóa học thành công');
      } else {
        await api.post('/api/courses', formData);
        toast.success('Tạo khóa học thành công');
      }
      setShowForm(false);
      setEditingCourse(null);
      setFormData({
        courseCode: '',
        courseName: '',
        credits: 3,
        description: '',
        department: '',
        major: '',
        yearLevel: 1,
        semesterNumber: 1,
        maxStudents: 50,
        teacher: '',
        semester: '',
        registrationDeadline: '',
        withdrawalDeadline: '',
        schedule: {
          dayOfWeek: 2,
          startTime: '08:00',
          endTime: '10:00',
          room: ''
        },
        courseType: 'elective'
      });
      fetchCourses();
    } catch (error) {
      console.error('Course creation error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu khóa học');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      description: course.description || '',
      department: course.department || '',
      major: course.major,
      yearLevel: course.yearLevel,
      semesterNumber: course.semesterNumber,
      maxStudents: course.maxStudents,
      teacher: course.teacher?._id || course.teacher,
      semester: course.semester?._id || course.semester,
      registrationDeadline: course.registrationDeadline ? new Date(course.registrationDeadline).toISOString().split('T')[0] : '',
      withdrawalDeadline: course.withdrawalDeadline ? new Date(course.withdrawalDeadline).toISOString().split('T')[0] : '',
      schedule: {
        dayOfWeek: course.schedule?.dayOfWeek || 2,
        startTime: course.schedule?.startTime || '08:00',
        endTime: course.schedule?.endTime || '10:00',
        room: course.schedule?.room || ''
      },
      courseType: course.courseType || 'elective'
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await api.delete(`/api/courses/${courseId}`);
        toast.success('Xóa khóa học thành công');
        fetchCourses();
      } catch (error) {
        toast.error('Lỗi khi xóa khóa học');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý khóa học</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Thêm khóa học mới
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mã khóa học</label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên khóa học</label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số tín chỉ</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số sinh viên tối đa</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giảng viên</label>
                  <select
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn giảng viên</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Khoa</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Semester Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Học kỳ</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn học kỳ</option>
                    {semesters.map(semester => (
                      <option key={semester._id} value={semester._id}>
                        {semester.name} ({semester.academicYear})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Level and Semester Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Năm học</label>
                    <select
                      value={formData.yearLevel}
                      onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={1}>Năm 1</option>
                      <option value={2}>Năm 2</option>
                      <option value={3}>Năm 3</option>
                      <option value={4}>Năm 4</option>
                      <option value={5}>Năm 5</option>
                      <option value={6}>Năm 6</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Học kỳ trong năm</label>
                    <select
                      value={formData.semesterNumber}
                      onChange={(e) => setFormData({ ...formData, semesterNumber: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={1}>Học kỳ 1</option>
                      <option value={2}>Học kỳ 2</option>
                      <option value={3}>Học kỳ hè</option>
                    </select>
                  </div>
                </div>

                {/* Deadlines */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hạn đăng ký</label>
                    <input
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hạn rút môn</label>
                    <input
                      type="date"
                      value={formData.withdrawalDeadline}
                      onChange={(e) => setFormData({ ...formData, withdrawalDeadline: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Schedule */}
                <div className="border p-4 rounded-md bg-gray-50">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Lịch học</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thứ</label>
                      <select
                        value={formData.schedule.dayOfWeek}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, dayOfWeek: parseInt(e.target.value) }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value={2}>Thứ 2</option>
                        <option value={3}>Thứ 3</option>
                        <option value={4}>Thứ 4</option>
                        <option value={5}>Thứ 5</option>
                        <option value={6}>Thứ 6</option>
                        <option value={7}>Thứ 7</option>
                        <option value={1}>Chủ nhật</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phòng học</label>
                      <input
                        type="text"
                        value={formData.schedule.room}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, room: e.target.value }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: A101"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Giờ bắt đầu</label>
                      <input
                        type="time"
                        value={formData.schedule.startTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, startTime: e.target.value }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Giờ kết thúc</label>
                      <input
                        type="time"
                        value={formData.schedule.endTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, endTime: e.target.value }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Course Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại môn học</label>
                  <select
                    value={formData.courseType}
                    onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mandatory">Bắt buộc</option>
                    <option value="elective">Tự chọn</option>
                    <option value="general">Đại cương</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Mô tả về khóa học..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingCourse ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {courses.map((course) => (
            <li key={course._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {course.courseCode} - {course.courseName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {course.credits} tín chỉ • {course.major} • Năm {course.yearLevel} • Học kỳ {course.semesterNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        Giảng viên: {course.teacher?.firstName} {course.teacher?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Sinh viên: {course.currentStudents}/{course.maxStudents}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {course.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(course)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseManagement;
