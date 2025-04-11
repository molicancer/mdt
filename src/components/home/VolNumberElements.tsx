import { useState, useEffect, CSSProperties } from "react";

// 类型定义
interface VolNumberElementsProps {
  volTransform: number;
  numberTransform: number;
  elementsOpacity: number;
  dateCurrentX: number;
  dateOpacity: number;
  activeIssue?: number; // 外部传入的当前活动期数
  onIssueChange?: (issueNumber: number) => void; // 期数变化回调
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
    duration: '0.5s',
    timing: 'linear',
    baseDelay: 0.01,  // 基础延迟时间
    incrementDelay: 0.02 // 每级增加的延迟
  },
  // 样式配置
  styles: {
    issue: {
      active: 'text-[150px] opacity-100',
      hovered: 'text-[140px] opacity-70',
      default: 'text-[130px] opacity-30'
    },
    spacing: 150, // 期数之间的垂直间距
    volFontSize: 'text-[150px]', // Vol的字体大小
    maxDisplayCount: 10 // 最多显示的期数数量
  },
  // 布局配置
  layout: {
    volTopOffset: 0, // Vol的顶部偏移
    issuesTopOffset: 0 // 期数列表的顶部偏移
  }
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
  activeIssue = 54, // 默认值为54
  onIssueChange
}: VolNumberElementsProps) {
  // 状态管理
  const [hoveredIssue, setHoveredIssue] = useState<number | null>(null);
  const [issuePositions, setIssuePositions] = useState<{ [key: number]: number }>({});
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentActiveIssue, setCurrentActiveIssue] = useState<number>(activeIssue);
  
  // 加载期数数据
  useEffect(() => {
    const loadIssues = async () => {
      setIsLoading(true);
      try {
        const data = await fetchIssues();
        setIssues(data);
        
        // 默认选中最新一期
        const latestIssue = data.find(issue => issue.isLatest)?.number || data[0]?.number;
        setCurrentActiveIssue(latestIssue);
        
      } catch (error) {
        console.error('Failed to load issues:', error);
      } finally {
        setIsLoading(false);
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
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-40">加载中...</div>;
  }
  
  return (
    <div className="max-w-6xl w-full px-8 relative">
      {/* Vol部分 */}
      <VolElement 
        volTransform={volTransform} 
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
        />
      )}
      
      {/* 日期信息 */}
      <DateInfo 
        dateCurrentX={dateCurrentX} 
        dateOpacity={dateOpacity}
        issueData={issues.find(issue => issue.number === currentActiveIssue)}
      />
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
  const { duration, timing } = CONFIG.animation;
  const { volTopOffset } = CONFIG.layout;
  
  const style: CSSProperties = {
    transform: `translateX(-${volTransform}px) translateZ(0)`,
    opacity: elementsOpacity,
    transition: `transform ${duration} ${timing}, opacity ${duration} ${timing}`,
    top: volTopOffset
  };
  
  return (
    <div className="absolute will-change-transform transform-gpu z-40 flex items-baseline" style={style}>
      <h2 className={`${CONFIG.styles.volFontSize} font-newyork font-bold leading-none`}>Vol</h2>
    </div>
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
  onIssueChange
}: { 
  issues: Issue[],
  activeIssue: number,
  issuePositions: { [key: number]: number }, 
  hoveredIssue: number | null,
  setHoveredIssue: (issue: number | null) => void,
  elementsOpacity: number,
  onIssueChange: (issueNumber: number) => void
}) {
  const { duration, timing } = CONFIG.animation;
  const issueStyles = CONFIG.styles.issue as IssueStyles;
  const { issuesTopOffset } = CONFIG.layout;
  
  const containerStyle: CSSProperties = {
    opacity: elementsOpacity,
    transition: `opacity ${duration} ${timing}`,
    top: issuesTopOffset
  };
  
  // 获取要显示的期数列表
  const displayIssues = getDisplayIssues(issues, activeIssue);
  
  return (
    <div 
      className="absolute right-8 will-change-transform transform-gpu z-40 flex items-baseline" 
      style={containerStyle}
    >
      <div className="relative">
        {/* 期数项目 */}
        {displayIssues.map((issue, index) => {
          const isActive = issue.number === activeIssue;
          const isHovered = issue.number === hoveredIssue;
          
          // 计算中心位置索引
          const centerIndex = displayIssues.findIndex(i => i.number === activeIssue);
          // 计算位置
          const position = index - centerIndex;
          const spacing = CONFIG.styles.spacing;
          
          // 获取当前期数的位置
          const currentTransform = issuePositions[issue.number] !== undefined 
            ? issuePositions[issue.number] 
            : 0;
          
          // 基于状态确定样式类
          const classStyle = isActive 
            ? issueStyles.active 
            : isHovered 
              ? issueStyles.hovered 
              : issueStyles.default;
          
          const style: CSSProperties = {
            transform: `translateX(${currentTransform}px) translateY(${position * spacing}px) translateZ(0)`,
            transition: `transform ${duration} ${timing}, opacity ${duration} ${timing}, font-size ${duration} ${timing}`,
            zIndex: isActive ? 20 : 10 - Math.abs(position),
            cursor: 'pointer',
            willChange: 'transform, opacity, font-size'
          };
          
          return (
            <div 
              key={issue.id}
              className={`absolute right-0 font-newyork font-bold leading-none ${classStyle} hover:opacity-90`}
              style={style}
              onMouseEnter={() => setHoveredIssue(issue.number)}
              onMouseLeave={() => setHoveredIssue(null)}
              onClick={() => onIssueChange(issue.number)}
            >
              <div className="p-4 -m-4">{issue.number}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 子组件：日期信息
function DateInfo({ 
  dateCurrentX, 
  dateOpacity,
  issueData 
}: { 
  dateCurrentX: number, 
  dateOpacity: number,
  issueData?: Issue 
}) {
  const { duration, timing } = CONFIG.animation;
  
  if (!issueData) {
    return null;
  }
  
  const style: CSSProperties = {
    transform: `translateX(${dateCurrentX}px) translateZ(0)`,
    opacity: dateOpacity,
    transition: `transform ${duration} ${timing}, opacity ${duration} ${timing}`
  };
  
  return (
    <div 
      className="absolute left-8 bottom-[-30px] will-change-transform transform-gpu z-30 text-sm text-gray-500" 
      style={style}
    >
      <div className="flex items-center">
        <span className="opacity-70">the latest</span>
        <span className="mx-1 opacity-50">·</span>
        <span>{issueData.date}</span>
        <span className="ml-1 opacity-50">·</span>
        <span className="ml-1 opacity-70">monday updated</span>
      </div>
    </div>
  );
}