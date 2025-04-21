import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { marked } from 'marked'

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
    return marked.parse(markdown, { async: false }) as string;
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
