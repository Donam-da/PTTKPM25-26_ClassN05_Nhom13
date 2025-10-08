import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const SemesterManagement = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    academicYear: '',
    semesterNumber: 1,
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    withdrawalDeadline: '',
    maxCreditsPerStudent: 24,
    minCreditsPerStudent: 12,
    description: ''
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await api.get('/api/semesters');
      setSemesters(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách học kỳ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSemester) {
        await api.put(`/api/semesters/${editingSemester._id}`, formData);
        toast.success('Cập nhật học kỳ thành công');
      } else {
        await api.post('/api/semesters', formData);
        toast.success('Tạo học kỳ thành công');
      }
      setShowForm(false);
      setEditingSemester(null);
      setFormData({
        name: '',
        code: '',
        academicYear: '',
        semesterNumber: 1,
        startDate: '',
        endDate: '',
        registrationStartDate: '',
        registrationEndDate: '',
        withdrawalDeadline: '',
        maxCreditsPerStudent: 24,
        minCreditsPerStudent: 12,
        description: ''
      });
      fetchSemesters();
    } catch (error) {
      toast.error('Lỗi khi lưu học kỳ');
    }
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      code: semester.code,
      academicYear: semester.academicYear,
      semesterNumber: semester.semesterNumber,
      startDate: semester.startDate ? new Date(semester.startDate).toISOString().split('T')[0] : '',
      endDate: semester.endDate ? new Date(semester.endDate).toISOString().split('T')[0] : '',
      registrationStartDate: semester.registrationStartDate ? new Date(semester.registrationStartDate).toISOString().split('T')[0] : '',
      registrationEndDate: semester.registrationEndDate ? new Date(semester.registrationEndDate).toISOString().split('T')[0] : '',
      withdrawalDeadline: semester.withdrawalDeadline ? new Date(semester.withdrawalDeadline).toISOString().split('T')[0] : '',
      maxCreditsPerStudent: semester.maxCreditsPerStudent || 24,
      minCreditsPerStudent: semester.minCreditsPerStudent || 12,
      description: semester.description || ''
    });
    setShowForm(true);
  };

  const handleActivate = async (semesterId) => {
    try {
      await api.put(`/api/semesters/${semesterId}/activate`);
      toast.success('Kích hoạt học kỳ thành công');
      fetchSemesters();
    } catch (error) {
      toast.error('Lỗi khi kích hoạt học kỳ');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý học kỳ</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Thêm học kỳ mới
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSemester ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên học kỳ</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mã học kỳ</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: HK1_2024_2025"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Năm học (định dạng: YYYY-YYYY)</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 2024-2025"
                      pattern="^\d{4}-\d{4}$"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số học kỳ</label>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tín chỉ tối đa</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.maxCreditsPerStudent}
                      onChange={(e) => setFormData({ ...formData, maxCreditsPerStudent: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tín chỉ tối thiểu</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.minCreditsPerStudent}
                      onChange={(e) => setFormData({ ...formData, minCreditsPerStudent: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bắt đầu đăng ký</label>
                    <input
                      type="date"
                      value={formData.registrationStartDate}
                      onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kết thúc đăng ký</label>
                    <input
                      type="date"
                      value={formData.registrationEndDate}
                      onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hạn chót rút môn</label>
                    <input
                      type="date"
                      value={formData.withdrawalDeadline}
                      onChange={(e) => setFormData({ ...formData, withdrawalDeadline: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả (tùy chọn)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Mô tả về học kỳ này..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSemester(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingSemester ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {semesters.map((semester) => (
            <li key={semester._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {semester.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Năm học: {semester.academicYear} • Học kỳ {semester.semesterNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        Từ {new Date(semester.startDate).toLocaleDateString('vi-VN')} đến {new Date(semester.endDate).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Đăng ký: {new Date(semester.registrationStartDate).toLocaleDateString('vi-VN')} - {new Date(semester.registrationEndDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {semester.isCurrent && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Học kỳ hiện tại
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${semester.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {semester.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(semester)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Chỉnh sửa
                  </button>
                  {!semester.isCurrent && (
                    <button
                      onClick={() => handleActivate(semester._id)}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                    >
                      Kích hoạt
                    </button>
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

export default SemesterManagement;
