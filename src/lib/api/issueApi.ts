import { IssueContent } from "@/types/issue";
import { issueContents } from "@/data/issueContents";

/**
 * 获取所有期刊数据
 * 日后可替换为从WordPress API获取数据
 */
export async function getAllIssues(): Promise<IssueContent[]> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  return issueContents;
}

/**
 * 获取指定期数的内容
 * @param issueNumber 期数
 */
export async function getIssueByNumber(issueNumber: number): Promise<IssueContent | null> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  return issueContents.find(issue => issue.number === issueNumber) || null;
}

/**
 * 获取最新一期
 */
export async function getLatestIssue(): Promise<IssueContent | null> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 按期数降序排序，取第一个
  const sortedIssues = [...issueContents].sort((a, b) => b.number - a.number);
  return sortedIssues[0] || null;
} 