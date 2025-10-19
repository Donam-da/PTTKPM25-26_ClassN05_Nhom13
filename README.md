# 📚 Hệ thống Quản lý Đăng ký Học theo Tín chỉ

> README tái thiết kế, trình bày trực quan để báo cáo tổng quan dự án.

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Auth-JWT-orange" />
  <img src="https://img.shields.io/badge/Styles-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <a href="#-tinh-nang-chinh">Tính năng</a> ·
  <a href="#-kien-truc--luu-do">Kiến trúc</a> ·
  <a href="#-cong-nghe">Công nghệ</a> ·
  <a href="#-cai-dat--chay">Cài đặt</a> ·
  <a href="#-api-endpoints">API</a> ·
  <a href="#-bao-mat">Bảo mật</a> ·
  <a href="#-deployment">Deployment</a> ·
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 👥 Thành viên
- **Đỗ Hoài Nam** – *22014002*
- **Nguyễn Văn Minh** – *22010049*

---

## ✨ Tóm tắt dự án
Hệ thống web hỗ trợ **đăng ký học theo tín chỉ** cho **sinh viên, giảng viên, quản trị viên**: từ đăng ký/xóa môn, xem lịch – tới quản lý khóa học, nhập điểm, phê duyệt và thống kê. 

---

## ✅ Tính năng chính

### 🎓 Cho Sinh viên
- Đăng ký / xóa học phần (kiểm tra điều kiện, trùng lịch, số tín chỉ)
- Xem **lịch học** & **lịch thi** (tổng hợp đa học phần)
- Theo dõi **điểm số** & **GPA** (theo học kỳ/tổng)
- Xem **thông tin học phần** & **tài liệu**
- Quản lý **hồ sơ cá nhân**

### 👩‍🏫 Cho Giảng viên
- Quản lý **khóa học/học phần**
- Theo dõi danh sách sinh viên
- Quản lý **tài liệu**, **lịch học/thi**
- Duyệt **đăng ký** học phần

### 🛠️ Cho Quản trị viên
- Quản lý **người dùng** (SV/GV), phân quyền
- Quản lý **khóa học** & **học kỳ**
- Theo dõi **thống kê đăng ký**
- Quản lý **cấu hình hệ thống**

> **Nâng cao**: Email thông báo, tải lên tài liệu, thông báo realtime (WebSocket), xuất **Excel/PDF**, tìm kiếm nâng cao, tối ưu mobile.

---

## 🧭 Kiến trúc & Lưu đồ

```
Client (React 18 + Tailwind)
   │   Axios (JWT Interceptor)
   ▼
API Gateway (Express.js)
   │   Middleware: Auth (JWT), Validator, Rate Limiter, Helmet, CORS
   ▼
Service Layer (Controllers)
   │
   ├── Auth Service      ── đăng ký/đăng nhập/refresh/đổi mật khẩu
   ├── User Service      ── hồ sơ & phân quyền
   ├── Course Service    ── khóa học, học phần, tài liệu
   ├── Reg Service       ── đăng ký/xóa, duyệt, kiểm tra điều kiện
   └── Semester Service  ── học kỳ, lịch học/thi
   ▼
MongoDB (Mongoose Models)
```

**Sơ đồ dữ liệu (mô tả nhanh):**
- `User { role: 'student'|'teacher'|'admin', profile, passwordHash }`
- `Course { code, name, credits, teacher, schedule[], documents[] }`
- `Semester { name, startDate, endDate, isActive }`
- `Registration { student, course, status: 'pending'|'approved'|'dropped' }`

---

## 🧰 Công nghệ

### Backend
- **Node.js + Express.js**, **MongoDB + Mongoose**
- **JWT Auth**, **bcrypt**, **express-validator**
- Bảo mật: **Helmet**, **CORS**, **Rate limiting**

### Frontend
- **React 18**, **React Router DOM**
- **Tailwind CSS**, **React Hook Form**
- **Axios**, **Lucide React**

---

## 🚀 Cài đặt & Chạy

### Yêu cầu hệ thống
- Node.js **v16+**
- MongoDB **v4.4+**
- npm hoặc yarn

### 1) Clone & cài đặt
```bash
# Clone repo
git clone <repository-url>
cd phanmem

# Backend deps
npm install

# Frontend deps
cd client && npm install && cd ..
```

