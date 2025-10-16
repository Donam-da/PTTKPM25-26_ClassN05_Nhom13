import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  User,
  GraduationCap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const { user, isAdmin, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    currentCredits: 0,
    maxCredits: 24
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }
    if (isTeacher) {
      navigate('/teacher/dashboard');
      return;
    }
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'student') {
          // Fetch student-specific data
          const [registrationsRes, coursesRes] = await Promise.all([
            api.get('/api/registrations'),
            api.get('/api/courses')
          ]);

          const registrations = registrationsRes.data.registrations;
          const courses = coursesRes.data.courses;

          setStats({
            totalCourses: courses.length,
            enrolledCourses: registrations.filter(r => r.status === 'approved').length,
            completedCourses: registrations.filter(r => r.status === 'completed').length,
            currentCredits: user.currentCredits || 0,
            maxCredits: user.maxCredits || 24
          });

          setRecentRegistrations(registrations.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isAdmin, isTeacher, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student': return 'Sinh viên';
      case 'teacher': return 'Giảng viên';
      case 'admin': return 'Quản trị viên';
      default: return role;
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Chào mừng trở lại, {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-gray-600 mt-2">
          {getRoleDisplayName(user?.role)} • {user?.major || 'Hệ thống'}
          {user?.role === 'student' && ` • Năm ${user?.year} • Học kỳ ${user?.semester}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng khóa học</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Khóa học đã đăng ký</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.enrolledCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Khóa học hoàn thành</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedCourses}</p>
            </div>
          </div>
        </div>

        {user?.role === 'student' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tín chỉ hiện tại</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.currentCredits}/{stats.maxCredits}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
        </div>
        <div className="p-6">
          {recentRegistrations.length > 0 ? (
            <div className="space-y-4">
              {recentRegistrations.map((registration) => (
                <div key={registration._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {registration.course?.courseName || 'Khóa học'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {registration.course?.courseCode || 'Mã khóa học'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(registration.status)}`}>
                      {getStatusDisplayName(registration.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(registration.registrationDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có hoạt động</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bạn chưa có đăng ký khóa học nào.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Xem khóa học</p>
                <p className="text-xs text-gray-500">Tìm và đăng ký khóa học mới</p>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Lịch học</p>
                <p className="text-xs text-gray-500">Xem lịch học và lịch thi</p>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <User className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Hồ sơ</p>
                <p className="text-xs text-gray-500">Cập nhật thông tin cá nhân</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Trạng thái hệ thống</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hệ thống hoạt động bình thường</span>
              </div>
              <span className="text-sm text-gray-500">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Cơ sở dữ liệu</span>
              </div>
              <span className="text-sm text-gray-500">Kết nối tốt</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">API Services</span>
              </div>
              <span className="text-sm text-gray-500">Hoạt động</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 