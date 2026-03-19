1. Cấu trúc dự án
   Taskify/
   ├── 📄 app.js # File chạy chính của ứng dụng (Entry point).
   ├── 📁 config/ # Cấu hình các kết nối ngoại vi (Database, Passport, v.v.).
   │ └── prisma.js # Khởi tạo và quản lý kết nối Prisma Client.
   ├── 📁 controllers/ # Xử lý logic nghiệp vụ (Business Logic).
   │ ├── admin/ # Logic dành cho quản trị viên.
   │ └── client/ # Logic dành cho người dùng cuối (Auth, Home, Project...).
   ├── 📁 middlewares/ # Các hàm trung gian kiểm soát request (Auth, Validation...).
   │ └── auth.middleware.js # Kiểm tra Token/Session trước khi cho phép vào trang.
   ├── 📁 prisma/ # Quản lý Cơ sở dữ liệu.
   │ └── schema.prisma # Định nghĩa các Model (User, Task...) và quan hệ giữa chúng.
   ├── 📁 public/ # Chứa các tài nguyên tĩnh (Static assets).
   │ ├── 📁 css/ # Hệ thống Style được chia nhỏ dạng Modular CSS.
   │ │ ├── base/ # Reset CSS, Typography và biến màu sắc (Variables).
   │ │ ├── components/ # Style cho các thành phần nhỏ (Button, Input, Form...).
   │ │ ├── layout/ # Style cho khung sườn (Header, Sidebar, Container...).
   │ │ └── pages/ # Style riêng biệt cho từng trang (Login, Dashboard...).
   │ └── 📁 js/ # Client-side JavaScript xử lý tương tác giao diện.
   ├── 📁 routes/ # Định tuyến (Routing) các yêu cầu HTTP.
   │ ├── admin/ # Các route thuộc khu vực quản trị.
   │ └── client/ # Các route dành cho khách hàng.
   └── 📁 views/ # Chứa các template giao diện (Pug).
   └── client/
   ├── layouts/ # Layout chính (nơi chứa doctype, head, body chung).
   ├── pages/ # Giao diện chi tiết cho từng trang cụ thể.
   ├── partials/ # Các thành phần tái sử dụng (Header, Footer, Sidebar).
   └── mixins/ # Các khối code Pug có thể truyền tham số để tái sử dụng.

2. Database: Postgre -> https://neon.com
   Sau khi tạo bảng ở neon nhớ pull về, đồng bộ cloud với schema.prisma ở local => npx prisma db pull
   Pull về xong => npx prisma generate

!!! phần home t đang tạo để test middleware thôi, ae nào làm thì nhớ tạo thêm các partial(header, footer) lại cho chuẩn nhé
