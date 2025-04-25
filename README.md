# MDT 项目

## 环境变量配置

本项目使用环境变量来配置不同环境的设置。以下是环境变量的设置说明：

### 环境变量文件

- `.env.example`: 示例环境变量文件，包含所有需要的变量
- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置
- `.env.test`: 测试环境配置

### 配置步骤

1. 复制示例文件创建你的环境配置：

```bash
cp .env.example .env.local
```

2. 根据你的需求编辑 `.env.local` 文件

### 主要环境变量

- `NEXT_PUBLIC_STRAPI_HOST`: Strapi CMS 服务器的主机地址
- `NEXT_PUBLIC_STRAPI_PORT`: Strapi CMS 服务器的端口
- `NEXT_PUBLIC_STRAPI_API_URL`: Strapi API 的完整 URL
- `NEXT_PUBLIC_STRAPI_SERVER_ROOT`: Strapi 服务器的根 URL
- `NEXT_PUBLIC_STRAPI_BACKUP_HOST`: 备用 Strapi 服务器的主机地址
- `NEXT_PUBLIC_STRAPI_BACKUP_PORT`: 备用 Strapi 服务器的端口

## 运行项目

确保你已经设置好环境变量后，运行以下命令：

```bash
# 安装依赖
bun install

# 开发模式运行
bun run dev

# 构建项目
bun run build

# 启动生产服务器
bun run start
```

## 部署说明

1. 确保在部署环境中设置了正确的环境变量
2. 根据环境选择合适的 `.env` 文件
3. 执行构建和启动命令

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
