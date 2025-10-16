import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Users,
    BookOpen,
    ClipboardList,
    Clock,
    Eye
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        teachingCourses: 0,
        totalStudents: 0,
        pendingRegistrations: 0,
    });
    const [recentRegistrations, setRecentRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                setLoading(true);

                const [coursesRes, registrationsRes] = await Promise.all([
                    api.get(`/api/courses?teacher=${user.id}`),
                    api.get('/api/registrations')
                ]);

                const teacherCourses = coursesRes.data.courses;
                const allRegistrations = registrationsRes.data.registrations;

                const courseIds = teacherCourses.map(c => c._id);

                const relevantRegistrations = allRegistrations.filter(r =>
                    courseIds.includes(r.course?._id)
                );

                const pendingCount = relevantRegistrations.filter(r => r.status === 'pending').length;
                const studentCount = new Set(relevantRegistrations.map(r => r.student?._id)).size;

                setStats({
                    teachingCourses: teacherCourses.length,
                    totalStudents: studentCount,
                    pendingRegistrations: pendingCount,
                });

                setRecentRegistrations(relevantRegistrations.filter(r => r.status === 'pending').slice(0, 5));
            } catch (error) {
                console.error('Error fetching teacher dashboard data:', error);
                toast.error('Không thể tải dữ liệu dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }, []);

    const getStatusDisplayName = useCallback((status) => {
        switch (status) {
            case 'approved': return 'Đã duyệt';
            case 'pending': return 'Chờ duyệt';
            case 'rejected': return 'Từ chối';
            default: return status;
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Chào mừng, {user?.firstName} {user?.lastName}!
                </h1>
                <p className="mt-2 text-sm text-gray-700">
                    Tổng quan về các lớp học và sinh viên của bạn.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Lớp học đang dạy</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.teachingCourses}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Tổng sinh viên</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Đăng ký chờ duyệt</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.pendingRegistrations}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Pending Registrations */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Đăng ký cần duyệt gần đây</h3>
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
                        <p className="text-gray-500 text-sm text-center py-4">Không có đăng ký nào đang chờ duyệt.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;