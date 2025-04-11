import { forwardRef } from "react";

interface ContentSectionProps {
  contentVisible: boolean;
  scrollProgress: number;
}

export const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  function ContentSection({ scrollProgress }, ref) {
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
    const isPhase1 = scrollProgress < 0.2;
    const isPhase2 = scrollProgress >= 0.2 && scrollProgress < 0.5;
    const isPhase3 = scrollProgress >= 0.5;
    
    return (
      <div ref={ref} className="relative">
        {/* 红色展示图片 - 保持固定大小不变 */}
        <div className="w-full flex justify-center transition-all duration-700">
          <div 
            className="bg-[#FF9E80] rounded-lg w-full max-w-md transition-all duration-700 relative"
            style={{ 
              height: '300px' // 固定高度，不再放大
            }}
          >
            {/* 图片在红色区域内，阶段3降低透明度 */}
            <div className="w-full h-full flex items-center justify-center p-8 absolute top-0 left-0">
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 120 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ opacity: isPhase3 ? Math.max(1 - phase3Progress * 0.8, 0.2) : 1 }}
              >
                <path d="M60 100C82.0914 100 100 82.0914 100 60C100 37.9086 82.0914 20 60 20C37.9086 20 20 37.9086 20 60C20 82.0914 37.9086 100 60 100Z" stroke="black" strokeWidth="2"/>
                <path d="M60 80C70.4934 80 79 71.4934 79 61C79 50.5066 70.4934 42 60 42C49.5066 42 41 50.5066 41 61C41 71.4934 49.5066 80 60 80Z" fill="black"/>
                <path d="M60 35V25" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* 文章标题和摘要 */}
        {isPhase3 ? (
          // 第三阶段：文字移入红色区域内
          <div 
            className="w-full px-6 flex flex-col items-center justify-center transition-all duration-700 absolute z-10"
            style={{ 
              transform: `translateY(-${300 + textTransform}px)`,
              opacity: initialOpacity
            }}
          >
            <div className="w-full max-w-2xl text-center">
              <div className="mb-3 text-sm font-medium">What&apos;s the news 👀 this week?</div>
              <h3 className="text-3xl font-newyork font-bold mb-1">AI Grok3</h3>
              <p className="text-xl font-newyork text-gray-700 mb-4">Onlook</p>
              <div className={`space-y-1 text-center transition-opacity duration-500 ${phase3Progress > 0.3 ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-base">Copy web Design</p>
                <p className="text-base">Micrsoft muse</p>
                <p className="text-base">UX design for Gork</p>
                <p className="text-base text-gray-600 mt-2">Nitish khagwal</p>
              </div>
            </div>
          </div>
        ) : (
          // 第二阶段：文字显示在红色区域下方
          <div className="w-full mt-14 text-center" style={{ opacity: initialOpacity }}>
            <div className="mb-3 text-sm font-semibold">What&apos;s the news 👀 this week?</div>
            <h3 className="text-3xl font-newyork font-bold mb-1">AI Grok3</h3>
            <p className="text-xl font-newyork text-gray-700 mb-4">Onlook</p>
          </div>
        )}
      </div>
    );
  }
); 