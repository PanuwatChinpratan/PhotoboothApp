FROM node:20

# ตั้ง working dir
WORKDIR /app

# ก็อป package.json เพื่อติดตั้ง deps
COPY package*.json ./

# ติดตั้ง deps (รวม dev deps)
RUN npm install

# ก๊อปทั้งหมด (จะถูก override ด้วย volume ใน dev)
COPY . .

# รัน Prisma generate เพื่อใช้งาน
RUN npx prisma generate

# Expose port dev
EXPOSE 3000

# รัน dev server
CMD ["npm", "run", "dev"]
