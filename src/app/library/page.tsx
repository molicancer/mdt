"use client";

import { useEffect, useState, useRef } from "react";
import { getAllIssues, getIssueByNumber } from "@/lib/api/apiAdapter";
import { IssueContent } from "@/types/issue";
import { Header } from "@/components/home/Header";
import { BlurMasks } from "@/components/home/BlurMasks";
import { ScrollDownIndicator } from "@/components/home/ScrollDownIndicator";
import { EmblaCarousel } from "@/components/library/EmblaCarousel";

export default function LibraryPage() {
  const [issues, setIssues] = useState<IssueContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  // 虽然在UI中未直接使用，但在数据流逻辑中需要保持状态以便正确加载每个期刊的详细内容
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeIssue, setActiveIssue] = useState<IssueContent | null>(null);

  // 获取期刊数据
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true);
        const data = await getAllIssues();
        setIssues(data);
        
        // 默认选中第一个期刊
        if (data.length > 0) {
          const issue = await getIssueByNumber(data[0].number);
          setActiveIssue(issue);
        }
        
        setError(null);
      } catch (err) {
        console.error("获取期刊失败:", err);
        setError("获取期刊数据失败，请稍后重试");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // 处理索引变化
  const handleIndexChange = async (index: number) => {
    if (issues[index]) {
      // 如果当前期刊没有详细信息，则获取
      if (!issues[index].topics) {
        try {
          const issue = await getIssueByNumber(issues[index].number);
          if (issue) {
            // 更新当前激活的期刊
            setActiveIssue(issue);
            
            // 更新issues数组中的对应项
            const updatedIssues = [...issues];
            updatedIssues[index] = {
              ...updatedIssues[index],
              topics: issue.topics
            };
            setIssues(updatedIssues);
          }
        } catch (err) {
          console.error(`获取期刊 ${issues[index].number} 详情失败:`, err);
        }
      } else {
        // 如果已有详细信息，直接设置
        setActiveIssue(issues[index]);
      }
    }
  };

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl">加载中...</p>
      </div>
    );
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl text-red-500">{error}</p>
      </div>
    );
  }

  // 如果没有期刊数据，显示空状态
  if (issues.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl">暂无期刊数据</p>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="relative w-full">
      <Header />
      <BlurMasks />
      <ScrollDownIndicator />
      <EmblaCarousel
        items={issues}
        className="w-full mx-auto carousel-container"
        onIndexChange={handleIndexChange}
      />
    </div>
  );
} 