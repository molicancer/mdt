"use client";

import { useEffect } from "react";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useAnimationStore } from "@/store/animationStore";
import React from "react";
import { Issue } from "@/store/uiStore"; // 使用从 uiStore 导出的 Issue 类型

// 检查URL是否包含直接进入第二阶段的标记
const shouldEnterStage2 = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // 检查URL哈希中是否包含s2标记
  return window.location.hash.includes('&s2');
};

// 检查URL是否包含直接进入浏览模式的标记
const shouldEnterBrowseMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // 检查URL哈希中是否包含browse标记
  return window.location.hash.includes('&browse');
};

// 配置常量
const CONFIG = {
  // 基础样式
  base: {
    fontSize: 150, // 数值，不再使用Tailwind类
    fontFamily: "font-newyork-large",
    heightRatio: 1.06 // 容器高度为字体大小的1.06倍
  },
  // 动画配置
  animation: {
    duration: 0.5,
    baseDelay: 0.01,
    incrementDelay: 0.02,
    ease: [0.4, 0, 0.2, 1],
    fontSizeTransition: { 
      duration: 0.35, 
      ease: [0.32, 0.72, 0, 1] 
    }
  },
  // 布局配置
  layout: {
    maxDisplayCount: 10, // 最多显示多少个期数
    activeBrowseTransform: 300 // 浏览模式下的位移值
  },
  // 默认配置
  defaults: {
    threshold: 100,
    initialVisible: true,
    fadeInDelay: 300, // 单位：毫秒
    fadeOutDelay: 300, // 单位：毫秒
    activeIssue: 54
  }
} as const;

// 获取数字高度的函数（根据字体大小动态计算）
const getItemHeight = (): number => {
  return Math.round(CONFIG.base.fontSize * CONFIG.base.heightRatio);
};

// 类型定义
interface VolNumberElementsProps {
  visibilityConfig?: {
    threshold?: number; // 可见性阈值
    initialVisible?: boolean;
    fadeInDelay?: number;
    fadeOutDelay?: number;
  };
  activeIssue?: number | null; // 当前活动期数
  onIssueChange?: (issueNumber: number) => void; // 期数变更回调
  browseMode?: boolean; // 是否处于浏览模式
}

