"use client";

import { useRef, useState } from "react";
import { BlurMasks } from "@/components/home/BlurMasks";
import { ContentSection } from "@/components/home/ContentSection";
import { FooterNav } from "@/components/home/FooterNav";
import { HeaderNav } from "@/components/home/HeaderNav";
import { HeroTitle } from "@/components/home/HeroTitle";
import { InfoText } from "@/components/home/InfoText";
import { SelectIssueHint } from "@/components/home/SelectIssueHint";
import { VolNumberElements } from "@/components/home/VolNumberElements";
import { BrowseButton } from "@/components/home/BrowseButton";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { motion } from "framer-motion";

export default function Home() {
  // 创建引用
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 浏览模式状态
  const [browseMode, setBrowseMode] = useState(false);
  
  // 使用自定义滚动动画
  const {
    scrollProgress,
    isScrolling,
    titleTransform,
    titleOpacity,
    textOpacity,
    volTransform,
    numberTransform,
    elementsOpacity,
    dateOpacity,
    dateCurrentX
  } = useScrollAnimation(titleRef, {
    scrollThreshold: 200,
    showContentThreshold: 0.3,
    hideContentThreshold: 0.15,
    smoothUpdateFactor: 0.3
  });

  // 管理当前选中的期数
  const [activeIssue, setActiveIssue] = useState<number>(54);

  // 处理期数变化
  const handleIssueChange = (issueNumber: number) => {
    console.log(`切换到期数: ${issueNumber}`);
    setActiveIssue(issueNumber);
  };
  
  // 处理浏览按钮点击
  const handleBrowseClick = () => {
    setBrowseMode(!browseMode);
  };

  return (
    <main className="min-h-screen h-[300vh] overflow-x-hidden bg-background">
      {/* 顶部导航：z-31 */}
      <HeaderNav />

      {/* 底部提示：z-31 */}
      <FooterNav />
      
      {/* 固定的页面结构 - 包含除顶部导航外的所有元素 */}
      <div className="fixed inset-0 flex flex-col z-20 pointer-events-none">        
        {/* "Select the issue number"提示 - 固定在页面中间上方 */}
        <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 pointer-events-none"
             style={{ opacity: browseMode ? 0 : 1, transition: 'opacity 0.5s ease' }}>
          <SelectIssueHint scrollProgress={scrollProgress} />
        </div>
        
        {/* "Vol"和"54"标题 - 滚动时分别向左右两侧移动，放置在页面正中间 */}
        <VolNumberElements
          volTransform={volTransform}
          numberTransform={numberTransform}
          elementsOpacity={elementsOpacity}
          dateCurrentX={dateCurrentX}
          dateOpacity={dateOpacity}
          activeIssue={activeIssue}
          onIssueChange={handleIssueChange}
          browseMode={browseMode}
          visibilityConfig={{
            threshold: 150,
            initialVisible: true,
            fadeInDelay: 300,
            fadeOutDelay: 300
          }}
        />
      </div>
      
      {/* 模糊遮罩：z-30 */}
      <BlurMasks />
      
      {/* 浏览按钮 - 独立层级，保证在最上层，与HeaderNav同级，距离底部80px */}
      <div className="fixed left-0 w-full z-[100] pointer-events-auto"
           style={{ 
             bottom: browseMode ? '40px' : '80px',
             transition: 'bottom 0.7s ease-in-out'
           }}>
        <BrowseButton 
          scrollProgress={scrollProgress} 
          activeIssue={activeIssue}
          browseMode={browseMode}
          onBrowseClick={handleBrowseClick}
        />
      </div>

      {/* 可滚动的内容区域 */}
      <div className="min-h-screen flex flex-col">
        {/* 大标题区域 - 垂直居中 */}
        <div className="flex flex-col items-center justify-center min-h-screen relative">
          <div className="max-w-4xl">
            {/* 大标题 */}
            <HeroTitle
              ref={titleRef}
              titleTransform={titleTransform}
              titleOpacity={browseMode ? 0 : titleOpacity}
              isScrolling={isScrolling}
            />
          </div>
        </div>
        
        {/* 信息文本区域 - 位于大标题初始位置的下方，固定位置，只淡出不移动 */}
        <div className="fixed left-0 w-full flex justify-center" 
             style={{ 
               top: 'calc(50vh + 110px)',
               opacity: browseMode ? 0 : textOpacity,
               transition: 'opacity 0.5s ease'
             }}>
          <div className="max-w-4xl">
            <InfoText textOpacity={textOpacity} />
          </div>
        </div>

        {/* 中间内容区域 - 设置为固定位置，正好在大图标初始位置的顶部 */}
        <div className="fixed left-0 w-full z-[21] pointer-events-auto"
             style={{ 
               top: browseMode ? '50%' : 'calc(50vh - 220px)',
               transform: browseMode ? 'translateY(-50%)' : 'translateY(0)',
               opacity: browseMode ? 1 : (scrollProgress > 0.2 ? 1 : 0), 
               transition: 'opacity 0.7s ease, top 0.7s ease-in-out, transform 0.7s ease-in-out',
               pointerEvents: browseMode || scrollProgress > 0.2 ? 'auto' : 'none' 
             }}>
          <ContentSection 
            ref={contentRef}
            contentVisible={true}
            scrollProgress={scrollProgress}
            activeIssue={activeIssue}
            browseMode={browseMode}
          />
        </div>
      </div>
    </main>
  );
}
