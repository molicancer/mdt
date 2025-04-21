/**
 * 期刊内容数据接口
 */
export interface IssueContent {
  id: number;          // 文章ID
  number: number;      // 期数
  title: string;       // 标题
  subtitle: string;    // 副标题/描述
  icon: string;        // 封面图URL
  date: string;        // 发布日期
  isLatest?: boolean;  // 是否是最新一期，仅在getLatestIssue返回时设置
  documentId: string;  // Strapi文档ID，用于API请求
}

// 代表从 Issue API 返回的文章基本信息
export interface Article {
  id: number;
  documentId: string;
  title: string;
  // 可能还有其他基础字段，根据 API 实际情况添加
}

// 分组后的文章结构
export interface CategoryWithArticles {
  id: number | string; // 'other' category uses string ID
  name: string;
  sortOrder: number;
  articles: import('@/lib/api/apiAdapter').ArticleDetail[]; // Import ArticleDetail type
} 