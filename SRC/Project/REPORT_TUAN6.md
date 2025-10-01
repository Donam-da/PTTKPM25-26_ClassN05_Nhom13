# Báo cáo triển khai mã — Tuần 6: Thiết kế Kiến trúc hệ thống

## 1. Mục tiêu triển khai
- Chuẩn hoá kiến trúc **phân tầng**: `ui` → `service` → `repository` → `domain`.
- Tạo **interface** cho `Service` và `Repository` để tách phụ thuộc, sẵn sàng DI/Unit test.
- Sắp xếp lại **cấu trúc thư mục** và bổ sung test khói cho ràng buộc phụ thuộc.

## 2. Sản phẩm đã bàn giao
- **Biểu đồ gói**: `diagrams/package-diagram.puml` (PlantUML).
- **Bộ mã skeleton** Java minh hoạ đầy đủ 4 tầng.
- **Test tối thiểu**: domain/service/repository.
- **README** và `build.gradle` mẫu.

## 3. Tổ chức thư mục
```
src/main/java/com/company/project/
  domain/{entities,valueobjects,exceptions}
  repository/{interfaces,implementations,mappers}
  service/{dto,interfaces,implementations,validators}
  ui/controllers
tests/{unit,integration}
diagrams/package-diagram.puml
build.gradle
```
- Mỗi tầng chỉ phụ thuộc xuống dưới:
  - `ui` → `service`
  - `service` → `domain` + **abstraction** của `repository`
  - `repository` → `domain`
  - `domain` độc lập

## 4. Chi tiết các phần đã viết

### 4.1 Domain
- `Email` (Value Object) kiểm tra hợp lệ: `domain/valueobjects/Email.java`.
- `User` (Entity) quản lý bất biến `id`, trạng thái `active`: `domain/entities/User.java`.

### 4.2 Repository
- **Interface** `IUserRepository`: `repository/interfaces/IUserRepository.java`.
- **Triển khai mẫu In-Memory** `UserRepositoryImpl`: `repository/implementations/UserRepositoryImpl.java`.
  - Mục đích: tách hạ tầng khỏi use-case, dễ test.
- **Mapper** placeholder: `repository/mappers/UserMapper.java` (dành cho khi dùng ORM/DAO khác với entity domain).

### 4.3 Service
- **Interface** `IUserService`: `service/interfaces/IUserService.java`.
- **DTO**: `CreateUserRequest`, `UserDto`: `service/dto/...`.
- **Validator**: `UserValidator` (kiểm tra input ở tầng application): `service/validators/UserValidator.java`.
- **Triển khai** `UserService`: `service/implementations/UserService.java`.
  - Áp dụng quy tắc: `service` nhận/đưa **DTO**, làm việc với **entity** qua repository.
  - Ràng buộc nghiệp vụ: chặn email trùng lặp trước khi `save`.

### 4.4 UI
- `UserController`: `ui/controllers/UserController.java`.
  - Controller chỉ **uỷ quyền** cho `IUserService`, không chứa logic nghiệp vụ.

### 4.5 Kiểm thử
- **Unit (domain)**: `UserTest` kiểm tra bất biến VO/Entity.
- **Unit (service)**: `UserServiceTest` kiểm tra luồng tạo & lấy user với repo in-memory.
- **Integration (repository)**: `UserRepositoryTest` xác nhận lưu/đọc.

## 5. Lợi ích đạt được
- **Phân tách rõ ràng** trách nhiệm, tránh rò rỉ tầng.
- **Dễ thay thế hạ tầng** (chỉ cần bind `IUserRepository` → `UserRepositoryImpl` khác).
- **Tăng khả năng test** và mở rộng use-case.
- **Chuẩn hoá giao tiếp** giữa UI ↔ Service (DTO) và Service ↔ Repository (Entity).

## 6. Công việc còn lại/đề xuất
- Tích hợp framework thực tế (Spring Boot/JPA, v.v.) + cấu hình DI.
- Bổ sung mapper tự động (MapStruct) và exception handling chuẩn.
- Thêm rule ArchUnit để **chặn import sai tầng**.
- Mở rộng test (edge cases, pagination, transactional).

---
**Kết luận:** Bộ mã và tài liệu trong gói đã đáp ứng yêu cầu Tuần 6: có sơ đồ gói, code skeleton đủ 4 tầng, interface cho Service/Repository, cùng báo cáo mô tả chi tiết phần đã làm.