### 2) Cấu hình môi trường
Tạo file **`.env`** (hoặc copy từ `config.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/credit_registration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
```
> ⚠️ **Bảo mật**: không commit `.env` lên repo công khai.

### 3) Khởi động MongoDB
```bash
# Service mặc định
mongod

# Hoặc Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4) Chạy ứng dụng
```bash
# Backend (dev: có nodemon)
npm run dev
# Backend (prod)
npm start

# Frontend
cd client && npm start
```
- Backend: http://localhost:5000  
- Frontend: http://localhost:3000

---

## 🗂️ Cấu trúc dự án
```
phanmem/
├── server.js                 # Entry point backend
├── package.json              # Backend deps & scripts
├── config.env                # Biến môi trường (mẫu)
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Registration.js
│   └── Semester.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── courses.js
│   ├── registrations.js
│   └── semesters.js
├── middleware/
│   └── auth.js               # JWT middleware
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 🔌 API Endpoints (v1)

### Auth
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập, trả về JWT |
| GET | `/api/auth/me` | Lấy thông tin người dùng hiện tại |
| POST | `/api/auth/change-password` | Đổi mật khẩu |

### Users
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/users` | Danh sách người dùng (Admin) |
| GET | `/api/users/profile` | Lấy hồ sơ hiện tại |
| PUT | `/api/users/profile` | Cập nhật hồ sơ |
| GET | `/api/users/students` | Danh sách sinh viên |

### Courses
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/courses` | Danh sách khóa học/học phần |
| GET | `/api/courses/:id` | Chi tiết khóa học |
| POST | `/api/courses` | Tạo khóa học (Admin/Teacher) |
| PUT | `/api/courses/:id` | Cập nhật khóa học |

### Registrations
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/registrations` | Danh sách đăng ký |
| POST | `/api/registrations` | Đăng ký học phần (Student) |
| PUT | `/api/registrations/:id/approve` | Duyệt đăng ký |
| PUT | `/api/registrations/:id/drop` | Xóa học phần |

> **Mẹo**: Sử dụng header `Authorization: Bearer <token>` cho các endpoint yêu cầu đăng nhập.

---

## 👤 Tài khoản mặc định
Tạo tài khoản admin lần đầu:
```bash
curl -X POST http://localhost:5000/api/auth/register   -H "Content-Type: application/json"   -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

---

## 🔒 Bảo mật
- **JWT** cho xác thực & phân quyền theo vai trò
- **bcrypt** băm mật khẩu
- **Input validation** & **sanitization**
- **Rate limiting**, **CORS**, **Helmet** headers
- Ẩn secrets (.env), rotate `JWT_SECRET` định kỳ

---

## 🧪 Kiểm thử
- Unit test (gợi ý): Jest + Supertest cho routes
- Mock DB: MongoMemoryServer cho test cô lập
- Lint: ESLint + Prettier

---

## 📦 Deployment

### Production checklist
1. Cập nhật biến môi trường & secret an toàn (Vault, GitHub Actions secret)
2. Build frontend: `cd client && npm run build`
3. Chạy backend bằng **PM2** hoặc **Docker**
4. Reverse proxy qua **Nginx** (HTTPS với Let’s Encrypt)

### Docker Compose (gợi ý)
```yaml
version: "3.9"
services:
  api:
    build: .
    env_file: .env
    ports:
      - "5000:5000"
    depends_on:
      - mongo
  client:
    build: ./client
    ports:
      - "3000:3000"
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

---

## 📈 Thống kê & Báo cáo (gợi ý triển khai)
- Bảng điều khiển cho **tổng đăng ký theo học kỳ**, **tải môn**, **điểm trung bình**
- Xuất **Excel/PDF**: báo cáo theo học kỳ, theo lớp
- WebSocket/Push cho **phê duyệt** & **cảnh báo trùng lịch** realtime

---

## 🗺️ Roadmap
- [ ] Refresh token & session quản lý đa thiết bị
- [ ] Bộ lọc nâng cao (tín chỉ, thời khóa biểu, giảng viên)
- [ ] Import/SIS integration (CSV/Excel)
- [ ] iCal export lịch học/thi
- [ ] Trang **Dashboard** theo vai trò
- [ ] Test E2E (Playwright/Cypress)

---

## 🤝 Đóng góp
1. Fork repository
2. Tạo feature branch (`feat/ten-tinh-nang`)
3. Commit theo Conventional Commits
4. PR kèm mô tả & ảnh chụp màn hình

---

## 📄 License
**MIT** – xem file `LICENSE` để biết chi tiết.

---

## 🆘 Hỗ trợ
Nếu có vấn đề, vui lòng tạo **Issue** trên GitHub hoặc liên hệ qua email quản trị dự án.

**Tác giả (cập nhật):** _Điền thông tin tại đây_

---

> **Ghi chú**: Đây là bản **development**. Trước khi triển khai production, hãy rà soát bảo mật, tối ưu hiệu năng và quy trình CI/CD.

