/**
 * 期数内容数据接口 
 * 合并了之前Issue和IssueContent接口
 */
export interface IssueContent {
  id: number;        // 文章ID
  number: number;    // 期数号
  title: string;     // 标题
  subtitle: string;  // 副标题
  items: string[];   // 内容项目列表
  author?: string;   // 作者
  icon: string;      // 图片URL
  date?: string;     // 发布日期
  isLatest?: boolean; // 是否是最新一期
  slug?: string;     // URL slug，用于导航
} 