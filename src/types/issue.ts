// 定义期数内容数据接口
export interface IssueContent {
  id: number;
  number: number;
  color: string;
  title: string;
  subtitle: string;
  items: string[];
  author?: string;
  icon: string; // 图片URL
  date?: string; // 发布日期
} 