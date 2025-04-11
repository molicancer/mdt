import { useState, useEffect } from "react";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";
import { motion, AnimatePresence } from "framer-motion";

// 类型定义
interface VolNumberElementsProps {
  volTransform: number;
  numberTransform: number;
  elementsOpacity: number;
  dateCurrentX: number;
  dateOpacity: number;
  activeIssue?: number; // 外部传入的当前活动期数
  onIssueChange?: (issueNumber: number) => void; // 期数变化回调
  browseMode?: boolean; // 浏览模式
  visibilityConfig?: {
    threshold?: number;
    initialVisible?: boolean;
    fadeInDelay?: number;
    fadeOutDelay?: number;
  };
}

// 期数数据接口
interface Issue {
  id: number;        // 期数ID，用于标识期数
  number: number;    // 实际显示的期数号
  isLatest?: boolean; // 是否是最新一期
  date?: string;      // 发布日期
  title?: string;     // 期数标题
}

interface IssueStyles {
  active: string;
  hovered: string;
  default: string;
}

// 配置常量
const CONFIG = {
  // 动画配置
  animation: {
    duration: 0.5,
    baseDelay: 0.01,
    incrementDelay: 0.02
  },
  // 样式配置
  styles: {
    issue: {
      active: 'text-[150px] opacity-100',
      hovered: 'text-[140px] opacity-70',
      default: 'text-[130px] opacity-30'
    },
    spacing: 150,
    volFontSize: 'text-[150px]',
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
  volTransform, 
  numberTransform, 
  elementsOpacity, 
  dateCurrentX, 
  dateOpacity,
  activeIssue = CONFIG.defaults.activeIssue,
  onIssueChange,
  browseMode = false,
  visibilityConfig = {
    threshold: CONFIG.defaults.threshold,
    initialVisible: CONFIG.defaults.initialVisible,
    fadeInDelay: CONFIG.defaults.fadeInDelay,
    fadeOutDelay: CONFIG.defaults.fadeOutDelay
  }
}: VolNumberElementsProps) {
  // 使用 useScrollVisibility 钩子，传入配置
  const isVisible = useScrollVisibility({
    threshold: visibilityConfig?.threshold ?? CONFIG.defaults.threshold,
    initialVisible: visibilityConfig?.initialVisible ?? CONFIG.defaults.initialVisible
  });

  // 状态管理
  const [hoveredIssue, setHoveredIssue] = useState<number | null>(null);
  const [issuePositions, setIssuePositions] = useState<Record<number, number>>({});
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentActiveIssue, setCurrentActiveIssue] = useState(activeIssue);
  
  // 加载期数数据
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await fetchIssues();
        setIssues(data);
        const latestIssue = data.find(issue => issue.isLatest)?.number || data[0]?.number;
        setCurrentActiveIssue(latestIssue);
      } catch (error) {
        console.error('Failed to load issues:', error);
      }
    };
    
    loadIssues();
  }, []);
  
  // 同步外部传入的activeIssue
  useEffect(() => {
    if (activeIssue) {
      setCurrentActiveIssue(activeIssue);
    }
  }, [activeIssue]);
  
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
    // 日后可扩展为路由跳转或触发其他UI变化
    console.log(`Navigate to issue ${issueNumber}`);
    setCurrentActiveIssue(issueNumber);
    onIssueChange?.(issueNumber);
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" 
         style={{ 
           top: browseMode ? '50%' : '40%', 
           transform: browseMode ? 'translateY(-50%)' : 'translateY(0)', 
           transition: 'top 0.7s ease-in-out, transform 0.7s ease-in-out',
           height: 'auto'
         }}>
      <motion.div 
        className="max-w-6xl w-full px-8 relative h-[600px]" // 添加固定高度
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ 
          duration: (isVisible ? (visibilityConfig?.fadeInDelay ?? 300) : (visibilityConfig?.fadeOutDelay ?? 300)) / 1000,
          ease: "easeInOut"
        }}
      >
        {/* Vol部分 */}
        <VolElement 
          volTransform={browseMode ? 300 : volTransform} 
          elementsOpacity={elementsOpacity} 
        />
        
        {/* 期数列表 */}
        {issues.length > 0 && (
          <IssuesList 
            issues={issues}
            activeIssue={currentActiveIssue}
            issuePositions={issuePositions} 
            hoveredIssue={hoveredIssue}
            setHoveredIssue={setHoveredIssue}
            elementsOpacity={elementsOpacity}
            onIssueChange={handleIssueChange}
            browseMode={browseMode}
          />
        )}
        
        {/* 日期信息 */}
        <DateInfo 
          dateCurrentX={dateCurrentX} 
          dateOpacity={dateOpacity}
          issueData={issues.find(issue => issue.number === currentActiveIssue)}
          browseMode={browseMode}
        />
      </motion.div>
    </div>
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
  const { volTopOffset } = CONFIG.layout;
  const { volFontSize } = CONFIG.styles;
  const { duration } = CONFIG.animation;
  
  return (
    <motion.div 
      className="absolute will-change-transform transform-gpu z-40 flex items-center"
      style={{ 
        top: 0,  // 修改为 0，使其位于容器顶部
        left: 0  // 添加 left: 0 确保水平位置
      }}
      animate={{ 
        x: -volTransform,
        opacity: elementsOpacity
      }}
      transition={{ duration, ease: "easeInOut" }}
    >
      <h2 className={`${volFontSize} font-newyork font-bold leading-none`}>Vol</h2>
    </motion.div>
  );
}

