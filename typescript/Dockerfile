FROM node:18-alpine

WORKDIR /app

# 拷贝依赖定义
COPY package*.json ./

# 安装所有依赖（包含 devDependencies，因为 tsx 通常在里面）
RUN npm install

# 关键：手动全局安装一次 tsx，确保 sh: tsx: not found 不再出现
RUN npm install -g tsx

# 拷贝其余源代码
COPY . .

# 启动命令
CMD ["npm", "run", "start"]
