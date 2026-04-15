# ============================================================
# Dockerfile cho dự án Taskify
# Node.js + Express + Prisma + Pug
# ============================================================

# Bước 1: Base image — Node.js 20 bản slim thay vì alpine để Prisma tương thích thư viện C/C++ tốt hơn
FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl

# Bước 2: Thư mục làm việc bên trong container
WORKDIR /app

# Bước 3: Copy file dependency trước (tối ưu Docker cache)
COPY package.json package-lock.json ./

# Bước 4: Cài đặt dependencies (chỉ production, không cài nodemon)
RUN npm ci --omit=dev

# Bước 5: Copy Prisma schema + config (cần cho generate)
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Bước 6: Generate Prisma Client từ schema
RUN npx prisma generate

# Bước 7: Copy toàn bộ source code còn lại
COPY . .

# Bước 8: Tạo thư mục uploads (nếu chưa có) để multer không lỗi
RUN mkdir -p /app/public/uploads/attachments

# Bước 9: Khai báo port ứng dụng
EXPOSE 3000

# Bước 10: Lệnh khởi chạy khi container start
CMD ["node", "app.js"]
