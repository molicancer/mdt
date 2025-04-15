"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useAnimationStore } from "@/store/animationStore";
import React from "react";
import { Issue } from "@/store/uiStore"; // 使用从 uiStore 导出的 Issue 类型
import { useScrollWheel } from "@/hooks/use-scroll-wheel";
import { useScrollStore } from "@/store/scrollStore";
import { 
  getIssueNumberFromURL, 
  shouldEnterStage2, 
  shouldEnterBrowseMode 
} from "@/lib/utils";
import { ANIMATION_CONFIG } from '@/config/animationConfig';
import { getAllIssues } from "@/lib/api/issueApi";

const {
  base
} = ANIMATION_CONFIG.volNumber;

const {
  fontSize,
  heightRatio
} = base;

// 获取数字高度的函数（根据字体大小动态计算）
const getItemHeight = () => {
  return fontSize * heightRatio;
};

// 类型定义
interface VolNumberElementsProps {
  visibilityConfig?: {
    initialVisible?: boolean;
  };
  activeIssue?: number | null; // 当前活动期数
  onIssueChange?: (issueNumber: number) => void; // 期数变更回调
  browseMode?: boolean; // 是否处于浏览模式
}

// 计算动画延迟时间
const calculateDelay = (distanceFromActive: number): number => {
  return ANIMATION_CONFIG.volNumber.animation.baseDelay + (distanceFromActive * ANIMATION_CONFIG.volNumber.animation.incrementDelay);
};

// 获取要显示的期数
const getDisplayIssues = (issues: Issue[], activeIssue: number): Issue[] => {
  if (!issues.length) return [];
  
  // 如果activeIssue为0（尚未设置），则直接返回所有期数
  if (activeIssue === 0) return [...issues].sort((a, b) => b.number - a.number);
  
  // 按照期数排序（降序）
  const sortedIssues = [...issues].sort((a, b) => b.number - a.number);
  
  // 找出当前活动期数的索引
  const activeIndex = sortedIssues.findIndex(i => i.number === activeIssue);
  
  // 如果找不到活动期数，返回全部
  if (activeIndex === -1) return sortedIssues;
  
  // 获取配置的最大显示数量
  const maxDisplayCount = ANIMATION_CONFIG.volNumber.layout.maxDisplayCount;
  
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
    // 使用issueApi中的函数获取数据
    const issueContents = await getAllIssues();
    
    // 将IssueContent格式转换为Issue格式
    return issueContents.map((issue, index) => ({
      id: issue.id,
      number: issue.number,
      isLatest: index === 0, // 假设第一个是最新的（因为getAllIssues已经按降序排序）
      date: issue.date ? new Date(issue.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Unknown Date',
      title: issue.title,
      slug: `vol${issue.number}` // 构造slug
    }));
  } catch (error) {
    console.error('获取期数失败:', error);
    
    // 返回模拟数据作为后备
    return [
      { id: 1, number: 54, isLatest: true, date: 'Feb 23 2025', title: 'Latest Issue', slug: 'vol54' },
      { id: 2, number: 53, date: 'Feb 23 2025', title: 'Winter Special', slug: 'vol53' },
      { id: 3, number: 52, date: 'Feb 23 2025', title: 'Year End', slug: 'vol52' },
      { id: 4, number: 51, date: 'Feb 23 2025', title: 'Autumn Collection', slug: 'vol51' },
      { id: 5, number: 50, date: 'Feb 23 2025', title: 'Anniversary Issue', slug: 'vol50' }
    ];
  }
};

