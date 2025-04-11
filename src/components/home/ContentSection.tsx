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
}

export const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  function ContentSection({ scrollProgress, activeIssue = 54 }, ref) {
    // 状态: 当前内容
    const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
    const [prevContent, setPrevContent] = useState<IssueContent | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // 计算动画阶段
    // 阶段1: 初始状态，scrollProgress < 0.2
    // 阶段2: 中间停留状态，0.2 < scrollProgress < 0.5
    // 阶段3: 文字融入红色区域，scrollProgress > 0.5
    
    // 中间状态的内容显示
    const initialOpacity = Math.min((scrollProgress - 0.2) * 5, 1);
    
    // 第三阶段进度
    const phase3Progress = Math.max(scrollProgress - 0.5, 0) / 0.3; // 阶段3进度百分比(0-1)，0.3的范围内完成动画
    
    // 计算文字向上移动的距离，阶段3才开始移动
    const textTransform = Math.min(120 * phase3Progress, 120); // 最大移动120px
    
    // 判断当前处于哪个阶段
    const isPhase3 = scrollProgress >= 0.5;
    
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
    
    return (
      <div ref={ref} className="relative">
        {/* 颜色区域 - 当期数变化时使用动画过渡 */}
        <div className="w-full flex justify-center transition-all duration-700">
          <div 
            className="rounded-lg w-full max-w-md relative overflow-hidden"
            style={{ 
              height: '300px', // 固定高度
              backgroundColor: currentContent.color,
              transition: 'background-color 0.7s ease'
            }}
          >
            {/* 过渡层 - 仅在切换期数时显示 */}
            {isTransitioning && prevContent && (
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: prevContent.color,
                  opacity: contentFadeState === "fading-out" ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                  zIndex: 1
                }}
              />
            )}
            
            {/* 图标 - 随期数变化时有淡入淡出效果 */}
            <div 
              className="w-full h-full flex items-center justify-center p-8 absolute top-0 left-0"
              style={{ 
                opacity: contentFadeState === "visible" ? (isPhase3 ? Math.max(1 - phase3Progress * 0.8, 0.2) : 1) : contentOpacity,
                transition: 'opacity 0.5s ease'
              }}
            >
              <div className="transition-all duration-500">
                {renderIcon(currentContent.icon)}
              </div>
            </div>
          </div>
        </div>
        
        {/* 文章标题和摘要 */}
        {isPhase3 ? (
          // 第三阶段：文字移入区域内
          <div 
            className="w-full px-6 flex flex-col items-center justify-center transition-all duration-700 absolute z-10"
            style={{ 
              transform: `translateY(-${300 + textTransform}px)`,
              opacity: contentFadeState === "visible" ? initialOpacity : contentOpacity,
              transition: 'transform 0.7s ease, opacity 0.5s ease'
            }}
          >
            <div className="w-full max-w-2xl text-center transition-all duration-500">
              <div className="mb-3 text-sm font-medium transition-all duration-500">这周有什么新鲜事 👀 ?</div>
              <h3 className="text-3xl font-newyork font-bold mb-1 transition-all duration-500">{currentContent.title}</h3>
              <p className="text-xl font-newyork text-gray-700 mb-4 transition-all duration-500">{currentContent.subtitle}</p>
              <div className={`space-y-1 text-center transition-all duration-500 ${phase3Progress > 0.3 ? 'opacity-100' : 'opacity-0'}`}>
                {currentContent.items.map((item, index) => (
                  <p key={index} className="text-base transition-all duration-500" 
                    style={{ 
                      transitionDelay: `${index * 0.05}s`,
                      opacity: phase3Progress > 0.3 + (index * 0.05) ? 1 : 0
                    }}>
                    {item}
                  </p>
                ))}
                {currentContent.author && (
                  <p className="text-base text-gray-600 mt-2 transition-all duration-500 opacity-70">{currentContent.author}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // 第二阶段：文字显示在区域下方
          <div 
            className="w-full mt-14 text-center transition-all duration-500"
            style={{ 
              opacity: contentFadeState === "visible" ? initialOpacity : contentOpacity,
              transition: 'opacity 0.5s ease'
            }}
          >
            <div className="mb-3 text-sm font-semibold">这周有什么新鲜事 👀 ?</div>
            <h3 className="text-3xl font-newyork font-bold mb-1 transition-all duration-500">{currentContent.title}</h3>
            <p className="text-xl font-newyork text-gray-700 mb-4 transition-all duration-500">{currentContent.subtitle}</p>
          </div>
        )}
      </div>
    );
  }
); 