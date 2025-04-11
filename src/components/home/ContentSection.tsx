import { forwardRef, useState, useEffect } from "react";

// 定义期数内容数据接口
interface IssueContent {
  id: number;
  number: number;
  color: string;
  title: string;
  subtitle: string;
  items: string[];
  author?: string;
  icon: string;
}

// 期数内容数据
const issueContents: IssueContent[] = [
  {
    id: 1,
    number: 54,
    color: "#FF9E80", // 橙红色
    title: "AI Grok3",
    subtitle: "Onlook",
    items: ["Copy web Design", "Micrsoft muse", "UX design for Gork"],
    author: "Nitish khagwal",
    icon: "circle" // SVG类型
  },
  {
    id: 2,
    number: 53,
    color: "#90CAF9", // 蓝色
    title: "New ios19",
    subtitle: "Gpt 4o",
    items: ["Flora AI", "Claude 3.7", "通义万象Wan", "Runway"],
    author: "Tim Cook",
    icon: "phone" // SVG类型
  },
  {
    id: 3,
    number: 52,
    color: "#81C784", // 绿色
    title: "Android 15",
    subtitle: "Material You",
    items: ["Google I/O", "Design patterns", "Modern Android"],
    author: "Sundar Pichai",
    icon: "android" // SVG类型
  }
];

interface ContentSectionProps {
  contentVisible: boolean;
  scrollProgress: number;
  activeIssue?: number; // 当前选中的期数
  browseMode?: boolean; // 是否处于浏览模式
}

