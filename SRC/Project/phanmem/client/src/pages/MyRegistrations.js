import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Clock,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyRegistrations = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/registrations');
      setRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (registrationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      return;
    }

    try {
      await api.put(`/api/registrations/${registrationId}/drop`);
      toast.success('Đã xóa khóa học thành công!');
      fetchRegistrations(); // Refresh list
    } catch (error) {
      console.error('Error dropping course:', error);
      toast.error('Không thể xóa khóa học');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      case 'dropped': return <Trash2 className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  const filteredRegistrations = registrations.filter(registration => {
    if (filter === 'all') return true;
    return registration.status === filter;
  });

  const getTotalCredits = () => {
    return filteredRegistrations
      .filter(r => r.status === 'approved')
      .reduce((total, r) => total + (r.course?.credits || 0), 0);
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
        <h1 className="text-2xl font-bold text-gray-900">Đăng ký của tôi</h1>
        <p className="mt-2 text-sm text-gray-700">
          Quản lý các khóa học bạn đã đăng ký
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng đăng ký</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredRegistrations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã duyệt</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredRegistrations.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredRegistrations.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tín chỉ hiện tại</p>
              <p className="text-2xl font-semibold text-gray-900">{getTotalCredits()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Tất cả ({registrations.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Chờ duyệt ({registrations.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'approved'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Đã duyệt ({registrations.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'completed'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Hoàn thành ({registrations.filter(r => r.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length > 0 ? (
        <div className="space-y-4">
          {filteredRegistrations.map((registration) => (
            <div key={registration._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.status)}`}>
                        {getStatusIcon(registration.status)}
                        <span className="ml-2">{getStatusDisplayName(registration.status)}</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        Đăng ký: {new Date(registration.registrationDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {registration.course?.courseName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{registration.course?.courseCode}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{registration.course?.credits} tín chỉ</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 text-green-500" />
                        <span>{registration.course?.teacher?.firstName} {registration.course?.teacher?.lastName}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Năm {registration.course?.yearLevel} - Học kỳ {registration.course?.semesterNumber}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                        <span>{registration.course?.major}</span>
                      </div>
                    </div>

                    {/* Schedule */}
                    {registration.course?.schedule && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Lịch học:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(Array.isArray(registration.course.schedule) ? registration.course.schedule : [registration.course.schedule]).map((session, index) => {
                            const day = session.day ?? session.dayOfWeek;
                            const numeric = typeof day === 'string' ? parseInt(day, 10) : day;
                            const dayName = !Number.isNaN(numeric) && { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 7: 'Chủ nhật' }[numeric]
                              || { monday: 'Thứ 2', tuesday: 'Thứ 3', wednesday: 'Thứ 4', thursday: 'Thứ 5', friday: 'Thứ 6', saturday: 'Thứ 7', sunday: 'Chủ nhật' }[String(day).toLowerCase()]
                              || String(day);
                            return (
                              <div key={index} className="text-sm text-gray-600">
                                <span className="font-medium">{dayName}</span>
                                <span className="ml-2">{session.startTime} - {session.endTime}</span>
                                {session.room && (
                                  <span className="ml-2 text-gray-500">(Phòng {session.room})</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Grades */}
                    {registration.grade && (registration.grade.attendance || registration.grade.midterm || registration.grade.final) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Điểm số:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {registration.grade.attendance && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">{registration.grade.attendance}</div>
                              <div className="text-xs text-gray-600">Chuyên cần</div>
                            </div>
                          )}
                          {registration.grade.midterm && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">{registration.grade.midterm}</div>
                              <div className="text-xs text-gray-600">Giữ kỳ</div>
                            </div>
                          )}
                          {registration.grade.final && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">{registration.grade.final}</div>
                              <div className="text-xs text-gray-600">Cuối kỳ</div>
                            </div>
                          )}
                        </div>
                        {registration.grade.finalGrade && (
                          <div className="mt-2 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              Điểm cuối: {registration.grade.finalGrade}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex flex-col space-y-2">
                    <Link
                      to={`/courses/${registration.course?._id || registration.course}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Chi tiết
                    </Link>

                    {registration.status === 'approved' && (
                      <button
                        onClick={() => handleDrop(registration._id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'all' ? 'Chưa có đăng ký nào' : 'Không có đăng ký nào phù hợp'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? 'Bạn chưa đăng ký khóa học nào. Hãy tìm và đăng ký khóa học phù hợp.'
              : 'Không có đăng ký nào với trạng thái này.'
            }
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredRegistrations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredRegistrations.length} đăng ký
              {filter !== 'all' && ` với trạng thái "${getStatusDisplayName(filter)}"`}
            </p>
            {filter === 'all' && (
              <p className="text-sm text-gray-500 mt-1">
                Tổng tín chỉ đã đăng ký: {getTotalCredits()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRegistrations; 