import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await api.put(`/api/users/${userId}`, { isActive: !isActive });
      toast.success('Cập nhật trạng thái thành công');
      fetchUsers();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const openStudentDetail = async (userId) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      const res = await api.get(`/api/users/students/${userId}`);
      setSelectedUser(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết sinh viên');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý người dùng</h1>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="student">Sinh viên</option>
            <option value="teacher">Giảng viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((userItem) => (
            <li key={userItem._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {userItem.firstName} {userItem.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{userItem.email}</div>
                    <div className="text-sm text-gray-500">
                      {userItem.studentId && `MSSV: ${userItem.studentId}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                    userItem.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {userItem.role === 'admin' ? 'Quản trị viên' :
                      userItem.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                  </span>
                  {userItem.role === 'student' && (
                    <button
                      onClick={() => openStudentDetail(userItem._id)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      Chi tiết
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleActive(userItem._id, userItem.isActive)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${userItem.isActive
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                  >
                    {userItem.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium text-gray-900">Chi tiết sinh viên</h3>
              <button onClick={closeDetailModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mt-4">
              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedUser ? (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">Họ tên</span>
                    <span className="col-span-2 text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">Email</span>
                    <span className="col-span-2 text-gray-900">{selectedUser.email}</span>
                  </div>
                  {selectedUser.studentId && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">MSSV</span>
                      <span className="col-span-2 text-gray-900">{selectedUser.studentId}</span>
                    </div>
                  )}
                  {selectedUser.major && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">Ngành</span>
                      <span className="col-span-2 text-gray-900">{selectedUser.major}</span>
                    </div>
                  )}
                  {(selectedUser.year !== undefined || selectedUser.semester !== undefined) && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">Niên khóa</span>
                      <span className="col-span-2 text-gray-900">Năm {selectedUser.year} - Học kỳ {selectedUser.semester}</span>
                    </div>
                  )}
                  {(selectedUser.currentCredits !== undefined || selectedUser.maxCredits !== undefined) && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">Tín chỉ</span>
                      <span className="col-span-2 text-gray-900">{selectedUser.currentCredits || 0}/{selectedUser.maxCredits || 0}</span>
                    </div>
                  )}
                  {selectedUser.phone && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">Điện thoại</span>
                      <span className="col-span-2 text-gray-900">{selectedUser.phone}</span>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">Địa chỉ</span>
                      <span className="col-span-2 text-gray-900">{selectedUser.address}</span>
                    </div>
                  )}
                  {selectedUser.dateOfBirth && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">Ngày sinh</span>
                      <span className="col-span-2 text-gray-900">{new Date(selectedUser.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {selectedUser.gender && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-500">Giới tính</span>
                      <span className="col-span-2 text-gray-900">{selectedUser.gender}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Không có dữ liệu sinh viên.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeDetailModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
