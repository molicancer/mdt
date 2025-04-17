import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 从slug中提取期数
 * @param slug 格式为"volXX"的字符串
 * @returns 提取出的期数，如果无法提取则返回0
 */
export function extractNumberFromSlug(slug: string): number {
  // 从slug（volxx）中提取期数数字
  const match = slug.match(/vol(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0; // 默认值
}

/**
 * 检查URL路径中是否包含期数
 * @param path URL路径
 * @returns 提取出的期数，如果没找到则返回null
 */
export function extractNumberFromPath(path: string): number | null {
  const pathParts = path.split('/');
  
  // 检查路径部分中是否有volXX格式
  for (const part of pathParts) {
    const match = part.match(/vol(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

/**
 * 从URL哈希中提取期数
 * @param hash URL哈希部分
 * @returns 提取出的期数，如果没找到则返回null
 */
export function extractNumberFromHash(hash: string): number | null {
  const hashMatch = hash.match(/#vol(\d+)/i);
  if (hashMatch && hashMatch[1]) {
    return parseInt(hashMatch[1], 10);
  }
  
  return null;
}

/**
 * 从当前URL获取期数
 * 优先从路径中获取，其次从哈希中获取
 * @returns 提取出的期数，如果没找到则返回null
 */
export function getIssueNumberFromURL(): number | null {
  if (typeof window === 'undefined') return null;
  
  // 首先检查URL路径
  const pathNumber = extractNumberFromPath(window.location.pathname);
  if (pathNumber !== null) {
    return pathNumber;
  }
  
  // 然后检查URL哈希
  return extractNumberFromHash(window.location.hash);
}

/**
 * 检查URL是否包含指定标记
 * @param marker 要检查的标记
 * @returns 是否包含该标记
 */
export function hasURLMarker(marker: string): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.location.hash.includes(`&${marker}`);
}
