import { IssueContent, Article, CategoryWithArticles } from "@/types/issue";

// Strapi API 配置
const API_CONFIG = {
  baseUrl: 'http://172.16.7.55:1337/api',
  endpoints: {
    issues: '/issues',
    articles: '/articles',
    categories: '/categories'
  }
};

// 文章详情接口（包含分类）
export interface ArticleDetail {
  id: number;
  documentId: string;
  title: string;
  content: string;
  slug: string | null;
  link: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  category?: {
    id: number;
    documentId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    sort_order?: number;
  } | null;
}

// 分类接口
export interface Category {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  sort_order?: number;
}

// 在顶部添加新的接口定义
interface StrapiIssueResponse {
  id: number;
  issue_number: number;
  title: string;
  description?: string;
  documentId: string;
  publishedAt?: string;
  cover_image?: {
    url?: string;
  };
}

interface StrapiTopicResponse {
  id: number;
  documentId: string;
  title: string;
}

// Helper function to organize articles by category (moved from page component)
function organizeArticlesByCategory(
  articles: ArticleDetail[], 
  allCategories: Category[]
): CategoryWithArticles[] {
  const categoryMap = new Map<number, Category>();
  allCategories.forEach(cat => categoryMap.set(cat.id, cat));
  
  const categorized: CategoryWithArticles[] = allCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    sortOrder: cat.sort_order || 999,
    articles: []
  }));
  
  const otherCategory: CategoryWithArticles = {
    id: "other",
    name: "其他",
    sortOrder: 1000,
    articles: []
  };
  
  for (const article of articles) {
    if (article.category && categoryMap.has(article.category.id)) {
      const catIndex = categorized.findIndex(c => c.id === article.category!.id);
      if (catIndex >= 0) {
        categorized[catIndex].articles.push(article);
      }
    } else {
      otherCategory.articles.push(article);
    }
  }
  
  if (otherCategory.articles.length > 0) {
    categorized.push(otherCategory);
  }
  
  return categorized
    .filter(cat => cat.articles.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// Strapi API 处理类
class StrapiApiAdapter {
  private baseUrl: string;
  private issuesEndpoint: string;
  private articlesEndpoint: string;
  private categoriesEndpoint: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.issuesEndpoint = API_CONFIG.endpoints.issues;
    this.articlesEndpoint = API_CONFIG.endpoints.articles;
    this.categoriesEndpoint = API_CONFIG.endpoints.categories;
  }

  // 获取所有期刊
  async getAllIssues(): Promise<IssueContent[]> {
    try {
      // Append populate=cover_image to fetch the image URL
      const response = await fetch(`${this.baseUrl}${this.issuesEndpoint}?populate=cover_image`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      // Assuming data.data contains the array of issues
      const issues = data.data || [];
      
      // Derive the Strapi server root URL from the API base URL
      const serverRoot = API_CONFIG.baseUrl.replace('/api', '');

      return issues.map((issue: StrapiIssueResponse) => {
        // Safely access nested cover_image url
        const relativeIconUrl = issue.cover_image?.url;
        let absoluteIconUrl = '/default-icon.png'; // Default icon

        if (relativeIconUrl && relativeIconUrl.startsWith('/')) {
          // Construct the absolute URL by prepending the Strapi server root URL
          absoluteIconUrl = `${serverRoot}${relativeIconUrl}`;
        } else if (relativeIconUrl) {
          // If it's already an absolute URL (less likely for Strapi local provider), use it directly
          absoluteIconUrl = relativeIconUrl;
        }

        return {
          id: issue.id,
          number: issue.issue_number,
          title: issue.title,
          subtitle: issue.description || `Vol ${issue.issue_number}`,
          icon: absoluteIconUrl, // Use the absolute URL
          date: issue.publishedAt ? new Date(issue.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          documentId: issue.documentId
        };
      }).sort((a: IssueContent, b: IssueContent) => b.number - a.number); // 按期数降序排序
    } catch (error) {
      console.error('获取期数失败:', error);
      throw error;
    }
  }

  // 获取最新一期
  async getLatestIssue(): Promise<IssueContent | null> {
    try {
      // 方案一：先尝试获取一般的期刊数据
      const allIssues = await this.getAllIssues();
      
      if (allIssues.length === 0) {
        return null;
      }
      
      const latestIssue = allIssues[0]; // 已按期数降序排序，第一个即为最新
      latestIssue.isLatest = true;
      
      try {
        // 方案二：单独获取 topics 数据
        const topicsResponse = await fetch(`${this.baseUrl}${this.issuesEndpoint}/${latestIssue.documentId}?populate=topics`);
        
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          if (topicsData.data && topicsData.data.topics) {
            // 处理 topics 数据
            latestIssue.topics = topicsData.data.topics.map((topic: StrapiTopicResponse) => ({
              id: topic.id,
              documentId: topic.documentId,
              title: topic.title
            }));
          }
        }
      } catch (topicsError) {
        console.error('获取主题数据失败:', topicsError);
        // 忽略错误，继续返回没有 topics 的 latestIssue
      }
      
      return latestIssue;
    } catch (error) {
      console.error('获取最新期数失败:', error);
      throw error;
    }
  }

  // 获取所有分类
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.categoriesEndpoint}`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const categories = data.data || [];
      
      // 按 sort_order 排序
      return categories.sort((a: Category, b: Category) => {
        const sortA = a.sort_order || 999;
        const sortB = b.sort_order || 999;
        return sortA - sortB;
      });
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  }

  // 获取文章详情（含分类信息）
  async getArticleDetail(articleId: string): Promise<ArticleDetail | null> {
    try {
      const response = await fetch(`${this.baseUrl}${this.articlesEndpoint}/${articleId}?populate=*`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.data) {
        return null;
      }
      
      return data.data as ArticleDetail;
    } catch (error) {
      console.error(`获取文章详情失败: ${articleId}`, error);
      throw error;
    }
  }

  // New method to get an issue with articles already categorized
  async getIssueWithCategorizedArticles(issueDocumentId: string): Promise<CategoryWithArticles[]> {
    try {
      // 1. Fetch all categories concurrently
      const categoriesPromise = this.getAllCategories();

      // 2. Fetch basic issue data to get article list
      const issueResponse = await fetch(`${this.baseUrl}${this.issuesEndpoint}/${issueDocumentId}?populate=articles`);
      if (!issueResponse.ok) {
        throw new Error(`获取期刊详情失败: ${issueResponse.status}`);
      }
      const issueData = await issueResponse.json();

      if (!issueData.data || !issueData.data.articles || !issueData.data.articles.length) {
        console.log("[API Adapter] 期刊中没有文章");
        return []; // Return empty array if no articles
      }

      const articlesInIssue: Article[] = issueData.data.articles;

      // 3. Fetch details for each article concurrently
      const detailPromises = articlesInIssue.map(article => 
        this.getArticleDetail(article.documentId)
      );

      // 4. Wait for all promises to resolve
      const [allCategories, articleDetailsResults] = await Promise.all([
        categoriesPromise,
        Promise.all(detailPromises)
      ]);

      // 5. Filter out null details
      const validArticleDetails = articleDetailsResults.filter(
        (article): article is ArticleDetail => article !== null
      );

      // 6. Organize articles by category using the helper function
      return organizeArticlesByCategory(validArticleDetails, allCategories);

    } catch (error) {
      console.error(`获取分类文章失败 for issue ${issueDocumentId}:`, error);
      throw error; // Re-throw error to be handled by the caller
    }
  }

  // 根据期号获取期刊
  async getIssueByNumber(issueNumber: number): Promise<IssueContent | null> {
    try {
      // 获取所有期刊
      const allIssues = await this.getAllIssues();
      
      // 查找指定期号的期刊
      const targetIssue = allIssues.find(issue => issue.number === issueNumber);
      
      if (!targetIssue) {
        console.log(`[API Adapter] 未找到期号为 ${issueNumber} 的期刊`);
        return null;
      }
      
      try {
        // 获取 topics 数据
        const topicsResponse = await fetch(`${this.baseUrl}${this.issuesEndpoint}/${targetIssue.documentId}?populate=topics`);
        
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          if (topicsData.data && topicsData.data.topics) {
            // 处理 topics 数据
            targetIssue.topics = topicsData.data.topics.map((topic: StrapiTopicResponse) => ({
              id: topic.id,
              documentId: topic.documentId,
              title: topic.title
            }));
          }
        }
      } catch (topicsError) {
        console.error('获取主题数据失败:', topicsError);
        // 忽略错误，继续返回没有 topics 的期刊
      }
      
      return targetIssue;
    } catch (error) {
      console.error(`获取期号为 ${issueNumber} 的期刊失败:`, error);
      throw error;
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
 * 获取最新一期
 */
export async function getLatestIssue(): Promise<IssueContent | null> {
  return apiAdapter.getLatestIssue();
}

/**
 * 获取所有分类
 */
export async function getAllCategories(): Promise<Category[]> {
  return apiAdapter.getAllCategories();
}

/**
 * 获取文章详情（含分类信息）
 * @param articleId 文章ID
 */
export async function getArticleDetail(articleId: string): Promise<ArticleDetail | null> {
  return apiAdapter.getArticleDetail(articleId);
}

/**
 * 获取指定期刊的、已按分类组织好的文章列表
 * @param issueDocumentId 期刊的 documentId
 * @returns Promise<CategoryWithArticles[]>
 */
export async function getIssueWithCategorizedArticles(issueDocumentId: string): Promise<CategoryWithArticles[]> {
  return apiAdapter.getIssueWithCategorizedArticles(issueDocumentId);
}

/**
 * 根据期号获取期刊
 * @param issueNumber 期号
 */
export async function getIssueByNumber(issueNumber: number): Promise<IssueContent | null> {
  return apiAdapter.getIssueByNumber(issueNumber);
} 