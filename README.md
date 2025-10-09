# 🎨 README UI — Hệ thống Quản lý Đăng ký Học theo Tín chỉ

## Thành viên
- Đỗ Hoài Nam — 22014002
- Nguyễn Văn Minh — 22010049

Tài liệu README này **được thiết kế lại** để tập trung vào **trình bày giao diện** cho 12 giao diện của chương trình quản lí tín chỉ học phần
## 1) Tổng quan UI/UX
- **Mục tiêu**: rõ ràng, nhất quán, hỗ trợ thao tác nhanh trong giờ cao điểm đăng ký.
- **Thiết kế**: Layout 2 cột (Sidebar + Content), card bo góc, bóng nhẹ, khoảng trắng thoáng.
- **Hệ màu**: trung tính + nhấn màu thương hiệu ở nút chính & trạng thái.
- **Trạng thái**: loading skeleton, empty state có CTA, lỗi có hướng dẫn khắc phục.
- **Khả năng truy cập**: focus ring, keyboard nav, tương phản màu WCAG AA.
- **Phản hồi**: toast/alert, inline validation, progress indicators.

## 2) Các trang giao diện (12)
#### AdminDashboard
- **Đường dẫn**: `/admin`
- **Vai trò**: Quản trị
- **Mục tiêu UI**:
  - Tổng quan hệ thống
  - Số liệu nhanh
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### CourseDetail
- **Đường dẫn**: `/courses/:id`
- **Vai trò**: Sinh viên / Giảng viên
- **Mục tiêu UI**:
  - Chi tiết đề cương
  - Lớp mở, sĩ số, lịch học
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### CourseManagement
- **Đường dẫn**: `/admin/courses`
- **Vai trò**: Quản trị / Giảng viên
- **Mục tiêu UI**:
  - CRUD môn học
  - Quản lý đề cương/tài liệu
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### Courses
- **Đường dẫn**: `/courses`
- **Vai trò**: Sinh viên / Giảng viên / Quản trị
- **Mục tiêu UI**:
  - Lọc/ tìm kiếm môn
  - Đăng ký nhanh từ danh sách
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### Dashboard
- **Đường dẫn**: `/student`
- **Vai trò**: Sinh viên
- **Mục tiêu UI**:
  - Tổng quan lịch học/thi
  - Thông báo & tiến độ tín chỉ
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### Login
- **Đường dẫn**: `/login`
- **Vai trò**: Công khai
- **Mục tiêu UI**:
  - Xác thực với email/mật khẩu
  - Quên mật khẩu (link)
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### MyRegistrations
- **Đường dẫn**: `/registrations`
- **Vai trò**: Sinh viên
- **Mục tiêu UI**:
  - Danh sách học phần đã đăng ký
  - Hủy/đổi lớp (theo kỳ)
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### Profile
- **Đường dẫn**: `/profile`
- **Vai trò**: Sinh viên / Giảng viên / Quản trị
- **Mục tiêu UI**:
  - Cập nhật hồ sơ
  - Đổi mật khẩu
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### Register
- **Đường dẫn**: `/register`
- **Vai trò**: Công khai
- **Mục tiêu UI**:
  - Tạo tài khoản mới
  - Xác thực form & thông báo lỗi
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### RegistrationManagement
- **Đường dẫn**: `/admin/registrations`
- **Vai trò**: Quản trị / Giảng viên
- **Mục tiêu UI**:
  - Duyệt đơn đăng ký
  - Xử lý trùng lịch, vượt tín
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### SemesterManagement
- **Đường dẫn**: `/admin/semesters`
- **Vai trò**: Quản trị
- **Mục tiêu UI**:
  - Tạo kỳ học
  - Khung thời gian đăng ký
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast

#### UserManagement
- **Đường dẫn**: `/admin/users`
- **Vai trò**: Quản trị
- **Mục tiêu UI**:
  - CRUD người dùng
  - Phân quyền & reset mật khẩu
- **Thành phần gợi ý**: Header (role-aware), Sidebar (nếu có), Content card, Data table, Pagination, Filters, Dialog/Drawer, Toast


---

## 3) Điều hướng & Phân quyền
- **React Router**: bảo vệ route theo vai trò (`role: student|teacher|admin`)
- **Redirect**: sau đăng nhập chuyển đến dashboard theo role
- **Breadcrumbs**: cho các trang nhiều cấp (Course → Detail)

## 4) Mẫu component (Tailwind) — đề xuất
- **AppShell**: Header, Sidebar (nav theo role), Main, Footer
- **DataTable**: table + pagination + sort + filter + row actions
- **Form**: React Hook Form + zod resolver + inline error
- **Modal/Drawer**: xác nhận đăng ký/hủy, tạo-sửa nhanh
- **EmptyState**: icon + mô tả + nút hành động
- **StatCard**: số liệu nhanh (đăng ký, lớp mở, tín chỉ)

## 5) Quy ước coding
- **Tách lớp**: `components/`, `pages/`, `services/`, `contexts/`
- **Dịch vụ API**: axios instance + interceptors (JWT)
- **UI State**: React Context/Query tùy nhu cầu
- **CSS**: Tailwind + @apply cho pattern lặp
- **Icon**: Lucide React, dùng nhất quán

## 6) Tệp nguồn tham chiếu (12 page files)
- `AdminDashboard.js` — `sandbox:/mnt/data/pages/pages/AdminDashboard.js`
- `CourseDetail.js` — `sandbox:/mnt/data/pages/pages/CourseDetail.js`
- `CourseManagement.js` — `sandbox:/mnt/data/pages/pages/CourseManagement.js`
- `Courses.js` — `sandbox:/mnt/data/pages/pages/Courses.js`
- `Dashboard.js` — `sandbox:/mnt/data/pages/pages/Dashboard.js`
- `Login.js` — `sandbox:/mnt/data/pages/pages/Login.js`
- `MyRegistrations.js` — `sandbox:/mnt/data/pages/pages/MyRegistrations.js`
- `Profile.js` — `sandbox:/mnt/data/pages/pages/Profile.js`
- `Register.js` — `sandbox:/mnt/data/pages/pages/Register.js`
- `RegistrationManagement.js` — `sandbox:/mnt/data/pages/pages/RegistrationManagement.js`
- `SemesterManagement.js` — `sandbox:/mnt/data/pages/pages/SemesterManagement.js`
- `UserManagement.js` — `sandbox:/mnt/data/pages/pages/UserManagement.js`


Phần **Phụ lục** chứa trích đoạn 40 dòng đầu từ từng file để tiện đối chiếu: [APPENDIX_code_previews.md](sandbox:/mnt/data/APPENDIX_code_previews.md).

---

## 7) Hướng dẫn triển khai nhanh (nhắc lại)
```bash
npm install
npm run dev
# frontend
cd client && npm install && npm start
```

## 8) Gợi ý cải tiến tiếp theo
- Thêm **ảnh chụp** hoặc **wireframe** cho mỗi trang
- Tạo bộ **Figma UI Kit** (button, input, table, modal)
- Sinh sẵn **mẫu mã React** cho từng trang theo mô tả trên
- Viết test e2e (Playwright) cho các luồng đăng ký chính

---

*README này sinh tự động dựa trên 12 tệp trang React trong gói nén.*
