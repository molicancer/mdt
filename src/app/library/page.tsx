"use client"

import { useRef, useState, useEffect, WheelEvent, useCallback } from "react"
import Image from "next/image";
import { motion, useMotionValue, useSpring, type PanInfo } from "framer-motion"

import { cn } from "@/lib/utils"
import { useI18n } from '@/i18n';
import { getAllIssues, getIssueByNumber } from "@/lib/api/apiAdapter";
import { IssueContent } from "@/types/issue";
import { Header } from "@/components/home/Header";
import { BlurMasks } from "@/components/home/BlurMasks";
import { ScrollDownIndicator } from "@/components/home/ScrollDownIndicator";

const START_INDEX = 0  // 从第一条内容开始
const DRAG_THRESHOLD = 50
const FALLBACK_HEIGHT_VH = 40  // 当前项目视口高度的40%
const PREV_ITEM_HEIGHT_VH = 25  // 上一条内容视口高度的25%
const NEXT_ITEM_HEIGHT_VH = 25  // 下一条内容视口高度的25%
const ANIMATION_DURATION = 300  // 动画时间
// 触摸板滚动事件的节流延迟（毫秒）
const WHEEL_THROTTLE = 1000

export default function LibraryPage() {
  const { locale } = useI18n();
  const containerRef = useRef<HTMLUListElement>(null)
  const [activeSlide, setActiveSlide] = useState(START_INDEX)
  
  // 添加期刊数据状态
  const [issues, setIssues] = useState<IssueContent[]>([])
  
  // 格式化日期支持国际化
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
      
    // 中文日期格式
    if (locale === 'zh') {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}年${month}月${day}日`;
    } 
    // 英文日期格式
    else {
      const options: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    }
  };
    
  const canScrollPrev = activeSlide > 0
  const canScrollNext = activeSlide < issues.length - 1
  const offsetY = useMotionValue(0)
  const animatedY = useSpring(offsetY, {
    damping: 40,
    stiffness: 400,
    mass: 0.1,
  })
  
  // 动画锁定状态
  const isAnimatingRef = useRef(false)
  // 存储最后一次触发滚动的时间
  const lastScrollTimeRef = useRef(0)
  // 触摸板操作是否已触发滚动
  const hasTriggeredRef = useRef(false)
  // 容器高度
  const [containerHeight, setContainerHeight] = useState(0)
  // 视口高度
  const [viewportHeight, setViewportHeight] = useState(0)
  
  // 获取期刊数据
  useEffect(() => {
    async function fetchIssues() {
      try {
        // 获取所有期刊基本数据
        const issuesData = await getAllIssues();
        
        // 为每个期刊获取完整数据（包含主题）
        const completeIssuesPromises = issuesData.map(async (issue) => {
          try {
            // 使用getIssueByNumber获取包含topics的完整数据
            const completeIssue = await getIssueByNumber(issue.number);
            return completeIssue || issue;
          } catch (error) {
            console.error(`获取期刊 ${issue.number} 的主题失败:`, error);
            return issue;
          }
        });
        
        // 等待所有期刊数据加载完成
        const completeIssues = await Promise.all(completeIssuesPromises);
        setIssues(completeIssues as IssueContent[]);
      } catch (error) {
        console.error("获取期刊数据失败:", error);
      }
    }
    
    fetchIssues();
  }, []);
  
  // 当活动幻灯片变化时，确保有topics数据
  useEffect(() => {
    if (issues.length === 0 || activeSlide >= issues.length || !('number' in issues[activeSlide])) return;
    
    const currentIssue = issues[activeSlide] as IssueContent;
    
    // 如果当前期刊没有topics数据，尝试重新获取
    if (!currentIssue.topics) {
      async function fetchTopics() {
        try {
          const issueWithTopics = await getIssueByNumber(currentIssue.number);
          if (issueWithTopics && issueWithTopics.topics) {
            // 更新当前期刊的topics数据
            const updatedIssues = [...issues];
            const issueIndex = updatedIssues.findIndex(issue => issue.number === currentIssue.number);
            
            if (issueIndex !== -1) {
              updatedIssues[issueIndex] = {
                ...updatedIssues[issueIndex],
                topics: issueWithTopics.topics
              };
              setIssues(updatedIssues);
            }
          }
        } catch (error) {
          console.error(`获取期刊 ${currentIssue.number} 的主题失败:`, error);
        }
      }
      
      fetchTopics();
    }
  }, [activeSlide, issues]);
  
  // 根据项目索引和当前活动索引获取项目高度
  const getItemHeightVh = useCallback((index: number, activeIndex: number) => {
    if (index === activeIndex) {
      return FALLBACK_HEIGHT_VH;
    } else if (index < activeIndex) {
      return PREV_ITEM_HEIGHT_VH;
    } else {
      return NEXT_ITEM_HEIGHT_VH;
    }
  }, []);

  // 计算项目的实际高度（像素）
  const getItemHeight = useCallback((index: number, activeIndex: number) => {
    const heightVh = getItemHeightVh(index, activeIndex);
    // 确保 viewportHeight 有效值，避免计算出 NaN 或 0
    return (viewportHeight || 0) * (heightVh / 100);
  }, [viewportHeight, getItemHeightVh]);

  // 计算每个项目的垂直位置，使其居中显示 (修改后，不依赖 offsetHeight)
  const getItemOffset = useCallback((index: number) => {
    // 确保容器和视口高度有效
    if (!containerRef.current || containerHeight <= 0 || viewportHeight <= 0) {
      return 0;
    }

    const viewportCenterY = containerHeight / 2;

    // 计算目标项目之前的总高度和间距
    let totalOffsetBefore = 0;
    for (let i = 0; i < index; i++) {
      // 使用 getItemHeight 来计算高度
      const prevItemHeight = getItemHeight(i, activeSlide);
      const prevItemMargin = i > 0 ? 40 : 0; // 项目间距
      totalOffsetBefore += prevItemHeight + prevItemMargin;
    }

    // 获取目标项目的高度
    const currentItemHeight = getItemHeight(index, activeSlide);

    // 计算目标项目中心点相对于列表顶部的距离
    const currentItemCenterRelativeToTop = totalOffsetBefore + currentItemHeight / 2;

    // 计算需要的 translateY 值，使得目标项目中心对齐视口中心
    const targetOffset = viewportCenterY - currentItemCenterRelativeToTop;

    return targetOffset;
    // 依赖项现在包含 viewportHeight，因为 getItemHeight 依赖它
  }, [containerHeight, viewportHeight, activeSlide, getItemHeight]); // 依赖项更新

  // 初始化和窗口大小变化时重新计算容器高度
  useEffect(() => {
    const updateHeights = () => {
      // 确保获取到的是有效值
      setViewportHeight(window.innerHeight || 0);
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight || 0);
      }
    };

    // 初始更新
    updateHeights();

    // 监听窗口大小变化
    window.addEventListener('resize', updateHeights);
    return () => window.removeEventListener('resize', updateHeights);
  }, []); // 保持空依赖

  // 活动滑块变化时或容器/视口高度变化时调整偏移量
  useEffect(() => {
    // 确保高度有效再计算和设置偏移量
    if (containerHeight > 0 && viewportHeight > 0) {
      const newOffset = getItemOffset(activeSlide);
      offsetY.set(newOffset);
      // animatedY 会根据 offsetY 自动更新，无需显式设置 animatedY.set(newOffset);
    }
    // 依赖项需要包含所有影响 newOffset 计算的值
  }, [activeSlide, containerHeight, viewportHeight, offsetY, getItemOffset]); // 依赖项更新

  // 锁定页面滚动
  useEffect(() => {
    // 保存原始样式
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // 禁用滚动
    document.body.style.overflow = 'hidden';
    
    // 阻止默认的触摸滚动行为
    const preventDefault = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    // 组件卸载时恢复
    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  // 强制滚动到指定索引，增加更强的控制
  const goToSlide = (index: number) => {
    if (index < 0 || index >= issues.length || isAnimatingRef.current) {
      return;
    }
    
    // 确保只能滚动到相邻的幻灯片（仅在拖拽和滚轮操作时应用）
    if (Math.abs(index - activeSlide) > 1) {
      // 如果目标幻灯片超过一条距离，则只滚动一条
      const newIndex = index > activeSlide ? activeSlide + 1 : activeSlide - 1;
      index = newIndex;
    }
    
    isAnimatingRef.current = true;
    const newOffset = getItemOffset(index);
    
    offsetY.set(newOffset);
    setActiveSlide(index);
    
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, ANIMATION_DURATION);
  };
  
  // 指示器点击直接跳转到对应项目
  const jumpToSlide = (index: number) => {
    if (index < 0 || index >= issues.length || isAnimatingRef.current) {
      return;
    }
    
    isAnimatingRef.current = true;
    const newOffset = getItemOffset(index);
    
    offsetY.set(newOffset);
    setActiveSlide(index);
    
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, ANIMATION_DURATION);
  };

  // 处理触摸板滚动事件
  function handleWheel(e: WheelEvent<HTMLUListElement>) {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    
    // 如果在动画中或者在节流期内，忽略滚动事件
    if (isAnimatingRef.current || (now - lastScrollTimeRef.current < WHEEL_THROTTLE)) {
      return;
    }
    
    // 如果这次触摸板操作已经触发了滚动，忽略后续事件
    if (hasTriggeredRef.current) {
      return;
    }
    
    // 标记本次触摸板操作已触发滚动
    hasTriggeredRef.current = true;
    lastScrollTimeRef.current = now;
    
    // 延迟一段时间后重置触发标记，允许下一次触摸板操作
    setTimeout(() => {
      hasTriggeredRef.current = false;
    }, WHEEL_THROTTLE);
    
    // 根据方向滚动一页，不管滚动力度有多大，始终只滚动一条
    if (e.deltaY > 0 && canScrollNext) {
      goToSlide(activeSlide + 1);
    } else if (e.deltaY < 0 && canScrollPrev) {
      goToSlide(activeSlide - 1);
    }
  }

  // 处理拖拽结束事件，增强控制
  function handleDragSnap(_: MouseEvent, { offset: { y: dragOffset } }: PanInfo) {
    // 重置拖拽状态
    containerRef.current?.removeAttribute("data-dragging");
    
    // 如果正在动画中，忽略拖拽
    if (isAnimatingRef.current) {
      snapToCurrentPosition();
      return;
    }
    
    // 判断拖拽方向并且只移动一页
    // 即使快速拖动，也只会移动一条
    if (Math.abs(dragOffset) > DRAG_THRESHOLD) {
      if (dragOffset > 0 && canScrollPrev) {
        // 向上拖拽，显示上一个（始终只滚动一条）
        goToSlide(activeSlide - 1);
      } else if (dragOffset < 0 && canScrollNext) {
        // 向下拖拽，显示下一个（始终只滚动一条）
        goToSlide(activeSlide + 1);
      } else {
        // 无法移动时回弹
        snapToCurrentPosition();
      }
    } else {
      // 拖拽不够，回弹到当前位置
      snapToCurrentPosition();
    }
  }
  
  // 辅助函数：回弹到当前位置
  function snapToCurrentPosition() {
    offsetY.set(getItemOffset(activeSlide));
  }

  // 按钮点击事件处理
  function scrollPrev() {
    if (isAnimatingRef.current || !canScrollPrev) return;
    goToSlide(activeSlide - 1);
  }

  function scrollNext() {
    if (isAnimatingRef.current || !canScrollNext) return;
    goToSlide(activeSlide + 1);
  }

  return (
    <>
      <Header />
      <BlurMasks />
      <ScrollDownIndicator />
      <div className="h-screen w-full flex items-center justify-center px-6 relative overflow-hidden group">
        <motion.ul
          ref={containerRef}
          className="flex flex-col cursor-default items-center absolute inset-0"
          style={{
            y: animatedY,
          }}
          drag="y"
          dragConstraints={{
            // 计算拖拽限制时考虑每个项目的实际高度
            top: viewportHeight ? (() => {
              let totalHeight = 0;
              for (let i = 0; i < issues.length - 1; i++) {
                totalHeight += getItemHeight(i, activeSlide) + (i > 0 ? 40 : 0);
              }
              return -totalHeight;
            })() : 0,
            bottom: viewportHeight ? getItemHeight(0, activeSlide) : 0,
          }}
          // 增加拖拽阻尼，使快速拖拽时的惯性减小
          dragElastic={0.1}
          // 拖拽移动速度约束
          dragMomentum={false}
          // 限制手势传播，防止其他手势干扰
          dragPropagation={false}
          // 增加过渡效果的控制
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40,
            mass: 1
          }}
          onWheel={handleWheel}
          onDragStart={() => {
            containerRef.current?.setAttribute("data-dragging", "true")
          }}
          onDragEnd={handleDragSnap}
        >
          {issues.map((issue, index) => {
            const active = index === activeSlide
            const isPrev = index < activeSlide
            const isNext = index > activeSlide
            
            // 计算项目应该使用的高度比例
            let heightVh = FALLBACK_HEIGHT_VH; // 默认高度
            if (!active) {
              heightVh = isPrev ? PREV_ITEM_HEIGHT_VH : NEXT_ITEM_HEIGHT_VH;
            }
            
            // 获取期刊数据
            const issueNumber = issue.number;
            const iconSrc = issue.icon;
            const title = issue.title;
            const key = issue.id.toString();
            const date = issue.date;
            const topics = issue.topics;
            
            return (
              <motion.li
                layout
                key={key}
                className={cn(
                  "group relative shrink-0 select-none w-full flex flex-col items-center justify-center",
                  active ? "opacity-100" : "opacity-50",
                )}
                animate={{
                  scale: active ? 1 : 0.5,
                  y: active ? 0 : (isPrev ? -50 : 50),
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.5,
                }}
                style={{
                  height: `${heightVh}vh`,
                  marginTop: index === 0 ? 0 : 40,
                }}
              >
                <div className="flex items-center justify-center w-full cursor-pointer" onClick={isPrev ? scrollPrev : isNext ? scrollNext : undefined}>
                  <div className="flex-none w-3xs text-[120px] text-right font-newyork-large">Vol</div>
                    <div className="-mx-4">
                        <Image 
                          src={iconSrc}
                          alt={title}
                          width={200}
                          height={200}
                          className="dark:invert transition-all duration-300"
                        />
                    </div>
                  <div className="flex-none w-3xs text-[120px] text-left font-newyork-large">{issueNumber}</div>
                </div>
                
                {/* 只在当前活动卡片显示日期和主题 */}
                {active && (
                  <div className="w-full flex flex-col items-center">
                    {date && (
                      <p className="mt-4 mb-6 text-center text-sm text-gray-500">
                        {locale === 'zh' ? `最新发布 ${formatDate(date)}` : `the latest ${formatDate(date)}`}
                      </p>
                    )}
                    
                    {topics && topics.length > 0 && (
                      <div className="flex flex-col items-center gap-3">
                        {topics.map((topic, topicIndex) => (
                          <motion.p 
                            key={`${activeSlide}-${topic.id}`} 
                            className="text-lg font-newyork-large cursor-pointer text-gray-800 dark:text-gray-200"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (ANIMATION_DURATION / 800) + topicIndex * 0.15, duration: 0.5, ease: "easeInOut" }}
                          >
                            {topic.title}
                          </motion.p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.li>                
            )
          })}
        </motion.ul>
        
        {/* 当前滑动位置指示器 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end gap-3">
          {issues.map((_, index) => (
            <div 
              key={index}
              onClick={() => jumpToSlide(index)}
              className={cn(
                "w-6 h-1 py-1 rounded-full transition-all duration-300 cursor-pointer hover:w-8",
                index === activeSlide ? "bg-gray-600 dark:bg-gray-200 w-8" : "bg-gray-300 dark:bg-gray-600"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}