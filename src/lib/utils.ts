import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { marked } from 'marked'

// Strapi 环境变量配置
export const STRAPI_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api',
  SERVER_ROOT: process.env.NEXT_PUBLIC_STRAPI_SERVER_ROOT || 'http://localhost:1337',
  endpoints: {
    issues: '/issues',
    articles: '/articles',
    categories: '/categories'
  }
}

// 处理Strapi图片路径，添加服务器前缀或使用本地代理
export function processStrapiImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url; // 已经是完整URL
  
  // 使用本地代理路径替换Strapi服务器路径
  if (url.startsWith('/uploads/')) {
    return `/strapi-uploads${url.substring(8)}`;
  }
  if (url.startsWith('/images/')) {
    return `/strapi-images${url.substring(7)}`;
  }
  
  // 如果是其他类型的路径，仍然使用完整的Strapi服务器URL
  if (url.startsWith('/')) {
    return `${STRAPI_CONFIG.SERVER_ROOT}${url}`;
  }
  
  return url;
}

// 处理富文本内容中的图片路径
export function processStrapiRichTextImages(content: string): string {
  if (!content) return '';
  
  // 匹配图片标签中的src属性
  return content.replace(
    /<img\s+[^>]*src=["'](\/(uploads|images)[^"']*)["'][^>]*>/gi,
    (match, imagePath) => {
      // 将相对路径替换为使用本地代理的路径
      const proxyPath = processStrapiImageUrl(imagePath);
      return match.replace(imagePath, proxyPath);
    }
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 安全地将 Markdown 字符串转换为 HTML 字符串。
 * @param markdown Markdown 输入字符串。
 * @returns 转换后的 HTML 字符串，或在出错时返回错误信息。
 */
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) {
    return ''; // Return empty string if input is empty or null
  }
  try {
    // 使用 marked.parse 的同步方式
    const htmlContent = marked.parse(markdown, { async: false }) as string;
    
    // 处理HTML中的图片路径
    return processStrapiRichTextImages(htmlContent);
  } catch (error) {
    console.error('Markdown 解析错误:', error);
    // 返回包含原始 Markdown 的错误信息，以便调试
    return `<p style="color: red;">内容解析错误</p><pre><code>${escapeHtml(markdown)}</code></pre>`;
  }
};

/**
 * 简单的 HTML 转义函数，防止 XSS。
 * @param unsafe 不安全的字符串
 * @returns 转义后的字符串
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
