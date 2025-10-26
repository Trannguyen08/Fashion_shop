# Dockerfile cho frontend Vite (Đã sửa lỗi)
FROM node:20-bullseye

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package files và cài deps
# Sử dụng 'npm ci' để cài đặt các dependency dựa trên package-lock.json (tốt hơn cho CI/CD)
# Bước này tận dụng Docker layer caching: chỉ chạy lại nếu package.json/package-lock.json thay đổi.
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source (chỉ chạy lại nếu source code thay đổi)
COPY . .

# Expose port (Vite mặc định là 5173)
EXPOSE 5173

# Chạy dev server
# Lệnh 'npm run dev' sẽ tự động tìm 'vite' trong thư mục node_modules/.bin
# LƯU Ý QUAN TRỌNG: Bạn nên đưa cờ '--host' vào thẳng script "dev" trong package.json.
CMD ["npm", "run", "dev"]
