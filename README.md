<div align="center">
  <h1>✨ Taskify ✨</h1>
  <p><i>A Modern, Powerful, and Simple Task & Project Management System</i></p>
</div>

---

## 📖 Giới thiệu Dự Án (Introduction)
**Taskify** là một ứng dụng quản lý công việc và dự án toàn diện được xây dựng nhằm cải thiện hiệu suất làm việc nhóm. Với Taskify, người dùng có thể dễ dàng khởi tạo dự án, phân công công việc, đính kèm tài liệu, và trao đổi thông qua hệ thống bình luận trực tiếp. 

Dự án được phát triển theo kiến trúc MVC quen thuộc, sử dụng **Node.js/Express** cho phần Backend mạnh mẽ, hệ quản trị cơ sở dữ liệu **PostgreSQL** kết hợp với **Prisma ORM** hiện đại, và Server-side rendering (SSR) tối ưu với **Pug**.

---

## 🎯 Các tính năng nổi bật (Key Features)

### 🔐 1. Xác thực & Phân quyền (Authentication & Authorization)
- Đăng nhập/Đăng ký an toàn với mã hóa mật khẩu (`bcryptjs`) và xác thực phiên qua **JWT Tokens**.
- Phân quyền người dùng theo vai trò hệ thống (System Role): Quản lý người dùng, Admin và User.
- Phân quyền cấp độ dự án: Người tạo dự án (Project Creator) và Thành viên dự án (Members).

### 📁 2. Quản lý Dự Án (Project Management)
- Tạo mới, cập nhật và quản lý vòng đời của dự án (Active, Completed...).
- Mời các thành viên tham gia, kiểm soát danh sách thành viên trong từng dự án riêng biệt.

### ✅ 3. Quản lý Công việc (Task Management)
Hệ thống nghiệp vụ Task Management phong phú, hỗ trợ:
- **Giao việc (Assignments):** Phân công Task cho một hoặc nhiều thành viên cụ thể.
- **Workflow & Trạng thái:** Chuyển dịch linh hoạt từ Todo ➜ In Progress ➜ Review ➜ Done.
- **Đánh giá & Phê duyệt:** Cung cấp quy trình xác nhận/phê duyệt của người giám sát (`approved_by`, `approved_at`).
- **Ưu tiên & Thời hạn:** Đặt mức độ ưu tiên (Priority), ngày bắt đầu (Start Date) và Hạn chót (Deadline).
- **Phân loại bằng nhãn (Labels):** Gắn tab màu sắc (`#color`) cho công việc thông qua hệ thống Task Labels.

### 💬 4. Giao tiếp & Tương tác (Collaboration)
- Bảng **Bình luận (Comments):** Góp ý, trao đổi trực tiếp trên mỗi màn hình chi tiết công việc.
- **Tài liệu đính kèm (Attachments):** Tính năng Upload file, tự động lưu trữ tài nguyên để thành viên khác có thể tải về làm việc (thông qua `Multer`).

### 🐳 5. Triển khai theo hướng Container hóa (Containerized Deployment)
- Được đóng gói hoàn chỉnh bằng **Docker**, hỗ trợ khởi chạy "1-click" toàn bộ môi trường (Web Server + Database) thông qua **Docker Compose**. Dễ dàng triển khai ở bất kỳ máy chủ hay thiết bị nào mà không lo lỗi "chỉ chạy được trên máy tôi" (It works on my machine).

---

## 💻 Công nghệ và Môi trường (Tech Stack)

| Thành phần | Công nghệ / Thư viện sử dụng |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Database & ORM** | PostgreSQL, Prisma |
| **View Engine** | Pug (Gọn nhẹ, render mã HTML bảo mật từ Server) |
| **Thiết kế giao diện** | Modular CSS (Cấu trúc CSS được phân rã theo Layout, Components, Pages) |
| **DevOps / Môi trường**| Docker, Docker Compose, biến môi trường với `dotenv` |

---

## 🚀 Trải nghiệm nhanh (Quick Start)

Dành cho Reviewer / Giảng viên / Quản lý muốn chạy thử hệ thống ngay lập tức nhằm đánh giá chất lượng sản phẩm:

1. **Clone dự án về máy**:
   ```bash
   git clone <repository_url>
   cd taskify
   ```

2. **Khởi chạy tự động với Docker Compose**:
   *(Bắt buộc: Máy tính đã bật Docker Engine)*
   ```bash
   docker-compose up -d --build
   ```

3. **Khám phá ứng dụng**:
   👉 Truy cập: **http://localhost:3000** 

---

## 📂 Kiến trúc Tổ chức Source Code
Source code được sắp xếp tuân thủ chặt chẽ nguyên lý Separation of Concerns (SoC) giúp dễ bảo trì và làm việc nhóm:
- `controllers/` & `routes/`: Tách biệt logic và điều hướng (chia ra theo khu vực `admin` và `client`).
- `prisma/schema.prisma`: Nơi định nghĩa duy nhất toàn bộ bảng cơ sở dữ liệu và quan hệ (Relations).
- `public/css/`: Bố cục thư mục CSS rõ ràng từ `base/` (reset, color vars), `layout/` đến `pages/`.
- `views/`: Tổ chức các màn hình UI mạch lạc qua `layouts` (khung nền chung), `partials` (thành phần chung như menu, footer) và `pages`.

---
<div align="center">
  <i>✨ Phát triển cho sự tiện lợi và rõ ràng ✨</i>
</div>