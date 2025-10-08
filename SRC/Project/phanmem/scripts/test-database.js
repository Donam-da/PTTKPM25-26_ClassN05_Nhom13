const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Registration = require('../models/Registration');

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/credit_registration', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        return false;
    }
};

// Tạo dữ liệu mẫu
const createSampleData = async () => {
    try {
        console.log('\n🔧 Creating sample data...');

        // 1. Tạo semester mẫu
        const semester = new Semester({
            name: 'Học kỳ 1 năm 2024-2025',
            code: 'HK1_2024_2025',
            academicYear: '2024-2025',
            semesterNumber: 1,
            startDate: new Date('2024-09-01'),
            endDate: new Date('2024-12-31'),
            registrationStartDate: new Date('2024-08-15'),
            registrationEndDate: new Date('2024-09-15'),
            withdrawalDeadline: new Date('2024-10-15'),
            isActive: true,
            isCurrent: true,
            maxCreditsPerStudent: 24,
            minCreditsPerStudent: 12
        });
        await semester.save();
        console.log('✅ Created sample semester');

        // 2. Tạo admin user
        const admin = new User({
            firstName: 'Admin',
            lastName: 'System',
            email: 'admin@university.edu',
            password: 'admin123',
            role: 'admin'
        });
        await admin.save();
        console.log('✅ Created admin user');

        // 3. Tạo teacher
        const teacher = new User({
            firstName: 'Nguyễn',
            lastName: 'Văn Giáo',
            email: 'teacher@university.edu',
            password: 'teacher123',
            role: 'teacher'
        });
        await teacher.save();
        console.log('✅ Created teacher user');

        // 4. Tạo student
        const student = new User({
            firstName: 'Trần',
            lastName: 'Văn Học',
            email: 'student@university.edu',
            password: 'student123',
            role: 'student',
            major: 'Công nghệ thông tin',
            year: 3,
            semester: 5,
            gpa: 3.2,
            currentCredits: 0,
            maxCredits: 24
        });
        await student.save();
        console.log('✅ Created student user');

        // 5. Tạo course mẫu
        const course = new Course({
            courseCode: 'IT101',
            courseName: 'Lập trình cơ bản',
            credits: 3,
            description: 'Khóa học lập trình cơ bản với Java',
            department: 'Công nghệ thông tin',
            major: 'Công nghệ thông tin',
            teacher: teacher._id,
            semester: semester._id,
            schedule: {
                dayOfWeek: 2, // Thứ 2
                startTime: '08:00',
                endTime: '10:00',
                room: 'A101'
            },
            maxStudents: 30,
            currentStudents: 0,
            registrationDeadline: new Date('2024-09-15'),
            withdrawalDeadline: new Date('2024-10-15'),
            isActive: true,
            courseType: 'mandatory',
            yearLevel: 1,
            semesterNumber: 1
        });
        await course.save();
        console.log('✅ Created sample course');

        console.log('\n🎉 Sample data created successfully!');
        console.log('\n📋 Login credentials:');
        console.log('👨‍💼 Admin: admin@university.edu / admin123');
        console.log('👨‍🏫 Teacher: teacher@university.edu / teacher123');
        console.log('👨‍🎓 Student: student@university.edu / student123');

    } catch (error) {
        console.error('❌ Error creating sample data:', error.message);
    }
};

// Kiểm tra collections
const checkCollections = async () => {
    try {
        console.log('\n📊 Checking database collections...');

        const userCount = await User.countDocuments();
        const courseCount = await Course.countDocuments();
        const semesterCount = await Semester.countDocuments();
        const registrationCount = await Registration.countDocuments();

        console.log(`👥 Users: ${userCount}`);
        console.log(`📚 Courses: ${courseCount}`);
        console.log(`📅 Semesters: ${semesterCount}`);
        console.log(`📝 Registrations: ${registrationCount}`);

        return {
            users: userCount,
            courses: courseCount,
            semesters: semesterCount,
            registrations: registrationCount
        };
    } catch (error) {
        console.error('❌ Error checking collections:', error.message);
        return null;
    }
};

// Main function
const main = async () => {
    console.log('🚀 Testing MongoDB Connection and Data...\n');

    // Kết nối database
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    // Kiểm tra collections hiện tại
    const stats = await checkCollections();

    // Nếu chưa có dữ liệu, tạo dữ liệu mẫu
    if (stats && stats.users === 0) {
        console.log('\n📝 No data found. Creating sample data...');
        await createSampleData();
    } else {
        console.log('\n✅ Database already has data');
    }

    // Kiểm tra lại sau khi tạo
    await checkCollections();

    console.log('\n🎯 Database is ready for use!');
    console.log('🌐 You can now start the frontend and test the application');

    mongoose.connection.close();
    process.exit(0);
};

// Chạy script
main().catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
});
