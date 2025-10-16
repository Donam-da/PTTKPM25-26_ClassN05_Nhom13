import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Users, Calendar, Eye } from 'lucide-react';

const TeacherCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await api.get(`/api/courses?teacher=${user.id}`);
                setCourses(response.data.courses);
            } catch (error) {
                console.error('Error fetching teacher courses:', error);
                toast.error('Không thể tải danh sách khóa học.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Danh sách các khóa học bạn đang phụ trách giảng dạy.
                </p>
            </div>

            {courses.length > 0 ? (
                <div className="bg-white shadow-sm rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khóa học</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã học phần</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tín chỉ</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Hành động</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {courses.map((course) => (
                                    <tr key={course._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{course.courseCode}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{course.credits}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{course.semester?.name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/teacher/courses/${course._id}`}
                                                className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                                            >
                                                <Eye className="h-5 w-5 mr-1" />
                                                Xem chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có khóa học</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Bạn hiện chưa được phân công giảng dạy khóa học nào.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TeacherCourses;