import { IssueContent } from "@/types/issue";

// Strapi API 配置
const API_CONFIG = {
  baseUrl: 'http://172.16.7.55:1337/api',
  endpoints: {
    issues: '/issues'
  }
};

// 文章内容接口
export interface ArticleData {
  content: string;
  createdAt: string;
  author: string;
}

// Strapi响应的Issue数据类型
interface StrapiIssue {
  id: number;
  documentId: string;
  title: string;
  issue_number: number;
  description?: string;
  publishedAt?: string;
  [key: string]: string | number | boolean | object | null | undefined;
}

// Strapi API 处理类
class StrapiApiAdapter {
  private baseUrl: string;
  private issuesEndpoint: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.issuesEndpoint = API_CONFIG.endpoints.issues;
  }

  // 获取所有期刊
  async getAllIssues(): Promise<IssueContent[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.issuesEndpoint}`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const issues = data.data || [];
      
      return issues.map((issue: StrapiIssue) => ({
        id: issue.id,
        number: issue.issue_number,
        title: issue.title,
        subtitle: issue.description || `Vol ${issue.issue_number}`,
        items: [], // 从单期API获取
        author: "MDT",
        icon: "/test.png", // 从单期API获取
        date: issue.publishedAt ? new Date(issue.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        slug: `vol-${issue.issue_number}`,
        documentId: issue.documentId
      })).sort((a: IssueContent, b: IssueContent) => b.number - a.number); // 按期数降序排序
    } catch (error) {
      console.error('获取期数失败:', error);
      throw error;
    }
  }

  // 获取指定期数
  async getIssueByNumber(issueNumber: number): Promise<IssueContent | null> {
    try {
      const allIssues = await this.getAllIssues();
      const issue = allIssues.find(issue => issue.number === issueNumber);
      
      if (!issue) {
        return null;
      }
      
      // 获取详细信息
      const response = await fetch(`${this.baseUrl}${this.issuesEndpoint}/${issue.documentId}?populate=*`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const issueData = data.data;
      
      if (!issueData) {
        return issue;
      }
      
      // 更新图标URL和文章列表
      let iconUrl = "/test.png";
      if (issueData.cover_image && issueData.cover_image.url) {
        iconUrl = issueData.cover_image.url;
      }
      
      const items = [];
      if (issueData.articles && issueData.articles.length > 0) {
        for (const article of issueData.articles) {
          if (article.title) {
            items.push(article.title);
          }
        }
      }
      
      return {
        ...issue,
        icon: iconUrl,
        items: items.length > 0 ? items : ["本期暂无目录"]
      };
    } catch (error) {
      console.error(`获取期数 ${issueNumber} 失败:`, error);
      throw error;
    }
  }

  // 获取最新一期
  async getLatestIssue(): Promise<IssueContent | null> {
    try {
      const allIssues = await this.getAllIssues();
      
      if (allIssues.length === 0) {
        return null;
      }
      
      const latestIssue = allIssues[0]; // 已按期数降序排序，第一个即为最新
      latestIssue.isLatest = true;
      return latestIssue;
    } catch (error) {
      console.error('获取最新期数失败:', error);
      throw error;
    }
  }
  
  // 获取文章详细内容
  async getArticleContent(issueNumber: number): Promise<ArticleData> {
    try {
      const allIssues = await this.getAllIssues();
      const issue = allIssues.find(issue => issue.number === issueNumber);
      
      if (!issue) {
        throw new Error(`找不到期数 ${issueNumber} 的内容`);
      }
      
      const response = await fetch(`${this.baseUrl}${this.issuesEndpoint}/${issue.documentId}?populate=*`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const issueData = data.data;
      
      if (!issueData || !issueData.articles || issueData.articles.length === 0) {
        throw new Error(`找不到期数 ${issueNumber} 的文章内容`);
      }
      
      // 合并所有文章内容
      let allContent = '';
      for (const article of issueData.articles) {
        allContent += `<h2>${article.title}</h2>`;
        allContent += article.content || '';
        if (article.link) {
          allContent += `<p><a href="${article.link}" target="_blank">阅读更多</a></p>`;
        }
        allContent += '<hr />';
      }
      
      return {
        content: allContent || `<p>Vol ${issueNumber} 的文章内容暂未上传。</p>`,
        createdAt: issueData.publishedAt || new Date().toISOString(),
        author: "MDT"
      };
    } catch (error) {
      console.error(`获取期数 ${issueNumber} 的文章内容失败:`, error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        content: `<p>加载文章内容时发生错误，请稍后再试。</p><p>错误信息: ${errorMessage}</p>`,
        createdAt: new Date().toISOString(),
        author: "MDT"
      };
    }
  }
}

// 创建API适配器实例
const apiAdapter = new StrapiApiAdapter();

/**
 * 获取所有期刊数据
 */
export async function getAllIssues(): Promise<IssueContent[]> {
  return apiAdapter.getAllIssues();
}

/**
 * 获取指定期数的内容
 * @param issueNumber 期数
 */
export async function getIssueByNumber(issueNumber: number): Promise<IssueContent | null> {
  return apiAdapter.getIssueByNumber(issueNumber);
}

/**
 * 获取最新一期
 */
export async function getLatestIssue(): Promise<IssueContent | null> {
  return apiAdapter.getLatestIssue();
}

/**
 * 获取指定期数的文章详细内容
 * @param issueNumber 期数
 */
export async function getArticleContent(issueNumber: number): Promise<ArticleData> {
  return apiAdapter.getArticleContent(issueNumber);
} 