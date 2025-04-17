import { IssueContent } from "@/types/issue";
import { apiAdapter } from "./apiAdapter";
import type { ArticleData } from "./apiAdapter";

// 导出ArticleData接口供其他文件使用
export type { ArticleData };

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