import { useState, useEffect } from "react";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useAnimationStore } from "@/store/animationStore";

// 创建样式变量，便于统一管理和修改
const STYLES = {
  fontSize: "text-[150px]",
  fontFamily: "font-newyork-large",
  // 相对字体大小的比例系数，1.07 表示行高约为字体大小的1.07倍
  heightRatio: 1.07
};

// 获取数字高度的函数（根据字体大小动态计算）
// 150px * 1.07 = 160.5px
const getItemHeight = (): number => {
  // 从字体大小提取数值部分
  const fontSizeMatch = STYLES.fontSize.match(/\[(\d+)px\]/);
  const fontSizeValue = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 150;
  return Math.round(fontSizeValue * STYLES.heightRatio);
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

// 期数数据接口
interface Issue {
  id: number;        // 期数ID，用于标识期数
  number: number;    // 实际显示的期数号
  isLatest?: boolean; // 是否是最新一期
  date?: string;      // 发布日期
  title?: string;     // 期数标题
}

// 配置常量
const CONFIG = {
  // 动画配置
  animation: {
    duration: 0.5,
    baseDelay: 0.01,
    incrementDelay: 0.02,
    ease: [0.4, 0, 0.2, 1]
  },
  // 样式配置
  styles: {
    issue: {
      active: `${STYLES.fontSize} opacity-100`,
      hovered: 'text-[140px] opacity-70',
      default: 'text-[130px] opacity-30'
    },
    spacing: 150,
    volFontSize: STYLES.fontSize,
    maxDisplayCount: 10
  },
  // 布局配置
  layout: {
    volTopOffset: '50%',  // Vol 元素垂直居中
    issuesTopOffset: 0    // IssuesList 不需要额外的 top 偏移
  },
  // 默认配置
  defaults: {
    threshold: 100,
    initialVisible: true,
    fadeInDelay: 300,
    fadeOutDelay: 300,
    activeIssue: 54
  }
} as const;

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
  const { maxDisplayCount } = CONFIG.styles;
  
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

// 模拟从API获取期数数据的函数 (日后可替换为真实API调用)
const fetchIssues = async (): Promise<Issue[]> => {
  // 模拟数据 - 实际开发中替换为API请求
  return [
    { id: 1, number: 54, isLatest: true, date: 'Feb 23 2025', title: 'Latest Issue' },
    { id: 2, number: 53, date: 'Feb 23 2025', title: 'Winter Special' },
    { id: 3, number: 52, date: 'Feb 23 2025', title: 'Year End' },
    { id: 4, number: 51, date: 'Feb 23 2025', title: 'Autumn Collection' },
    { id: 5, number: 50, date: 'Feb 23 2025', title: 'Anniversary Issue' },
    { id: 6, number: 49, date: 'Feb 23 2025', title: 'September Issue' },
    { id: 7, number: 48, date: 'Feb 23 2025', title: 'Summer Special' }
  ];
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
  const { browseMode: storeBrowseMode, activeIssue: storeActiveIssue, setActiveIssue } = useUIStore();
  
  // 从 Zustand 获取动画状态 - 避免创建新对象引用导致无限循环
  const volTransform = useAnimationStore(state => state.volTransform);
  const numberTransform = useAnimationStore(state => state.numberTransform);
  const elementsOpacity = useAnimationStore(state => state.elementsOpacity);
  const dateCurrentX = useAnimationStore(state => state.dateCurrentX);
  const dateOpacity = useAnimationStore(state => state.dateOpacity);
  
  // 使用传入的值或从store中获取
  const browseMode = externalBrowseMode !== undefined ? externalBrowseMode : storeBrowseMode;
  const storeActiveIssueValue = storeActiveIssue ?? CONFIG.defaults.activeIssue;
  
  // 使用 useScrollVisibility 钩子，传入配置
  const isVisible = useScrollVisibility({
    threshold: visibilityConfig?.threshold ?? CONFIG.defaults.threshold,
    initialVisible: visibilityConfig?.initialVisible ?? CONFIG.defaults.initialVisible
  });

  // 状态管理
  const [issuePositions, setIssuePositions] = useState<Record<number, number>>({});
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentActiveIssue, setCurrentActiveIssue] = useState<number>(storeActiveIssueValue);
  
  // 加载期数数据
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await fetchIssues();
        setIssues(data);
        
        // 如果当前没有活动的期数，则设置为最新一期或第一期
        if (storeActiveIssue === null) {
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
    
    loadIssues();
  }, [setActiveIssue, storeActiveIssue]);
  
  // 同步外部传入的activeIssue
  useEffect(() => {
    if (externalActiveIssue !== undefined) {
      const newActiveIssue = externalActiveIssue ?? (issues.length > 0 ? (issues.find(issue => issue.isLatest)?.number || issues[0].number) : CONFIG.defaults.activeIssue);
      setCurrentActiveIssue(newActiveIssue);
    } else if (storeActiveIssue !== null) {
      setCurrentActiveIssue(storeActiveIssue);
    }
  }, [externalActiveIssue, storeActiveIssue, issues]);
  
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
        setIssuePositions(prev => ({
          ...prev,
          [issue.number]: numberTransform
        }));
      }, delay * 1000);
      
      timers.push(timer);
    });
    
    // 清理函数
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [numberTransform, issues, currentActiveIssue]);
  
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
  };
  
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
      className="absolute top-0 left-0 will-change-transform transform-gpu z-40 flex items-center"
      initial={{ x: 0, opacity: 0 }}
      animate={{ 
        x: -volTransform,
        opacity: elementsOpacity
      }}
      transition={{ duration: CONFIG.animation.duration, ease: CONFIG.animation.ease }}
      style={{ pointerEvents: 'none' }}
    >
      <h2 className={`${STYLES.fontSize} ${STYLES.fontFamily} leading-none flex items-center`} 
          style={{ height: `${itemHeight}px` }}>
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
  browseMode = false // 浏览模式
}: { 
  issues: Issue[], // 期数数据
  activeIssue: number, // 当前活动期数
  issuePositions: Record<number, number>, // 期数位置
  elementsOpacity: number, // 元素透明度
  onIssueChange: (issueNumber: number) => void, // 期数变化回调
  browseMode?: boolean // 浏览模式
}) {
  const { issue: issueStyles } = CONFIG.styles;
  const { duration, ease } = CONFIG.animation;
  
  // 从animationStore获取和设置垂直偏移量
  const activeIssueOffset = useAnimationStore(state => state.activeIssueOffset);
  const setActiveIssueOffset = useAnimationStore(state => state.setActiveIssueOffset);
  
  // 动态计算每个项的高度
  const itemHeight = getItemHeight();
  
  const displayIssues = browseMode 
    ? issues.filter(issue => issue.number === activeIssue)
    : getDisplayIssues(issues, activeIssue);
    
  const activeBrowseTransform = 300;
  
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
      className="absolute top-0 right-0 transform-gpu will-change-transform z-50 flex flex-col items-end"
      initial={{ opacity: 0, y: 0 }}
      animate={{ 
        opacity: elementsOpacity,
        y: browseMode ? 0 : activeIssueOffset // 使用全局状态的偏移量
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <AnimatePresence>
        {displayIssues.map((issue) => {
          const isActive = issue.number === activeIssue;
          const classNames = isActive ? issueStyles.active : issueStyles.default;
          const xPosition = browseMode && isActive 
            ? activeBrowseTransform 
            : issuePositions[issue.number] || 0;
          
          return (
            <motion.div 
              key={issue.id}
              className={`${STYLES.fontFamily} cursor-pointer leading-none ${classNames} flex items-center`}
              style={{ height: `${itemHeight}px` }}
              initial={{ x: 0, opacity: 0 }}
              animate={{ 
                x: xPosition,
                opacity: elementsOpacity
              }}
              whileHover={!browseMode ? {
                scale: 1.05,
                opacity: 0.7,
                transition: { duration: 0.2 }
              } : undefined}
              transition={{ duration, ease }}
              onClick={() => !browseMode && onIssueChange(issue.number)}
            >
              {issue.number}
            </motion.div>
          );
        })}
      </AnimatePresence>
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