export function VolNumberElements({ 
  visibilityConfig = { initialVisible: ANIMATION_CONFIG.volNumber.defaults.initialVisible },
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
  // 根据store中的activeIssue和issues动态确定当前使用的期数
  const getStoreActiveIssue = () => {
    // 如果有活动期数，则直接使用
    if (storeActiveIssue !== null) return storeActiveIssue;
    
    // 否则尝试从issues中获取最新期数
    if (issues.length > 0) {
      const latestIssue = issues.find(issue => issue.isLatest);
      return latestIssue ? latestIssue.number : issues[0].number;
    }
    
    // 如果以上都没有，返回0表示尚未加载
    return 0;
  };
  const storeActiveIssueValue = getStoreActiveIssue();
  
  // 检查是否应该直接进入第二阶段
  const enterStage2 = React.useRef(shouldEnterStage2());
  
  // 获取滚动存储中的状态和方法
  const isVisible = useScrollStore(state => state.isVisible);
  const setVisibility = useScrollStore(state => state.setVisibility);
  
  // 使用 useScrollWheel 钩子初始化wheel事件监听
  useScrollWheel({
    initialVisible: visibilityConfig?.initialVisible,
  });
  
  // 非初始阶段时确保组件可见
  useEffect(() => {
    if (!isInitialStage) {
      setVisibility(true);
    }
  }, [isInitialStage, setVisibility]);
  
  // 确定最终的可见性状态
  const finalVisibility = isInitialStage ? isVisible : true;
  
  // 在组件挂载时更新当前活动期数
  useEffect(() => {
    // 确保初始值与存储同步
    if (currentActiveIssue !== storeActiveIssueValue && storeActiveIssueValue !== 0) {
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
      const newActiveIssue = externalActiveIssue ?? (issues.length > 0 ? (issues.find(issue => issue.isLatest)?.number || issues[0].number) : 0);
      if (newActiveIssue !== 0) {
        setCurrentActiveIssue(newActiveIssue);
      }
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
    const hashHasIssueNumber = getIssueNumberFromURL() !== null;
    
    if (hashHasIssueNumber) {
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
  // 如果是初始阶段且不可见，则返回null
  if (isInitialStage && !finalVisibility) {
    return null;
  }
  
  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: (!isInitialStage || visibilityConfig.initialVisible) ? 1 : 0 
      }}
      transition={ANIMATION_CONFIG.presets.issueElement.transition}
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
          issueData={currentActiveIssue === 0 ? undefined : issues.find(issue => issue.number === currentActiveIssue)}
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
  const itemHeight = getItemHeight();
  
  return (
    <motion.div 
      className="absolute top-0 left-0 bottom-0 will-change-transform transform-gpu z-40 flex items-center"
      initial={{ x: 0, opacity: 0 }}
      animate={{ 
        x: -volTransform,
        opacity: elementsOpacity
      }}
      transition={ANIMATION_CONFIG.presets.issueElement.transition}
      style={{ pointerEvents: 'none' }}
    >
      <h2 className={`${ANIMATION_CONFIG.volNumber.base.fontFamily} leading-none flex items-center`} 
          style={{ 
            height: `${itemHeight}px`,
            fontSize: `${ANIMATION_CONFIG.volNumber.base.fontSize}px`
          }}>
        Vol
      </h2>
    </motion.div>
  );
}

// 子组件：期数列表
function IssuesList({ 
  issues,
  activeIssue,
  issuePositions,
  elementsOpacity,
  onIssueChange,
  browseMode = false
}: { 
  issues: Issue[],
  activeIssue: number,
  issuePositions: Record<number, number>,
  elementsOpacity: number,
  onIssueChange: (issueNumber: number) => void,
  browseMode?: boolean
}) {
  const activeIssueOffset = useAnimationStore(state => state.activeIssueOffset);
  const setActiveIssueOffset = useAnimationStore(state => state.setActiveIssueOffset);
  
  const itemHeight = getItemHeight();
  
  const effectiveActiveIssue = activeIssue === 0 && issues.length > 0 ? 
    (issues.find(issue => issue.isLatest)?.number || issues[0].number) : 
    activeIssue;
  
  const displayIssues = browseMode 
    ? issues.filter(issue => issue.number === effectiveActiveIssue)
    : getDisplayIssues(issues, effectiveActiveIssue);
    
  const activeBrowseTransform = ANIMATION_CONFIG.volNumber.layout.activeBrowseTransform;
  
  const activeIndex = displayIssues.findIndex(issue => issue.number === effectiveActiveIssue);
  const calculatedOffset = activeIndex > 0 ? -itemHeight * activeIndex : 0;
  
  useEffect(() => {
    if (!browseMode && calculatedOffset !== activeIssueOffset) {
      setActiveIssueOffset(calculatedOffset);
    }
  }, [activeIndex, calculatedOffset, activeIssueOffset, setActiveIssueOffset, browseMode, itemHeight]);

  return (
    <motion.div 
      className="absolute right-0 transform-gpu will-change-transform z-50 flex flex-col items-end"
      initial={{ opacity: 0, y: 0 }}
      animate={{ 
        opacity: elementsOpacity,
        y: browseMode ? 0 : activeIssueOffset,
        top: `calc(50% - ${itemHeight / 2}px)`
      }}
      transition={ANIMATION_CONFIG.presets.issueElement.transition}
      style={{ pointerEvents: 'auto' }}
    >
      <LayoutGroup id="issues-group">
        <AnimatePresence>
          {displayIssues.map((issue) => {
            const isActive = issue.number === effectiveActiveIssue;
            const fontSize = isActive ? 180 : 130;
            const opacity = isActive ? 1 : 0.3;
            
            const xPosition = browseMode && isActive ? 
              activeBrowseTransform : 
              issuePositions[issue.number] || 0;
            
            return (
              <motion.div 
                key={issue.id}
                layout
                className={`${ANIMATION_CONFIG.volNumber.base.fontFamily} cursor-pointer leading-none flex items-center`}
                style={{ height: `${itemHeight}px` }}
                initial={{ opacity: 0 }}
                animate={{ 
                  x: xPosition,
                  opacity: elementsOpacity * opacity,
                  fontSize: `${fontSize}px`
                }}
                transition={ANIMATION_CONFIG.presets.issueElement.transition}
                whileHover={!browseMode ? ANIMATION_CONFIG.presets.numberElement.hover : undefined}
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
  
  return (
    <motion.div 
      className="absolute top-36 will-change-transform transform-gpu"
      initial={{ x: 0, opacity: 0 }}
      animate={{ 
        x: dateCurrentX,
        opacity: dateOpacity
      }}
      transition={ANIMATION_CONFIG.presets.issueElement.transition}
      style={{ pointerEvents: 'none' }}
    >
      <p className="text-[#545454]">
        the latest Feb 23 2025 <br /> Monday updated
      </p>
    </motion.div>
  );
}