export const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  function ContentSection({ scrollProgress, activeIssue = 54, browseMode = false }, ref) {
    // 状态: 当前内容
    const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
    const [prevContent, setPrevContent] = useState<IssueContent | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // 鼠标悬停状态，用于判断是否显示第三阶段
    const [isHovered, setIsHovered] = useState(false);
    
    // 计算动画阶段
    // 阶段1: 初始状态，scrollProgress < 0.2
    // 阶段2: 中间停留状态，0.2 < scrollProgress < 0.5
    // 阶段3: 文字融入红色区域，isHovered = true
    
    // 中间状态的内容显示
    const initialOpacity = Math.min((scrollProgress - 0.2) * 5, 1);
    
    // 判断当前处于哪个阶段 - 由鼠标悬停决定
    const isPhase3 = isHovered;
    
    // 计算颜色区域的高度 - 悬停时增加高度以包含文本
    const colorBlockHeight = isHovered ? 450 : 300; // 单位: px，悬停时高度更高以确保包含全部文本
    
    // 内容淡入淡出动画状态
    const [contentFadeState, setContentFadeState] = useState("visible"); // "fading-out", "fading-in", "visible"
    const [pendingContent, setPendingContent] = useState<IssueContent | null>(null);
    
    // 监听期数变化
    useEffect(() => {
      // 找到对应的内容
      const targetContent = issueContents.find(item => item.number === activeIssue);
      if (!targetContent) return;
      
      // 首次加载，直接设置
      if (!currentContent) {
        setCurrentContent(targetContent);
        return;
      }
      
      // 已有内容且期数变化了，触发过渡
      if (currentContent.number !== targetContent.number) {
        console.log(`开始切换: ${currentContent.number} -> ${targetContent.number}`);
        
        // 标记过渡开始，保存上一个内容
        setPrevContent(currentContent);
        setIsTransitioning(true);
        
        // 先将当前内容淡出
        setContentFadeState("fading-out");
        setPendingContent(targetContent);
        
        // 不立即更新当前内容，等淡出完成后再设置新内容
      }
    }, [activeIssue, currentContent]);
    
    // 处理内容淡入淡出
    useEffect(() => {
      if (contentFadeState === "fading-out") {
        // 内容淡出动画结束后，设置新内容并开始淡入
        const timer = setTimeout(() => {
          if (pendingContent) {
            setCurrentContent(pendingContent);
            setContentFadeState("fading-in");
          }
        }, 300); // 淡出时间
        
        return () => clearTimeout(timer);
      } 
      else if (contentFadeState === "fading-in") {
        // 淡入动画结束后，设置为可见状态
        const timer = setTimeout(() => {
          setContentFadeState("visible");
          setIsTransitioning(false);
          setPrevContent(null);
        }, 500); // 淡入时间
        
        return () => clearTimeout(timer);
      }
    }, [contentFadeState, pendingContent]);
    
    // 如果没有找到对应内容，使用默认的第一个
    useEffect(() => {
      if (!currentContent && issueContents.length > 0) {
        const defaultContent = issueContents.find(item => item.number === activeIssue) || issueContents[0];
        setCurrentContent(defaultContent);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    if (!currentContent) return null;
    
    // 内容透明度，根据淡入淡出状态确定
    const contentOpacity = 
      contentFadeState === "fading-out" ? 0 : 
      contentFadeState === "fading-in" ? 1 : 1;
    
    // 渲染图标
    const renderIcon = (iconType: string) => {
      switch (iconType) {
        case 'phone':
          return (
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="10" width="40" height="100" rx="10" stroke="black" strokeWidth="2" />
              <circle cx="60" cy="95" r="8" stroke="black" strokeWidth="2" />
              <rect x="55" y="20" width="10" height="4" rx="2" fill="black" />
            </svg>
          );
        case 'android':
          return (
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="40" stroke="black" strokeWidth="2" />
              <circle cx="45" cy="50" r="5" fill="black" />
              <circle cx="75" cy="50" r="5" fill="black" />
              <path d="M40 70 Q 60 90 80 70" stroke="black" strokeWidth="2" fill="none" />
            </svg>
          );
        case 'circle':
        default:
          return (
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 100C82.0914 100 100 82.0914 100 60C100 37.9086 82.0914 20 60 20C37.9086 20 20 37.9086 20 60C20 82.0914 37.9086 100 60 100Z" stroke="black" strokeWidth="2"/>
              <path d="M60 80C70.4934 80 79 71.4934 79 61C79 50.5066 70.4934 42 60 42C49.5066 42 41 50.5066 41 61C41 71.4934 49.5066 80 60 80Z" fill="black"/>
              <path d="M60 35V25" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          );
      }
    };
    
    // 处理鼠标事件
    const handleMouseEnter = () => {
      console.log("鼠标进入颜色区域", isHovered);
      setIsHovered(true);
    };
    
    const handleMouseLeave = () => {
      console.log("鼠标离开颜色区域", isHovered);
      setIsHovered(false);
    };
    
    return (
      <div ref={ref} className="relative">
        {/* 颜色区域整体容器 - 浏览模式下隐藏 */}
        <div 
          className="w-full flex justify-center transition-all duration-700 relative"
          style={{ 
            opacity: browseMode ? 0 : 1,
            visibility: browseMode ? 'hidden' : 'visible',
            transitionProperty: 'opacity, visibility',
            transitionDuration: '0.7s, 0s',
            transitionDelay: '0s, ' + (browseMode ? '0.7s' : '0s')
          }}
        >
          {/* 主颜色区域 - 鼠标悬停变化的核心区域 */}
          <div 
            className="rounded-lg w-full max-w-md cursor-pointer relative"
            style={{ 
              height: `${colorBlockHeight}px`, // 动态高度
              backgroundColor: currentContent.color,
              transitionProperty: 'background-color, height',
              transitionDuration: '0.7s, 0.7s',
              transitionTimingFunction: 'ease, ease-in-out',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* 过渡层 - 仅在切换期数时显示 */}
            {isTransitioning && prevContent && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: prevContent.color,
                  opacity: contentFadeState === "fading-out" ? 1 : 0,
                  transitionProperty: 'opacity',
                  transitionDuration: '0.5s',
                  transitionTimingFunction: 'ease',
                  zIndex: 1
                }}
              />
            )}
          </div>
        </div>
        
        {/* 图标部分 - 与颜色区域分离，以便在浏览模式下保持可见 */}
        <div 
          className={`${browseMode ? 'fixed inset-x-0 z-30' : 'absolute left-0 w-full'} flex justify-center pointer-events-none`}
          style={{ 
            top: browseMode ? '50%' : '0',
            transform: browseMode ? 'translateY(-50%)' : 'translateY(0)',
            opacity: contentFadeState === "visible" ? 1 : contentOpacity,
            transitionProperty: 'top, opacity, transform',
            transitionDuration: '0.5s, 0.5s, 0.5s',
            transitionTimingFunction: 'ease-in-out, ease, ease-in-out',
          }}
        >
          <div 
            className={`w-full max-w-md flex items-center justify-center`}
            style={{ 
              height: browseMode ? '150px' : '300px',
              opacity: contentFadeState === "visible" ? (isPhase3 && !browseMode ? 0.2 : 1) : contentOpacity,
              transitionProperty: 'opacity, height',
              transitionDuration: '0.5s, 0.7s',
              transitionTimingFunction: 'ease, ease-in-out'
            }}
          >
            <div 
              className="transition-all duration-500"
              style={{
                transform: browseMode ? 'scale(0.7)' : 'scale(1)',
                transitionProperty: 'transform',
                transitionDuration: '0.7s',
                transitionTimingFunction: 'ease-in-out'
              }}
            >
              {renderIcon(currentContent.icon)}
            </div>
          </div>
        </div>
        
        {/* 文字内容 - 浏览模式下隐藏 */}
        <div 
          className="absolute w-full pointer-events-none"
          style={{ 
            top: isHovered ? '0' : '340px',
            opacity: browseMode ? 0 : (contentFadeState === "visible" ? initialOpacity : contentOpacity),
            visibility: browseMode ? 'hidden' : 'visible',
            transitionProperty: 'top, opacity, visibility',
            transitionDuration: '0.7s, 0.5s, 0s',
            transitionTimingFunction: 'ease-in-out, ease, linear',
            transitionDelay: '0s, 0s, ' + (browseMode ? '0.5s' : '0s'),
            zIndex: isHovered ? 10 : 1
          }}
        >
          <div className="flex justify-center">
            <div className="w-full max-w-md text-center">
              <div 
                className="mb-3 text-sm font-medium transition-all duration-500"
                style={{ 
                  transitionDelay: '0.05s',
                  transitionProperty: 'transform',
                  transitionDuration: '0.7s',
                  transitionTimingFunction: 'ease-in-out',
                  transform: isHovered ? 'translateY(150px)' : 'translateY(0)'
                }}
              >
                这周有什么新鲜事 👀 ?
              </div>
              <h3 
                className="text-3xl font-newyork font-bold mb-1 transition-all duration-500"
                style={{ 
                  transitionDelay: '0.1s',
                  transitionProperty: 'transform',
                  transitionDuration: '0.7s',
                  transitionTimingFunction: 'ease-in-out',
                  transform: isHovered ? 'translateY(150px)' : 'translateY(0)'
                }}
              >
                {currentContent.title}
              </h3>
              <p 
                className="text-xl font-newyork text-gray-700 mb-4 transition-all duration-500"
                style={{ 
                  transitionDelay: '0.15s',
                  transitionProperty: 'transform',
                  transitionDuration: '0.7s',
                  transitionTimingFunction: 'ease-in-out',
                  transform: isHovered ? 'translateY(150px)' : 'translateY(0)'
                }}
              >
                {currentContent.subtitle}
              </p>
              <div 
                className="space-y-1 text-center"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateY(150px)' : 'translateY(50px)',
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '0.5s, 0.7s',
                  transitionTimingFunction: 'ease, ease-in-out'
                }}
              >
                {currentContent.items.map((item, index) => (
                  <p 
                    key={index} 
                    className="text-base transition-all duration-500" 
                    style={{ 
                      transitionDelay: `${0.2 + index * 0.05}s`,
                      transitionProperty: 'all',
                      transitionDuration: '0.7s',
                      transitionTimingFunction: 'ease-in-out'
                    }}
                  >
                    {item}
                  </p>
                ))}
                {currentContent.author && (
                  <p 
                    className="text-base text-gray-600 mt-4 opacity-70 transition-all duration-500"
                    style={{
                      transitionDelay: `${0.2 + currentContent.items.length * 0.05 + 0.1}s`,
                      transitionProperty: 'all',
                      transitionDuration: '0.7s',
                      transitionTimingFunction: 'ease-in-out'
                    }}
                  >
                    {currentContent.author}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
); 