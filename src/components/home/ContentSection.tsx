import { forwardRef } from "react";

interface ContentSectionProps {
  contentVisible: boolean;
}

export const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  function ContentSection({ contentVisible }, ref) {
    return (
      <div 
        ref={ref}
        className={`center-content px-4 py-20 flex flex-col items-center ${contentVisible ? 'visible' : ''}`}
      >
        {/* 卡片和内容 */}
        <div className="w-full max-w-4xl grid grid-cols-3 gap-10 mb-16 mt-20">
          {/* 左侧占位1/3 */}
          <div></div>
          
          {/* 中间卡片 */}
          <div className="bg-[#FF9E80] rounded-lg overflow-hidden">
            <div className="w-full aspect-square flex items-center justify-center p-8">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M60 100C82.0914 100 100 82.0914 100 60C100 37.9086 82.0914 20 60 20C37.9086 20 20 37.9086 20 60C20 82.0914 37.9086 100 60 100Z" stroke="black" strokeWidth="2"/>
                <path d="M60 80C70.4934 80 79 71.4934 79 61C79 50.5066 70.4934 42 60 42C49.5066 42 41 50.5066 41 61C41 71.4934 49.5066 80 60 80Z" fill="black"/>
                <path d="M60 35V25" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          
          {/* 右侧占位1/3 */}
          <div></div>
        </div>
        
        {/* 文章标题和摘要 */}
        <div className="w-full max-w-2xl text-center mb-16">
          <div className="mb-3 text-sm">What&apos;s the news 👀 this week?</div>
          <h3 className="text-4xl font-newyork font-bold mb-3">AI Grok3</h3>
          <p className="text-2xl font-newyork text-gray-400">Onlook</p>
        </div>
        
        {/* 浏览按钮 */}
        <div className="mb-40">
          <button className="bg-black text-white px-10 py-3 rounded-full">
            browse this vol
          </button>
        </div>
      </div>
    );
  }
); 