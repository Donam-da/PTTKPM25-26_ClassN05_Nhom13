import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Eye
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
    activeSemesters: 0
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, coursesRes, registrationsRes, semestersRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/courses'),
        api.get('/api/registrations'),
        api.get('/api/semesters')
      ]);

      const users = usersRes.data.users;
      const courses = coursesRes.data.courses;
      const registrations = registrationsRes.data.registrations;
      const semesters = semestersRes.data;

      // Calculate stats
      const totalStudents = users.filter(u => u.role === 'student').length;
      const totalTeachers = users.filter(u => u.role === 'teacher').length;
      const pendingRegistrations = registrations.filter(r => r.status === 'pending').length;
      const approvedRegistrations = registrations.filter(r => r.status === 'approved').length;
      const activeSemesters = semesters.filter(s => s.isActive).length;

      setStats({
        totalUsers: users.length,
        totalStudents,
        totalTeachers,
        totalCourses: courses.length,
        totalRegistrations: registrations.length,
        pendingRegistrations,
        approvedRegistrations,
        activeSemesters
      });

      // Set recent data
      setRecentRegistrations(registrations.slice(0, 5));
      setRecentUsers(users.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
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

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student': return 'Sinh viên';
      case 'teacher': return 'Giảng viên';
      case 'admin': return 'Quản trị viên';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Quản trị</h1>
        <p className="mt-2 text-sm text-gray-700">
          Tổng quan hệ thống và quản lý
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-600" />
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
              <ClipboardList className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng đăng ký</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Học kỳ hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeSemesters}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phân bố người dùng</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Sinh viên</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Giảng viên</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.totalTeachers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Quản trị viên</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.totalUsers - stats.totalStudents - stats.totalTeachers}</span>
            </div>
          </div>
        </div>

        {/* Registration Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái đăng ký</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Chờ duyệt</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.pendingRegistrations}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Đã duyệt</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.approvedRegistrations}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hoàn thành</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.totalRegistrations - stats.pendingRegistrations - stats.approvedRegistrations}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Quản lý người dùng</p>
              <p className="text-xs text-gray-500">Thêm, sửa, xóa người dùng</p>
            </div>
          </Link>

          <Link
            to="/admin/courses"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Quản lý khóa học</p>
              <p className="text-xs text-gray-500">Tạo và chỉnh sửa khóa học</p>
            </div>
          </Link>

          <Link
            to="/admin/registrations"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="h-6 w-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Quản lý đăng ký</p>
              <p className="text-xs text-gray-500">Duyệt và quản lý đăng ký</p>
            </div>
          </Link>

          <Link
            to="/admin/semesters"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-6 w-6 text-orange-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Quản lý học kỳ</p>
              <p className="text-xs text-gray-500">Cấu hình học kỳ mới</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Đăng ký gần đây</h3>
              <Link
                to="/admin/registrations"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentRegistrations.length > 0 ? (
              <div className="space-y-4">
                {recentRegistrations.map((registration) => (
                  <div key={registration._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {registration.course?.courseName || 'Khóa học'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {registration.student?.firstName} {registration.student?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(registration.status)}`}>
                        {getStatusDisplayName(registration.status)}
                      </span>
                      <Link
                        to={`/admin/registrations/${registration._id}`}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Chưa có đăng ký nào</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Người dùng gần đây</h3>
              <Link
                to="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Chưa có người dùng nào</p>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm font-medium text-green-900">Hệ thống hoạt động</p>
            <p className="text-xs text-green-600">Tất cả dịch vụ đang chạy</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-blue-900">Hiệu suất tốt</p>
            <p className="text-xs text-blue-600">Phản hồi nhanh</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <AlertCircle className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-purple-900">Cần chú ý</p>
            <p className="text-xs text-purple-600">{stats.pendingRegistrations} đăng ký chờ duyệt</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 