# 🚀 Hướng dẫn cài đặt MongoDB trên Windows

## Bước 1: Tải MongoDB Community Server

1. **Truy cập**: https://www.mongodb.com/try/download/community
2. **Chọn cấu hình**:
   - Version: `7.0.x` (mới nhất)
   - Platform: `Windows`
   - Package: `msi`
3. **Click "Download"**

## Bước 2: Cài đặt MongoDB

1. **Chạy file .msi** với quyền Administrator:
   - Right-click file → "Run as administrator"
2. **Trong quá trình cài đặt**:
   - ✅ Chọn "Complete" installation
   - ✅ **QUAN TRỌNG**: Tích "Install MongoDB as a Service"
   - ✅ Tích "Install MongoDB Compass" (GUI tool)
3. **Click "Install"** và chờ hoàn tất

## Bước 3: Thêm MongoDB vào PATH

1. **Mở System Properties**:
   - Nhấn `Win + R` → gõ `sysdm.cpl` → Enter
2. **Cấu hình Environment Variables**:
   - Tab "Advanced" → "Environment Variables"
   - Trong "System Variables" → chọn "Path" → "Edit"
   - "New" → thêm: `C:\Program Files\MongoDB\Server\7.0\bin`
   - OK → OK → OK

## Bước 4: Khởi động MongoDB

### Cách 1: Qua Services (Khuyến nghị)
1. **Mở Services**: `Win + R` → `services.msc`
2. **Tìm "MongoDB"** trong danh sách
3. **Right-click** → "Start"

### Cách 2: Qua Command Prompt (Administrator)
```cmd
net start MongoDB
```

## Bước 5: Kiểm tra cài đặt

Mở **Command Prompt mới** và chạy:
```cmd
mongod --version
mongo --version
```

## Bước 6: Tạo Database cho ứng dụng

1. **Mở MongoDB Compass** (đã cài cùng MongoDB)
2. **Connect** với: `mongodb://localhost:27017`
3. **Tạo database mới**: `credit_registration`

## 🔧 Troubleshooting

### Lỗi "mongod is not recognized"
- **Nguyên nhân**: MongoDB chưa được thêm vào PATH
- **Giải pháp**: Làm lại Bước 3, sau đó restart Command Prompt

### Lỗi "Access denied" khi start service
- **Nguyên nhân**: Thiếu quyền Administrator
- **Giải pháp**: Chạy Command Prompt as Administrator

### MongoDB service không start
1. **Kiểm tra Windows Services**: `services.msc`
2. **Tìm "MongoDB"** → Properties → Startup type: "Automatic"
3. **Start service**

## 🚀 Sau khi cài đặt thành công

1. **Restart Command Prompt**
2. **Chạy lại ứng dụng**:
   ```cmd
   npm start
   ```
3. **Kiểm tra kết nối**: Bạn sẽ thấy "MongoDB Connected: localhost:27017"

## 📊 Tools hữu ích

- **MongoDB Compass**: GUI để quản lý database
- **MongoDB Shell**: `mongosh` để thao tác qua command line
- **Connection String**: `mongodb://localhost:27017/credit_registration`

---

**Lưu ý**: Sau khi cài đặt xong, hãy restart Command Prompt để PATH có hiệu lực!
