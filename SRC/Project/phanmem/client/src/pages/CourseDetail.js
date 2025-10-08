import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  User,
  FileText,
  Download,
  Clock3,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    checkRegistrationStatus();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (user?.role === 'student') {
      try {
        const response = await api.get('/api/registrations');
        const userRegistration = response.data.registrations.find(
          r => r.course._id === id || r.course === id
        );
        if (userRegistration) {
          setIsRegistered(true);
          setRegistration(userRegistration);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    }
  };

  const handleRegister = async () => {
    try {
      // Get current semester
      const semesterResponse = await api.get('/api/semesters/current');
      const currentSemester = semesterResponse.data;

      if (!currentSemester) {
        toast.error('Không có học kỳ nào đang mở');
        return;
      }

      const response = await api.post('/api/registrations', {
        courseId: id,
        semesterId: currentSemester._id
      });

      setIsRegistered(true);
      setRegistration(response.data);
      toast.success('Đăng ký khóa học thành công!');
      setShowRegistrationModal(false);
    } catch (error) {
      console.error('Error registering for course:', error);
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const handleDrop = async () => {
    if (!registration) return;

    try {
      await api.put(`/api/registrations/${registration._id}/drop`);
      setIsRegistered(false);
      setRegistration(null);
      toast.success('Đã xóa khóa học thành công!');
    } catch (error) {
      console.error('Error dropping course:', error);
      toast.error('Không thể xóa khóa học');
    }
  };




  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Khóa học không tồn tại</h3>
        <p className="mt-1 text-sm text-gray-500">
          Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <div className="mt-6">
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'dropped': return 'text-gray-600 bg-gray-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'approved': return 'Đã duyệt';
      case 'pending': return 'Chờ duyệt';
      case 'rejected': return 'Từ chối';
      case 'dropped': return 'Đã xóa';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'required': return 'Bắt buộc';
      case 'elective': return 'Tự chọn';
      case 'general': return 'Đại cương';
      default: return category;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'required': return 'bg-red-100 text-red-800';
      case 'elective': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.replace(/(\d{2}):(\d{2})/, '$1:$2');
  };

  const getDayDisplayName = (day) => {
    const numeric = typeof day === 'string' ? parseInt(day, 10) : day;
    const byNumber = { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 7: 'Chủ nhật' };
    if (!Number.isNaN(numeric) && byNumber[numeric]) return byNumber[numeric];
    const byString = {
      'monday': 'Thứ 2',
      'tuesday': 'Thứ 3',
      'wednesday': 'Thứ 4',
      'thursday': 'Thứ 5',
      'friday': 'Thứ 6',
      'saturday': 'Thứ 7',
      'sunday': 'Chủ nhật'
    };
    return byString[String(day).toLowerCase()] || String(day);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/courses"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại danh sách khóa học
        </Link>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(course.category)}`}>
                {getCategoryDisplayName(course.category)}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {course.isActive ? 'Đang mở' : 'Đã đóng'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {course.courseName}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{course.courseCode}</p>

            {course.description && (
              <p className="text-gray-700 text-lg leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
            {user?.role === 'student' && (
              <>
                {!isRegistered ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowRegistrationModal(true)}
                      disabled={!course.isActive}
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Đăng ký khóa học
                    </button>
                    {!course.isActive && (
                      <p className="text-sm text-red-600">Khóa học hiện không hoạt động</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${getStatusColor(registration.status)}`}>
                      {getStatusDisplayName(registration.status)}
                    </span>
                    {registration.status === 'approved' && (
                      <button
                        onClick={handleDrop}
                        className="inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Xóa khóa học
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <Link
                to={`/admin/courses/edit/${course._id}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FileText className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Course Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
              <span className="text-gray-600">Tín chỉ:</span>
              <span className="ml-auto font-medium">{course.credits}</span>
            </div>
            <div className="flex items-center text-sm">
              <GraduationCap className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-gray-600">Ngành:</span>
              <span className="ml-auto font-medium">{course.major}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-5 w-5 text-purple-500 mr-3" />
              <span className="text-gray-600">Năm:</span>
              <span className="ml-auto font-medium">{course.yearLevel}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-5 w-5 text-orange-500 mr-3" />
              <span className="text-gray-600">Học kỳ:</span>
              <span className="ml-auto font-medium">{course.semesterNumber}</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="h-5 w-5 text-indigo-500 mr-3" />
              <span className="text-gray-600">Sinh viên:</span>
              <span className="ml-auto font-medium">{course.currentStudents}/{course.maxStudents}</span>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lịch học</h3>
          {course.schedule ? (
            <div className="space-y-3">
              {(Array.isArray(course.schedule) ? course.schedule : [course.schedule]).map((session, index) => {
                const day = session.day ?? session.dayOfWeek;
                return (
                  <div key={index} className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-600">
                      {getDayDisplayName(day)}
                    </span>
                    <span className="ml-auto text-gray-900">
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}{session.room ? ` • Phòng: ${session.room}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Chưa có lịch học</p>
          )}
        </div>

        {/* Teacher Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Giảng viên</h3>
          {course.teacher ? (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {course.teacher.firstName} {course.teacher.lastName}
                </p>
                <p className="text-sm text-gray-500">{course.teacher.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Chưa phân công giảng viên</p>
          )}
        </div>
      </div>

      {/* Exam Schedule */}
      {course.examSchedule && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lịch thi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-sm">
              <Calendar className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-gray-600">Ngày thi:</span>
              <span className="ml-auto font-medium">
                {new Date(course.examSchedule.date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-gray-600">Giờ thi:</span>
              <span className="ml-auto font-medium">{course.examSchedule.time}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-gray-600">Địa điểm:</span>
              <span className="ml-auto font-medium">
                {course.examSchedule.building} - {course.examSchedule.room}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grading Policy */}
      {course.gradingPolicy && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Chính sách chấm điểm</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{course.gradingPolicy.attendance}%</div>
              <div className="text-sm text-gray-600">Chuyên cần</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{course.gradingPolicy.midterm}%</div>
              <div className="text-sm text-gray-600">Giữ kỳ</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{course.gradingPolicy.final}%</div>
              <div className="text-sm text-gray-600">Cuối kỳ</div>
            </div>
          </div>
        </div>
      )}

      {/* Course Materials */}
      {course.materials && course.materials.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tài liệu khóa học</h3>
          <div className="space-y-3">
            {course.materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{material.title}</p>
                    <p className="text-xs text-gray-500">{material.description}</p>
                  </div>
                </div>
                <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
                  <Download className="h-4 w-4 mr-1" />
                  Tải xuống
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {course.prerequisites && course.prerequisites.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Điều kiện tiên quyết</h3>
          <div className="space-y-2">
            {course.prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-gray-900">{prereq.courseCode} - {prereq.courseName}</span>
                <span className="ml-2 text-gray-500">({prereq.credits} tín chỉ)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Xác nhận đăng ký khóa học
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc chắn muốn đăng ký khóa học <strong>{course.courseName}</strong>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRegister}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail; 