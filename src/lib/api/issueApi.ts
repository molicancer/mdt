import { IssueContent } from "@/types/issue";
import { extractNumberFromSlug } from '@/lib/utils';

// 作者信息缓存，避免重复请求
const authorCache: Record<number, string> = {};

/**
 * 获取所有期刊数据
 * 从WordPress API获取数据
 */
export async function getAllIssues(): Promise<IssueContent[]> {
  try {
    // 获取所有文章的列表
    const response = await fetch('http://172.16.69.13:8080/wp-json/wp/v2/posts');
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const posts = await response.json();
    const result: IssueContent[] = [];
    
    // 格式化数据
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // 从slug中提取期数
      const number = extractNumberFromSlug(post.slug);
      if (number === 0) continue; // 跳过无效期数
      
      // 获取特色图片
      let iconUrl = "/test.png"; // 默认图标
      
      if (post.featured_media) {
        try {
          const mediaResponse = await fetch(`http://172.16.69.13:8080/wp-json/wp/v2/media/${post.featured_media}`);
          if (mediaResponse.ok) {
            const media = await mediaResponse.json();
            // 使用媒体源URL或缩略图URL
            iconUrl = media.source_url || 
                     (media.media_details?.sizes?.thumbnail?.source_url) || 
                     (media.media_details?.sizes?.medium?.source_url) || 
                     "/test.png";
          }
        } catch (error) {
          console.error('获取特色图片失败:', error);
        }
      }
      
      // 获取作者信息
      let authorName = "MDT";
      if (post.author) {
        try {
          // 检查缓存中是否已有该作者信息
          if (authorCache[post.author]) {
            authorName = authorCache[post.author];
          } else {
            const authorResponse = await fetch(`http://172.16.69.13:8080/wp-json/wp/v2/users/${post.author}`);
            if (authorResponse.ok) {
              const author = await authorResponse.json();
              authorName = author.name || "MDT";
              // 缓存作者信息
              authorCache[post.author] = authorName;
            }
          }
        } catch (error) {
          console.error('获取作者信息失败:', error);
        }
      }
      
      // 提取H2标签内容
      const h2Contents = extractH2Contents(post.content.rendered);
      
      result.push({
        id: post.id,
        number,
        color: getColorForIssue(number), // 根据期数生成颜色
        title: post.title.rendered,
        subtitle: post.excerpt.rendered.replace(/<[^>]*>/g, '').trim() || `Vol ${number}`, // 使用摘要作为副标题
        items: h2Contents, // 使用H2标签内容作为items
        author: authorName,
        icon: iconUrl, // 使用特色图片URL
        date: new Date(post.date).toISOString().split('T')[0]
      });
    }
    
    // 按期数排序（降序，最新的在前面）
    return result.sort((a, b) => b.number - a.number);
  } catch (error) {
    console.error('获取期数失败:', error);
    throw error; // 直接抛出错误，让调用者处理
  }
}

/**
 * 获取指定期数的内容
 * @param issueNumber 期数
 */
export async function getIssueByNumber(issueNumber: number): Promise<IssueContent | null> {
  try {
    // 首先尝试从已加载的数据中查找
    const allIssues = await getAllIssues();
    return allIssues.find(issue => issue.number === issueNumber) || null;
  } catch (error) {
    console.error(`获取期数 ${issueNumber} 失败:`, error);
    throw error; // 直接抛出错误，让调用者处理
  }
}

/**
 * 获取最新一期
 */
export async function getLatestIssue(): Promise<IssueContent | null> {
  try {
    const allIssues = await getAllIssues();
    // 按期数降序排序，取第一个
    return allIssues[0] || null;
  } catch (error) {
    console.error('获取最新期数失败:', error);
    throw error; // 直接抛出错误，让调用者处理
  }
}

/**
 * 从文章内容中提取所有H2标签的文本内容
 */
function extractH2Contents(content: string): string[] {
  const items: string[] = [];
  const regex = /<h2[^>]*>(.*?)<\/h2>/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    // 移除可能的HTML标签，只保留文本
    const cleanText = match[1].replace(/<[^>]*>/g, '').trim();
    if (cleanText) {
      items.push(cleanText);
    }
  }
  
  // 如果没有找到H2标签，返回一个默认项
  if (items.length === 0) {
    items.push("本期暂无目录");
  }
  
  return items;
}

/**
 * 根据期数生成一致的颜色
 */
function getColorForIssue(number: number): string {
  // 可用的颜色数组
  const colors = [
    "#FF9E80", // 橙红色
    "#90CAF9", // 蓝色
    "#81C784", // 绿色
    "#B39DDB", // 紫色
    "#FFCC80", // 橙色
    "#F48FB1", // 粉色
    "#A1887F", // 棕色
    "#90A4AE"  // 蓝灰色
  ];
  
  // 使用模运算确保颜色循环使用
  const colorIndex = (number % colors.length);
  return colors[colorIndex];
} 