// 从URL slug中提取期数
export const extractNumberFromSlug = (slug: string): number => {
  // 从"vol54"格式中提取"54"
  const match = slug.match(/vol(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0; // 默认值
};

// 获取当前URL中的期数
const getIssueNumberFromURL = (): number | null => {
  if (typeof window === 'undefined') return null;
  
  // 首先检查URL路径
  const pathParts = window.location.pathname.split('/');
  // 检查URL中是否有类似"vol54"的部分
  for (const part of pathParts) {
    const match = part.match(/vol(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  // 然后检查URL哈希
  const hash = window.location.hash;
  const hashMatch = hash.match(/#vol(\d+)/i);
  if (hashMatch && hashMatch[1]) {
    return parseInt(hashMatch[1], 10);
  }
  
  return null;
};

// 计算动画延迟时间
const calculateDelay = (distanceFromActive: number): number => {
  const { baseDelay, incrementDelay } = CONFIG.animation;
  return baseDelay + (distanceFromActive * incrementDelay);
};

// 获取要显示的期数
const getDisplayIssues = (issues: Issue[], activeIssue: number): Issue[] => {
  if (!issues.length) return [];
  
  // 按照期数排序（降序）
  const sortedIssues = [...issues].sort((a, b) => b.number - a.number);
  
  // 找出当前活动期数的索引
  const activeIndex = sortedIssues.findIndex(i => i.number === activeIssue);
  
  // 如果找不到活动期数，返回全部
  if (activeIndex === -1) return sortedIssues;
  
  // 最多显示的期数数量
  const { maxDisplayCount } = CONFIG.layout;
  
  // 计算显示范围
  const halfCount = Math.floor(maxDisplayCount / 2);
  let startIndex = Math.max(0, activeIndex - halfCount);
  const endIndex = Math.min(sortedIssues.length - 1, startIndex + maxDisplayCount - 1);
  
  // 如果结束索引不够，调整起始索引
  if (endIndex - startIndex + 1 < maxDisplayCount) {
    startIndex = Math.max(0, endIndex - maxDisplayCount + 1);
  }
  
  return sortedIssues.slice(startIndex, endIndex + 1);
};

// 使用WordPress API获取期数数据
const fetchIssues = async (): Promise<Issue[]> => {
  try {
    // 获取所有文章的列表
    const response = await fetch('http://172.16.69.13:8080/wp-json/wp/v2/posts');
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const posts = await response.json();
    const formattedIssues: Issue[] = [];
    
    // 格式化数据，从slug中提取期数
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // 从slug中提取期数
      const number = extractNumberFromSlug(post.slug);
      if (number === 0) continue; // 跳过无效期数
      
      formattedIssues.push({
        id: post.id,
        number,
        isLatest: i === 0, // 假设第一个是最新的
        date: new Date(post.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        title: post.title.rendered,
        slug: post.slug
      });
    }
    
    // 按期数排序（降序，最新的在前面）
    return formattedIssues.sort((a, b) => b.number - a.number);
  } catch (error) {
    console.error('获取期数失败:', error);
    
    // 返回模拟数据作为后备
    return [
      { id: 1, number: 54, isLatest: true, date: 'Feb 23 2025', title: 'Latest Issue', slug: 'vol54' },
      { id: 2, number: 53, date: 'Feb 23 2025', title: 'Winter Special', slug: 'vol53' },
      { id: 3, number: 52, date: 'Feb 23 2025', title: 'Year End', slug: 'vol52' },
      { id: 4, number: 51, date: 'Feb 23 2025', title: 'Autumn Collection', slug: 'vol51' },
      { id: 5, number: 50, date: 'Feb 23 2025', title: 'Anniversary Issue', slug: 'vol50' },
      { id: 6, number: 49, date: 'Feb 23 2025', title: 'September Issue', slug: 'vol49' },
      { id: 7, number: 48, date: 'Feb 23 2025', title: 'Summer Special', slug: 'vol48' }
    ];
  }
};

export function VolNumberElements({ 
  visibilityConfig = {
    threshold: CONFIG.defaults.threshold,
    initialVisible: CONFIG.defaults.initialVisible,
    fadeInDelay: CONFIG.defaults.fadeInDelay,
    fadeOutDelay: CONFIG.defaults.fadeOutDelay
  },
  activeIssue: externalActiveIssue,
  onIssueChange: externalOnIssueChange,
  browseMode: externalBrowseMode
}: VolNumberElementsProps) {
  // 从 Zustand 获取状态和操作
  const { 
    browseMode: storeBrowseMode, 
    activeIssue: storeActiveIssue, 
    setActiveIssue,
    issues,
    setIssues,
    issuePositions,
    setIssuePosition,
    lastNormalPositions,
    setLastNormalPositions,
    currentActiveIssue,
    setCurrentActiveIssue
  } = useUIStore();
  
  // 从 Zustand 获取动画状态 - 避免创建新对象引用导致无限循环
  const volTransform = useAnimationStore(state => state.volTransform);
  const numberTransform = useAnimationStore(state => state.numberTransform);
  const elementsOpacity = useAnimationStore(state => state.elementsOpacity);
  const dateCurrentX = useAnimationStore(state => state.dateCurrentX);
  const dateOpacity = useAnimationStore(state => state.dateOpacity);
  const setStage2State = useAnimationStore(state => state.setStage2State);
  const isInitialStage = useAnimationStore(state => state.isInitialStage);
  
  // 使用传入的值或从store中获取
  const prevBrowseMode = React.useRef(false);
  const shouldBrowse = shouldEnterBrowseMode();
  // 如果URL包含浏览模式标记，则强制启用浏览模式
  const browseMode = shouldBrowse ? true : (externalBrowseMode !== undefined ? externalBrowseMode : storeBrowseMode);
  const storeActiveIssueValue = storeActiveIssue ?? CONFIG.defaults.activeIssue;
  
  // 检查是否应该直接进入第二阶段
  const enterStage2 = React.useRef(shouldEnterStage2());
  
  // 使用 useScrollVisibility 钩子，传入配置
  const isVisible = useScrollVisibility({
    threshold: visibilityConfig?.threshold ?? CONFIG.defaults.threshold,
    initialVisible: true // 总是从可见状态开始，让setStage2State控制实际可见性
  });

  // 在组件挂载时更新当前活动期数
  useEffect(() => {
    // 确保初始值与存储同步
    if (currentActiveIssue !== storeActiveIssueValue) {
      setCurrentActiveIssue(storeActiveIssueValue);
    }
  }, [currentActiveIssue, setCurrentActiveIssue, storeActiveIssueValue]);
  
  // 加载期数数据
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await fetchIssues();
        setIssues(data);
        
        // 尝试从URL中获取期数
        const urlIssueNumber = getIssueNumberFromURL();
        
        // 如果URL中有期数，优先使用URL中的期数
        if (urlIssueNumber && data.some(issue => issue.number === urlIssueNumber)) {
          console.log(`从URL导航到期数: ${urlIssueNumber}`);
          setCurrentActiveIssue(urlIssueNumber);
          setActiveIssue(urlIssueNumber); // 同步到 Zustand
        } 
        // 否则，如果当前没有活动的期数，则设置为最新一期或第一期
        else if (storeActiveIssue === null) {
          const latestIssue = data.find(issue => issue.isLatest)?.number || data[0]?.number;
          if (latestIssue) {
            setCurrentActiveIssue(latestIssue);
            setActiveIssue(latestIssue); // 同步到 Zustand
          }
        }
      } catch (error) {
        console.error('Failed to load issues:', error);
      }
    };
    
    // 只有在issues为空时才加载数据
    if (issues.length === 0) {
      loadIssues();
    }
  }, [setActiveIssue, storeActiveIssue, setIssues, issues.length, setCurrentActiveIssue]);
  
  // 监控浏览模式变化
  useEffect(() => {
    // 无论何时浏览模式变化，都记录当前位置信息
    // 这确保我们总是有最新的位置信息
    setLastNormalPositions({...issuePositions});
    console.log('模式变化，保存位置信息', issuePositions);
    
    // 更新之前的浏览模式状态
    prevBrowseMode.current = browseMode;
  }, [browseMode, issuePositions, setLastNormalPositions]);
  
  // 同步外部传入的activeIssue
  useEffect(() => {
    if (externalActiveIssue !== undefined) {
      const newActiveIssue = externalActiveIssue ?? (issues.length > 0 ? (issues.find(issue => issue.isLatest)?.number || issues[0].number) : CONFIG.defaults.activeIssue);
      setCurrentActiveIssue(newActiveIssue);
    } else if (storeActiveIssue !== null) {
      setCurrentActiveIssue(storeActiveIssue);
    }
  }, [externalActiveIssue, storeActiveIssue, issues, setCurrentActiveIssue]);
  
  // 处理动画延迟效果
  useEffect(() => {
    if (issues.length === 0) return;
    
    // 清除之前的定时器以防止内存泄漏
    const timers: NodeJS.Timeout[] = [];
    
    // 获取实际要显示的期数 (以activeIssue为中心)
    const displayIssues = getDisplayIssues(issues, currentActiveIssue);
    
    // 为每个期数设置延迟更新
    displayIssues.forEach((issue) => {
      const distanceFromActive = Math.abs(currentActiveIssue - issue.number);
      const delay = calculateDelay(distanceFromActive);
      
      const timer = setTimeout(() => {
        // 改为使用 zustand 中的方法
        setIssuePosition(issue.number, numberTransform);
      }, delay * 1000);
      
      timers.push(timer);
    });
    
    // 清理函数
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [numberTransform, issues, currentActiveIssue, setIssuePosition]);
  
  // 处理浏览器前进/后退按钮导航
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handlePopState = (event: PopStateEvent) => {
      // 从历史状态中恢复期数
      if (event.state && event.state.issueNumber) {
        const issueNumber = event.state.issueNumber;
        setCurrentActiveIssue(issueNumber);
        setActiveIssue(issueNumber); // 同步到Zustand
      } else {
        // 如果没有历史状态，尝试从URL中解析
        const urlIssueNumber = getIssueNumberFromURL();
        if (urlIssueNumber && issues.some(issue => issue.number === urlIssueNumber)) {
          setCurrentActiveIssue(urlIssueNumber);
          setActiveIssue(urlIssueNumber); // 同步到Zustand
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveIssue, issues, setCurrentActiveIssue]);
  
  // 处理期数切换
  const handleIssueChange = (issueNumber: number) => {
    // 防止重复点击当前期数
    if (issueNumber === currentActiveIssue) return;
    
    setCurrentActiveIssue(issueNumber);
    
    // 如果有外部的onIssueChange函数，则调用它
    if (externalOnIssueChange) {
      externalOnIssueChange(issueNumber);
    } else {
      // 否则更新Zustand状态
      setActiveIssue(issueNumber);
    }
    
    // 查找当前期数对应的slug
    const currentIssue = issues.find(issue => issue.number === issueNumber);
    if (currentIssue?.slug && typeof window !== 'undefined') {
      // 更新URL但不刷新页面
      window.history.pushState(
        { issueNumber },
        `Vol ${issueNumber}`,
        `/${currentIssue.slug}/`
      );
    }
  };
  
  // 在初始加载后清除URL哈希，避免后续刷新重复处理
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 处理从URL哈希进入的情况
    if (window.location.hash.match(/#vol\d+/i)) {
      // 如果是第二阶段进入，直接设置第二阶段状态
      if (enterStage2.current) {
        console.log('直接进入第二阶段显示');
        
        // 延迟一下调用setStage2State，确保其他组件已经完成初始化
        setTimeout(() => {
          setStage2State();
          console.log('已设置第二阶段状态');
        }, 50);
      }
      
      // 使用setTimeout确保其他useEffect先执行完毕
      const timer = setTimeout(() => {
        // 替换当前历史记录，清除哈希但不刷新页面
        window.history.replaceState(
          null, 
          '', 
          window.location.pathname
        );
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [setStage2State]);
  
  // 使用条件渲染而不是提前返回
  // 如果是初始阶段且配置为不可见，则返回null
  if (isInitialStage && !visibilityConfig.initialVisible) {
    return null;
  }
  
  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ 
        duration: (isVisible ? (visibilityConfig?.fadeInDelay ?? 300) : (visibilityConfig?.fadeOutDelay ?? 300)) / 1000,
        ease: CONFIG.animation.ease
      }}
    >
      <div className="max-w-6xl w-full px-8 relative">
        {/* Vol部分 */}
        <VolElement 
          volTransform={browseMode ? 300 : volTransform} 
          elementsOpacity={elementsOpacity} 
        />
        
        {/* 日期信息 */}
        <DateInfo 
          dateCurrentX={dateCurrentX} 
          dateOpacity={dateOpacity}
          issueData={issues.find(issue => issue.number === currentActiveIssue)}
          browseMode={browseMode}
        />

        {/* 期数列表 */}
        {issues.length > 0 && (
          <IssuesList 
            issues={issues}
            activeIssue={currentActiveIssue}
            issuePositions={issuePositions} 
            elementsOpacity={elementsOpacity}
            onIssueChange={handleIssueChange}
            browseMode={browseMode}
            lastNormalPositions={lastNormalPositions}
          />
        )}
      </div>
    </motion.div>
  );
}

// 子组件：Vol元素
function VolElement({ 
  volTransform, 
  elementsOpacity 
}: { 
  volTransform: number, 
  elementsOpacity: number 
}) {  
  // 动态计算每个项的高度
  const itemHeight = getItemHeight();
  
  return (
    <motion.div 
      className="absolute top-0 left-0 bottom-0 will-change-transform transform-gpu z-40 flex items-center"
      initial={{ x: 0, opacity: 0 }}
      animate={{ 
        x: -volTransform,
        opacity: elementsOpacity
      }}
      transition={{ duration: CONFIG.animation.duration, ease: CONFIG.animation.ease }}
      style={{ pointerEvents: 'none' }}
    >
      <h2 className={`${CONFIG.base.fontFamily} leading-none flex items-center`} 
          style={{ 
            height: `${itemHeight}px`,
            fontSize: `${CONFIG.base.fontSize}px`
          }}>
        Vol
      </h2>
    </motion.div>
  );
}

// 子组件：期数列表
function IssuesList({ 
  issues, // 期数数据
  activeIssue, // 当前活动期数
  issuePositions, // 期数位置
  elementsOpacity, // 元素透明度
  onIssueChange, // 期数变化回调
  browseMode = false, // 浏览模式
  lastNormalPositions = {} // 普通模式下的最后位置
}: { 
  issues: Issue[], // 期数数据
  activeIssue: number, // 当前活动期数
  issuePositions: Record<number, number>, // 期数位置
  elementsOpacity: number, // 元素透明度
  onIssueChange: (issueNumber: number) => void, // 期数变化回调
  browseMode?: boolean, // 浏览模式
  lastNormalPositions?: Record<number, number> // 普通模式下的最后位置
}) {
  const { duration, ease } = CONFIG.animation;
  
  // 从animationStore获取和设置垂直偏移量
  const activeIssueOffset = useAnimationStore(state => state.activeIssueOffset);
  const setActiveIssueOffset = useAnimationStore(state => state.setActiveIssueOffset);
  
  // 动态计算每个项的高度
  const itemHeight = getItemHeight();
  
  const displayIssues = browseMode 
    ? issues.filter(issue => issue.number === activeIssue)
    : getDisplayIssues(issues, activeIssue);
    
  const activeBrowseTransform = CONFIG.layout.activeBrowseTransform;
  
  // 计算垂直位置偏移量
  // 找出当前激活项在displayIssues中的索引
  const activeIndex = displayIssues.findIndex(issue => issue.number === activeIssue);
  
  // 计算中心对齐的偏移值：
  // 如果是第一项(idx=0)，不需要偏移
  // 对于其他项，将其移动到第一项的位置，使用动态计算的高度
  const calculatedOffset = activeIndex > 0 ? -itemHeight * activeIndex : 0;
  
  // 当索引变化时更新全局状态
  useEffect(() => {
    if (!browseMode && calculatedOffset !== activeIssueOffset) {
      console.log(`更新垂直偏移: ${calculatedOffset}px，当前期数索引: ${activeIndex}，项目高度: ${itemHeight}px`);
      setActiveIssueOffset(calculatedOffset);
    }
  }, [activeIndex, calculatedOffset, activeIssueOffset, setActiveIssueOffset, browseMode, itemHeight]);

  return (
    <motion.div 
      className="absolute right-0 transform-gpu will-change-transform z-50 flex flex-col items-end"
      initial={{ opacity: 0, y: 0 }}
      animate={{ 
        opacity: elementsOpacity,
        y: browseMode ? 0 : activeIssueOffset, // 使用全局状态的偏移量
        top: `calc(50% - ${itemHeight / 2}px)` // 垂直居中的基准点
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <LayoutGroup id="issues-group">
        <AnimatePresence>
          {displayIssues.map((issue) => {
            const isActive = issue.number === activeIssue;
            
            // 根据是否为当前选中的期数定义字体大小
            const fontSize = isActive ? 180 : 130; // 使用与CONFIG.base.fontSize一致的大小
            const opacity = isActive ? 1 : 0.3;
            
            // 计算水平位置
            let xPosition = 0;
            
            if (browseMode && isActive) {
              xPosition = activeBrowseTransform;
              console.log(`浏览模式: 期数${issue.number}移动到${xPosition}, 记录位置: ${lastNormalPositions[issue.number]}`);
            } else {
              xPosition = issuePositions[issue.number] || 0;
            }
            
            return (
              <motion.div 
                key={issue.id}
                layout
                className={`${CONFIG.base.fontFamily} cursor-pointer leading-none flex items-center`}
                style={{ height: `${itemHeight}px` }}
                initial={{ opacity: 0 }}
                animate={{ 
                  x: xPosition,
                  opacity: elementsOpacity * opacity,
                  fontSize: `${fontSize}px`
                }}
                transition={{ 
                  duration, 
                  ease,
                  layout: {
                    duration,
                    ease
                  },
                  fontSize: {
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1.0]
                  },
                  x: {
                    duration,
                    ease
                  },
                  opacity: {
                    duration,
                    ease
                  }
                }}
                whileHover={!browseMode ? {
                  scale: 1.05,
                  opacity: 0.7,
                  transition: { 
                    duration: 0.3,
                    scale: {
                      duration: 0.3,
                      ease: [0.25, 0.1, 0.25, 1.0]
                    },
                    opacity: {
                      duration: 0.3,
                      ease: [0.25, 0.1, 0.25, 1.0]
                    }
                  }
                } : undefined}
                onClick={() => !browseMode && onIssueChange(issue.number)}
              >
                {issue.number}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </LayoutGroup>
    </motion.div>
  );
}

// 子组件：日期信息
function DateInfo({ 
  dateCurrentX, 
  dateOpacity,
  issueData,
  browseMode = false
}: { 
  dateCurrentX: number, 
  dateOpacity: number,
  issueData?: Issue,
  browseMode?: boolean
}) {
  if (!issueData || browseMode) return null;
  
  const { duration, ease } = CONFIG.animation;
  
  return (
    <motion.div 
      className="absolute top-36 will-change-transform transform-gpu"
      initial={{ x: 0, opacity: 0 }}
      animate={{ 
        x: dateCurrentX,
        opacity: dateOpacity
      }}
      transition={{ duration, ease }}
      style={{ pointerEvents: 'none' }}
    >
      <p className="text-[#545454]">
        the latest Feb 23 2025 <br /> Monday updated
      </p>
    </motion.div>
  );
}