# Tuần 6 — Đóng gói mã nguồn kiến trúc phân tầng

Bộ mã này đóng gói tối thiểu các phần cần có để minh hoạ kiến trúc `ui/service/repository/domain`.
Bạn có thể build theo Gradle/Maven. Đây là **skeleton** nhằm phục vụ báo cáo tuần.

## Cấu trúc
- `domain`: Entity/Value Object/Exception.
- `repository`: Interface + triển khai truy cập dữ liệu + mapper.
- `service`: Interface, triển khai use-case, DTO, validator.
- `ui`: Controller (REST giả lập).
- `diagrams`: Biểu đồ gói PlantUML (`package-diagram.puml`).

> Ghi chú: Chưa tích hợp framework cụ thể (Spring/JAX-RS/JPA). Bạn có thể thay thế `TODO:` bằng code thực tế của dự án.
