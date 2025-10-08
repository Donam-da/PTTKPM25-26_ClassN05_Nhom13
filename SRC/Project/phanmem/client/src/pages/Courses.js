import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  Eye,
  Plus
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    major: '',
    year: '',
    semester: '',
    category: '',
    isActive: true
  });
  const [majors, setMajors] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchFilterOptions();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (filters.major) params.append('major', filters.major);
      if (filters.year) params.append('year', filters.year);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.category) params.append('category', filters.category);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

      const response = await api.get(`/api/courses?${params.toString()}`);
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/api/courses');
      const allCourses = response.data.courses;

      // Extract unique values for filters
      const uniqueMajors = [...new Set(allCourses.map(c => c.major))].filter(Boolean);
      const uniqueYears = [...new Set(allCourses.map(c => c.yearLevel))].filter(Boolean).sort();
      const uniqueSemesters = [...new Set(allCourses.map(c => c.semesterNumber))].filter(Boolean).sort();

      setMajors(uniqueMajors);
      setYears(uniqueYears);
      setSemesters(uniqueSemesters);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const clearFilters = () => {
    setFilters({
      major: '',
      year: '',
      semester: '',
      category: '',
      isActive: true
    });
    setSearchTerm('');
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

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Đang mở' : 'Đã đóng';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khóa học</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tìm kiếm và đăng ký các khóa học phù hợp với bạn
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Link
            to="/admin/courses"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quản lý khóa học
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khóa học theo tên, mã hoặc mô tả..."
              className="input-field pl-10"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="sr-only">Tìm kiếm</span>
            </button>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </button>
            {Object.values(filters).some(v => v !== '' && v !== true) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="form-label">Ngành học</label>
                <select
                  value={filters.major}
                  onChange={(e) => setFilters({ ...filters, major: e.target.value })}
                  className="input-field"
                >
                  <option value="">Tất cả ngành</option>
                  {majors.map((major) => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Năm học</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="input-field"
                >
                  <option value="">Tất cả năm</option>
                  {years.map((year) => (
                    <option key={year} value={year}>Năm {year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Học kỳ</label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="input-field"
                >
                  <option value="">Tất cả học kỳ</option>
                  {semesters.map((semester) => (
                    <option key={semester} value={semester}>Học kỳ {semester}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Loại khóa học</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input-field"
                >
                  <option value="">Tất cả loại</option>
                  <option value="required">Bắt buộc</option>
                  <option value="elective">Tự chọn</option>
                  <option value="general">Đại cương</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Course Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {course.courseName}
                    </h3>
                    <p className="text-sm text-gray-500">{course.courseCode}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.isActive)}`}>
                    {getStatusText(course.isActive)}
                  </span>
                </div>

                {/* Course Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{course.credits} tín chỉ</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2 text-green-500" />
                    <span>{course.major}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{course.currentStudents}/{course.maxStudents} sinh viên</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                    <span>Năm {course.yearLevel} - Học kỳ {course.semesterNumber}</span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                    {getCategoryDisplayName(course.category)}
                  </span>
                </div>

                {/* Course Description */}
                {course.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link
                    to={`/courses/${course._id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Chi tiết
                  </Link>

                  {user?.role === 'student' && course.isActive && (
                    <Link
                      to={`/courses/${course._id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Đăng ký
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy khóa học</h3>
          <p className="mt-1 text-sm text-gray-500">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
          </p>
        </div>
      )}

      {/* Results Summary */}
      {courses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 text-center">
            Hiển thị {courses.length} khóa học
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses; 