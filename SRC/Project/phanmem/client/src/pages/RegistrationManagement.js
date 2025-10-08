import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const RegistrationManagement = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/api/registrations');
      setRegistrations(response.data.registrations);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId) => {
    try {
      await api.put(`/api/registrations/${registrationId}/approve`);
      toast.success('Phê duyệt đăng ký thành công');
      fetchRegistrations();
    } catch (error) {
      toast.error('Lỗi khi phê duyệt đăng ký');
    }
  };

  const handleReject = async (registrationId) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (reason) {
      try {
        await api.put(`/api/registrations/${registrationId}/reject`, { reason });
        toast.success('Từ chối đăng ký thành công');
        fetchRegistrations();
      } catch (error) {
        toast.error('Lỗi khi từ chối đăng ký');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'dropped':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ phê duyệt';
      case 'approved':
        return 'Đã phê duyệt';
      case 'rejected':
        return 'Đã từ chối';
      case 'dropped':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = registration.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.course?.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || registration.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý đăng ký khóa học</h1>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sinh viên hoặc khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ phê duyệt</option>
            <option value="approved">Đã phê duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="dropped">Đã hủy</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredRegistrations.map((registration) => (
            <li key={registration._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {registration.student?.firstName} {registration.student?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        MSSV: {registration.student?.studentId}
                      </p>
                      <p className="text-sm text-gray-500">
                        Khóa học: {registration.course?.courseCode} - {registration.course?.courseName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Học kỳ: {registration.semester?.name} ({registration.semester?.academicYear})
                      </p>
                      <p className="text-sm text-gray-500">
                        Ngày đăng ký: {new Date(registration.registrationDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                        {getStatusText(registration.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {registration.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(registration._id)}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => handleReject(registration._id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RegistrationManagement;