// 子组件：期数列表
function IssuesList({ 
  issues,
  activeIssue,
  issuePositions, 
  hoveredIssue, 
  setHoveredIssue,
  elementsOpacity,
  onIssueChange,
  browseMode = false
}: { 
  issues: Issue[],
  activeIssue: number,
  issuePositions: Record<number, number>, 
  hoveredIssue: number | null,
  setHoveredIssue: (issue: number | null) => void,
  elementsOpacity: number,
  onIssueChange: (issueNumber: number) => void,
  browseMode?: boolean
}) {
  const { spacing, issue: issueStyles } = CONFIG.styles;
  const { duration } = CONFIG.animation;
  
  const displayIssues = browseMode 
    ? issues.filter(issue => issue.number === activeIssue)
    : getDisplayIssues(issues, activeIssue);
    
  const activeBrowseTransform = 300;

  return (
    <motion.div 
      className="absolute right-0 transform-gpu will-change-transform z-20 flex flex-col items-end"
      style={{ 
        top: 0  // 修改为 0，使其位于容器顶部
      }}
      animate={{ opacity: elementsOpacity }}
      transition={{ duration, ease: "easeInOut" }}
    >
      <AnimatePresence>
        {displayIssues.map((issue) => {
          const isActive = issue.number === activeIssue;
          const classNames = isActive ? issueStyles.active : 
                           (hoveredIssue === issue.number) ? issueStyles.hovered : 
                           issueStyles.default;
          
          const xPosition = browseMode && isActive 
            ? activeBrowseTransform 
            : issuePositions[issue.number] || 0;
          
          return (
            <motion.div 
              key={issue.id}
              className={`font-newyork font-bold cursor-pointer leading-none ${classNames} flex items-center`}
              style={{
                marginBottom: isActive ? 0 : `${spacing}px`,
                visibility: browseMode && !isActive ? 'hidden' : 'visible'
              }}
              animate={{ 
                x: xPosition,
                opacity: elementsOpacity
              }}
              transition={{ duration, ease: "easeInOut" }}
              onMouseEnter={() => !browseMode && setHoveredIssue(issue.number)}
              onMouseLeave={() => !browseMode && setHoveredIssue(null)}
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
  
  const { duration } = CONFIG.animation;
  
  return (
    <motion.div 
      className="absolute left-8 bottom-[-30px] will-change-transform transform-gpu z-30 text-sm text-gray-500"
      animate={{ 
        x: dateCurrentX,
        opacity: dateOpacity
      }}
      transition={{ duration, ease: "easeInOut" }}
    >
      <div className="flex items-center">
        <span className="opacity-70">the latest</span>
        <span className="mx-1 opacity-50">·</span>
        <span>{issueData.date}</span>
        <span className="ml-1 opacity-50">·</span>
        <span className="ml-1 opacity-70">monday updated</span>
      </div>
    </motion.div>
  );
}