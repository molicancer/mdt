import { IssueContent, Article, CategoryWithArticles } from "@/types/issue";
import { STRAPI_CONFIG, processStrapiImageUrl, processStrapiRichTextImages } from "@/lib/utils";

// Strapi API 处理类
class StrapiApiAdapter {
  private baseUrl: string;
  private issuesEndpoint: string;
  private articlesEndpoint: string;
  private categoriesEndpoint: string;

  constructor() {
    this.baseUrl = STRAPI_CONFIG.BASE_URL;
    this.issuesEndpoint = STRAPI_CONFIG.endpoints.issues;
    this.articlesEndpoint = STRAPI_CONFIG.endpoints.articles;
    this.categoriesEndpoint = STRAPI_CONFIG.endpoints.categories;
  }

  // 获取所有期刊
  async getAllIssues(): Promise<IssueContent[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.issuesEndpoint}?populate=cover_image`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      const issues = data.data || [];

      return issues.map((issue: StrapiIssueResponse) => {
        // 安全获取封面图片URL
        const relativeIconUrl = issue.cover_image?.url;
        let absoluteIconUrl = '/img/default-issue.png'; // 默认图标

        if (relativeIconUrl) {
          // 处理图片URL
          absoluteIconUrl = processStrapiImageUrl(relativeIconUrl);
        }

        return {
          id: issue.id,
          number: issue.issue_number,
          title: issue.title,
          subtitle: issue.description || `Vol ${issue.issue_number}`,
          icon: absoluteIconUrl,
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
      const allIssues = await this.getAllIssues();
      
      if (allIssues.length === 0) {
        return null;
      }
      
      const latestIssue = allIssues[0]; // 已按期数降序排序，第一个即为最新
      latestIssue.isLatest = true;
      
      try {
        // 获取主题数据
        const topicsResponse = await fetch(`${this.baseUrl}${this.issuesEndpoint}/${latestIssue.documentId}?populate=topics`);
        
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          if (topicsData.data && topicsData.data.topics) {
            latestIssue.topics = topicsData.data.topics.map((topic: StrapiTopicResponse) => ({
              id: topic.id,
              documentId: topic.documentId,
              title: topic.title
            }));
          }
        }
      } catch (topicsError) {
        console.error('获取主题数据失败:', topicsError);
        // 忽略错误，继续返回没有topics的latestIssue
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
      
      // 按sort_order排序
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
      const response = await fetch(`${this.baseUrl}${this.articlesEndpoint}/${articleId}?populate=category`);
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.data) {
        return null;
      }
      
      const article = data.data as ArticleDetail;
      
      // 处理文章内容中的图片路径
      if (article.content) {
        article.content = processStrapiRichTextImages(article.content);
      }
      
      return article;
    } catch (error) {
      console.error(`获取文章详情失败: ${articleId}`, error);
      throw error;
    }
  }

  // 获取带分类的期刊文章
  async getIssueWithCategorizedArticles(issueDocumentId: string): Promise<CategoryWithArticles[]> {
    try {
      // 1. 并行获取所有分类
      const categoriesPromise = this.getAllCategories();

      // 2. 获取期刊数据和文章列表
      const issueResponse = await fetch(`${this.baseUrl}${this.issuesEndpoint}/${issueDocumentId}?populate=articles`);
      if (!issueResponse.ok) {
        throw new Error(`获取期刊详情失败: ${issueResponse.status}`);
      }
      const issueData = await issueResponse.json();

      if (!issueData.data || !issueData.data.articles || !issueData.data.articles.length) {
        console.log("[API Adapter] 期刊中没有文章");
        return []; // 如果没有文章，返回空数组
      }

      const articlesInIssue: Article[] = issueData.data.articles;

      // 3. 并行获取每篇文章的详细信息
      const detailPromises = articlesInIssue.map(article => 
        this.getArticleDetail(article.documentId)
      );

      // 4. 等待所有Promise解析完成
      const [allCategories, articleDetailsResults] = await Promise.all([
        categoriesPromise,
        Promise.all(detailPromises)
      ]);

      // 5. 过滤掉空值
      const validArticleDetails = articleDetailsResults.filter(
        (article): article is ArticleDetail => article !== null
      );

      // 6. 使用辅助函数按分类组织文章
      return organizeArticlesByCategory(validArticleDetails, allCategories);

    } catch (error) {
      console.error(`获取分类文章失败 for issue ${issueDocumentId}:`, error);
      throw error;
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
        // 获取topics数据
        const topicsResponse = await fetch(`${this.baseUrl}${this.issuesEndpoint}/${targetIssue.documentId}?populate=topics`);
        
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          if (topicsData.data && topicsData.data.topics) {
            targetIssue.topics = topicsData.data.topics.map((topic: StrapiTopicResponse) => ({
              id: topic.id,
              documentId: topic.documentId,
              title: topic.title
            }));
          }
        }
      } catch (topicsError) {
        console.error('获取主题数据失败:', topicsError);
        // 忽略错误，继续返回没有topics的期刊
      }
      
      return targetIssue;
    } catch (error) {
      console.error(`获取期号为 ${issueNumber} 的期刊失败:`, error);
      throw error;
    }
  }
}

// 文章详情接口（包含分类）
export interface ArticleDetail {
  id: number;
  documentId: string;
  title: string;
  content: string;
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
  icon?: string;     // 分类图标
  emoji?: string;    // 分类表情
}

// Strapi响应接口定义
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

// 按分类组织文章
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
    icon: cat.icon,      // 添加icon字段
    emoji: cat.emoji,    // 添加emoji字段
    articles: []
  }));
  
  const otherCategory: CategoryWithArticles = {
    id: "other",
    name: "🔮 未分类",
    sortOrder: 1000,
    emoji: "🔮",       // 为未分类添加emoji
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
 * @param issueDocumentId 期刊的documentId
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