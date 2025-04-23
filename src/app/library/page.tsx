"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getAllIssues } from '@/lib/api/apiAdapter';
import { IssueContent } from '@/types/issue';
import { motion } from 'framer-motion';

// 配置项：控制模拟数据复制的份数。设为 1 表示不复制（使用真实数据）。
const MOCK_DATA_MULTIPLIER = 10;

// 单个期刊项的组件（保持不变）
interface IssueItemProps {
  issue: IssueContent;
}

const IssueItem: React.FC<IssueItemProps> = ({ issue }) => {
  // 确保 issue 对象存在并且 number 属性有效
  const issueNumber = issue?.number ?? 0;
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex-none w-3xs text-[120px] text-right font-newyork-large">Vol</div>
      <div className="-mx-4">
        {/* 添加 key 以便 Image 组件正确更新 */}
        <Image key={issueNumber} src={issue?.icon || '/test.png'} alt="cover" width={200} height={200} priority={true} />
      </div>
      <div className="flex-none w-3xs text-[120px] text-left font-newyork-large">
        {issueNumber.toString().padStart(2, '0')}
      </div>
    </div>
  );
};


const LibraryPage: React.FC = () => {
  const [issues, setIssues] = useState<IssueContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const canScrollRef = useRef(true); // Ref for throttling scroll events

  // 统一动画配置
  const transitionConfig = {
    duration: 0.6, // 恢复较快的动画时长，可按需调整
    ease: "linear",
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const fetchedIssues = await getAllIssues();

        if (Array.isArray(fetchedIssues)) {
          const sortedIssues = fetchedIssues.sort((a, b) => b.number - a.number);

          if (sortedIssues.length > 0 && MOCK_DATA_MULTIPLIER > 1) {
            const duplicatedIssues = Array.from({ length: MOCK_DATA_MULTIPLIER }, () =>
              sortedIssues.map(issue => ({
                ...issue,
                // 只复制 issue 内容，不添加额外属性
                // key 的唯一性将在 map 中处理
              }))
            ).flat();
             // 重新分配唯一的 number 以便排序和索引查找，或者使用 id
             // 这里我们假设 MOCK 主要是为了增加数量，保持原始 number 用于显示
             // 如果需要基于 number 进行精确索引查找，需要重新设计 id/number
             setIssues(duplicatedIssues);
          } else {
            setIssues(sortedIssues);
          }
        } else {
          console.error("Fetched data is not an array or is invalid:", fetchedIssues);
          setError("加载的数据格式不正确。");
          setIssues([]);
        }
      } catch (err) {
        console.error("Failed to fetch issues:", err);
        setError("无法加载期刊列表，请稍后再试。");
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);


  useEffect(() => {
    const container = containerRef.current;
    // throttleDelay: Cooldown period after animation before allowing next scroll
    const coolDownDelay = 500; // Increased cooldown period in ms
    const animationDurationMs = transitionConfig.duration * 1000;

    if (!container || issues.length === 0) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Strict Lock: If scroll is not allowed (already scrolling or cooling down), ignore immediately.
      if (!canScrollRef.current) return;

      // Secondary Lock: If animation is playing, ignore.
      if (isAnimating) return;

      // --- If checks passed, proceed --- 
 
      const scrollDirection = e.deltaY > 0 ? 1 : -1;
      const targetIndex = Math.min(
        Math.max(currentIndex + scrollDirection, 0),
        issues.length - 1 // 使用 issues.length
      );

      if (targetIndex !== currentIndex) {
        // Lock immediately
        canScrollRef.current = false;
        setIsAnimating(true);
        setCurrentIndex(targetIndex);

        // Timer 1: Reset animation lock after animation duration
        setTimeout(() => {
          setIsAnimating(false);
        }, animationDurationMs);

        // Timer 2: Reset scroll lock only after animation + cooldown period
        setTimeout(() => {
            canScrollRef.current = true;
        }, animationDurationMs + coolDownDelay);
       }
     };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
    // Dependencies updated
  }, [currentIndex, isAnimating, issues.length, transitionConfig.duration]);

  // 点击导航处理
  const handleNavigation = (newIndex: number) => {
    if (!isAnimating && newIndex >= 0 && newIndex < issues.length && newIndex !== currentIndex) {
      setIsAnimating(true);
      setCurrentIndex(newIndex);
      setTimeout(() => {
        setIsAnimating(false);
      }, transitionConfig.duration * 1000);
    }
  };

  // 计算样式
  const getStyle = (index: number) => {
    const offset = index - currentIndex;
    let y = '0%';
    let scale = 1;
    let opacity = 0;
    let zIndex = 0;
    const previewScale = 0.3; // 使用变量

    if (offset === 0) { // 当前
      scale = 1;
      opacity = 1;
      zIndex = 10;
      y = '0%'; // Center vertically in the h-screen container
    } else if (offset === -1) { // 上一个
      scale = previewScale;
      // opacity = 0.85;
      zIndex = 5;
      y = '-35%'; // Position center near top (approx 15vh from top)
    } else if (offset === 1) { // 下一个
      scale = previewScale;
      // opacity = 0.85;
      zIndex = 5;
      y = '35%'; // Position center near bottom (approx 15vh from bottom)
    } else if (offset < -1) { // 更早的
      scale = previewScale;
      opacity = 0;
      zIndex = 0;
      y = '-100%'; // Move completely off-screen top
    } else { // 更晚的 (offset > 1)
      scale = previewScale;
      opacity = 0;
      zIndex = 0;
      y = '100%'; // Move completely off-screen bottom
    }

    return { y, scale, opacity, zIndex };
  };


  if (loading) {
    return ( /* Loading state JSX */
        <div className="h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
                <p>加载中...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return ( /* Error state JSX */
        <div className="h-screen flex items-center justify-center text-red-500">
            {error}
        </div>
    );
  }

  if (!issues.length) {
    return ( /* No data state JSX */
        <div className="h-screen flex items-center justify-center text-gray-500">
            暂无往期杂志。
        </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-100"> {/* 添加背景色以便观察 */}
      <div ref={containerRef} className="h-screen w-full relative perspective"> {/* perspective 可以在父级添加 */}
          {issues.map((issue, index) => {
            // 确保 issue 有唯一标识符用于 key
            // 使用 issue.number 和 index 生成唯一的 key
            // 假设 issue.number 在原始数据中可能不唯一，但在模拟时我们需要唯一 key
            const uniqueKey = `issue-${issue.number}-${index}`;
            const style = getStyle(index);
            const isPrev = index === currentIndex - 1;
            const isNext = index === currentIndex + 1;

            return (
              <motion.div
                key={uniqueKey} // 使用唯一 key
                className="absolute w-full h-screen top-0 left-0 flex items-center justify-center" // 改为全屏容器
                style={{
                    // transformOrigin: 'center center', // 确保缩放中心正确
                    cursor: (isPrev || isNext) ? 'pointer' : 'default'
                }}
                animate={style}
                transition={transitionConfig}
                onClick={() => {
                    if (isPrev) handleNavigation(currentIndex - 1);
                    if (isNext) handleNavigation(currentIndex + 1);
                }}
              >
                {/* 传递 issue 数据给 Item */}
                {/* 需要确保 IssueItem 能处理 issue 可能为 undefined 的情况或进行断言 */}
                <IssueItem issue={issue} />
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

export default LibraryPage;
