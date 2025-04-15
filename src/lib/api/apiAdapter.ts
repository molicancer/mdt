import { IssueContent } from "@/types/issue";
import { API_CONFIG } from "@/config/apiConfig";
import { extractNumberFromSlug } from '@/lib/utils';

// 作者信息缓存，避免重复请求
const authorCache: Record<number, string> = {};

// API 适配器接口
export interface ApiAdapter {
  getAllIssues(): Promise<IssueContent[]>;
  getIssueByNumber(issueNumber: number): Promise<IssueContent | null>;
  getLatestIssue(): Promise<IssueContent | null>;
}

// Strapi响应的Issue类型
interface StrapiIssue {
  id: number;
  attributes: {
    number: number;
    color?: string;
    title: string;
    subtitle?: string;
    items?: string[];
    author?: string;
    date?: string;
    icon?: {
      data?: {
        attributes?: {
          url?: string;
        }
      }
    };
  };
}

// WordPress API 适配器
export class WordPressApiAdapter implements ApiAdapter {
  private baseUrl: string;
  private endpoints: { posts: string; media: string; users: string };

  constructor() {
    this.baseUrl = API_CONFIG.wordpress.baseUrl;
    this.endpoints = API_CONFIG.wordpress.endpoints;
  }

  // 获取所有期刊
  async getAllIssues(): Promise<IssueContent[]> {
    try {
      // 获取所有文章的列表
      const response = await fetch(`${this.baseUrl}${this.endpoints.posts}`);
      
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
            const mediaResponse = await fetch(`${this.baseUrl}${this.endpoints.media}/${post.featured_media}`);
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
              const authorResponse = await fetch(`${this.baseUrl}${this.endpoints.users}/${post.author}`);
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
        const h2Contents = this.extractH2Contents(post.content.rendered);
        
        result.push({
          id: post.id,
          number,
          color: this.getColorForIssue(number), // 根据期数生成颜色
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
      throw error;
    }
  }

  // 获取指定期数
  async getIssueByNumber(issueNumber: number): Promise<IssueContent | null> {
    try {
      // 首先尝试从已加载的数据中查找
      const allIssues = await this.getAllIssues();
      return allIssues.find(issue => issue.number === issueNumber) || null;
    } catch (error) {
      console.error(`获取期数 ${issueNumber} 失败:`, error);
      throw error;
    }
  }

  // 获取最新一期
  async getLatestIssue(): Promise<IssueContent | null> {
    try {
      const allIssues = await this.getAllIssues();
      // 按期数降序排序，取第一个
      return allIssues[0] || null;
    } catch (error) {
      console.error('获取最新期数失败:', error);
      throw error;
    }
  }

  // 从文章内容中提取所有H2标签的文本内容
  private extractH2Contents(content: string): string[] {
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

  // 根据期数生成一致的颜色
  private getColorForIssue(number: number): string {
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
}

// Strapi API 适配器
export class StrapiApiAdapter implements ApiAdapter {
  private baseUrl: string;
  private endpoints: { issues: string; media: string };

  constructor() {
    this.baseUrl = API_CONFIG.strapi.baseUrl;
    this.endpoints = API_CONFIG.strapi.endpoints;
  }

  // 获取所有期刊
  async getAllIssues(): Promise<IssueContent[]> {
    try {
      // Strapi 查询参数，获取所有字段和关联数据
      const queryParams = '?populate=*&sort=number:desc';
      const response = await fetch(`${this.baseUrl}${this.endpoints.issues}${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const issues = data.data || [];
      
      return issues.map((issue: StrapiIssue) => {
        const attributes = issue.attributes;
        return {
          id: issue.id,
          number: attributes.number,
          color: attributes.color || this.getColorForIssue(attributes.number),
          title: attributes.title,
          subtitle: attributes.subtitle || `Vol ${attributes.number}`,
          items: attributes.items || ["本期暂无目录"],
          author: attributes.author || "MDT",
          icon: attributes.icon?.data?.attributes?.url || "/test.png",
          date: attributes.date || new Date().toISOString().split('T')[0]
        };
      });
    } catch (error) {
      console.error('获取期数失败:', error);
      throw error;
    }
  }

  // 获取指定期数
  async getIssueByNumber(issueNumber: number): Promise<IssueContent | null> {
    try {
      // Strapi 查询参数，按 number 字段过滤
      const queryParams = `?populate=*&filters[number][$eq]=${issueNumber}`;
      const response = await fetch(`${this.baseUrl}${this.endpoints.issues}${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const issues = data.data || [];
      
      if (issues.length === 0) {
        return null;
      }
      
      const issue = issues[0];
      const attributes = issue.attributes;
      
      return {
        id: issue.id,
        number: attributes.number,
        color: attributes.color || this.getColorForIssue(attributes.number),
        title: attributes.title,
        subtitle: attributes.subtitle || `Vol ${attributes.number}`,
        items: attributes.items || ["本期暂无目录"],
        author: attributes.author || "MDT",
        icon: attributes.icon?.data?.attributes?.url || "/test.png",
        date: attributes.date || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error(`获取期数 ${issueNumber} 失败:`, error);
      throw error;
    }
  }

  // 获取最新一期
  async getLatestIssue(): Promise<IssueContent | null> {
    try {
      // Strapi 查询参数，按 number 字段降序排序，只获取第一条
      const queryParams = '?populate=*&sort=number:desc&pagination[limit]=1';
      const response = await fetch(`${this.baseUrl}${this.endpoints.issues}${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const issues = data.data || [];
      
      if (issues.length === 0) {
        return null;
      }
      
      const issue = issues[0];
      const attributes = issue.attributes;
      
      return {
        id: issue.id,
        number: attributes.number,
        color: attributes.color || this.getColorForIssue(attributes.number),
        title: attributes.title,
        subtitle: attributes.subtitle || `Vol ${attributes.number}`,
        items: attributes.items || ["本期暂无目录"],
        author: attributes.author || "MDT",
        icon: attributes.icon?.data?.attributes?.url || "/test.png",
        date: attributes.date || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('获取最新期数失败:', error);
      throw error;
    }
  }

  // 根据期数生成一致的颜色
  private getColorForIssue(number: number): string {
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
}

// 创建 API 适配器工厂
export const createApiAdapter = (): ApiAdapter => {
  return API_CONFIG.type === 'wordpress' ? new WordPressApiAdapter() : new StrapiApiAdapter();
};

// 导出默认适配器实例
export const apiAdapter = createApiAdapter(); 