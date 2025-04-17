/**
 * 期刊内容数据接口
 */
export interface IssueContent {
  id: number;          // 文章ID
  number: number;      // 期数
  title: string;       // 标题
  subtitle: string;    // 副标题/描述
  items: string[];     // 文章标题列表
  author: string;      // 作者
  icon: string;        // 封面图URL
  date: string;        // 发布日期
  isLatest?: boolean;  // 是否是最新一期，仅在getLatestIssue返回时设置
  slug: string;        // URL路径，格式为"vol-{期数}"
  documentId: string;  // Strapi文档ID，用于API请求
} 