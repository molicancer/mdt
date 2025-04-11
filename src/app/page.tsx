"use client";

import { useRef } from "react";
import { BlurMasks } from "@/components/home/BlurMasks";
import { BackToTopButton } from "@/components/home/BackToTopButton";
import { ContentSection } from "@/components/home/ContentSection";
import { FooterNav } from "@/components/home/FooterNav";
import { HeaderNav } from "@/components/home/HeaderNav";
import { HeroTitle } from "@/components/home/HeroTitle";
import { InfoText } from "@/components/home/InfoText";
import { VolNumberElements } from "@/components/home/VolNumberElements";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function Home() {
  // 创建引用
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 使用自定义滚动动画
  const {
    scrollProgress,
    contentVisible,
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
    scrollThreshold: 500,
    showContentThreshold: 0.6,
    hideContentThreshold: 0.3,
    smoothUpdateFactor: 0.5
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      {/* 顶部导航 - 独立放置确保最高层级 */}
      <HeaderNav />
      
      {/* 固定的页面结构 - 包含除顶部导航外的所有元素 */}
      <div className="fixed inset-0 flex flex-col z-20 pointer-events-none">
        {/* 中间区域 - 用于对齐 */}
        <div className="h-[88px]"></div> {/* 为HeaderNav留出空间 */}
        
        {/* "Vol"和"54"标题 - 滚动时分别向左右两侧移动 */}
        <div className="flex-1 flex items-center justify-center pointer-events-none">
          <VolNumberElements
            volTransform={volTransform}
            numberTransform={numberTransform}
            elementsOpacity={elementsOpacity}
            dateCurrentX={dateCurrentX}
            dateOpacity={dateOpacity}
          />
        </div>

        {/* 信息文本区域 */}
        <InfoText textOpacity={textOpacity} scrollProgress={scrollProgress} />

        {/* 底部提示 - 固定在底部 */}
        <FooterNav />
      </div>

      {/* 模糊遮罩 - 在Vol和54之上，在Header之下 */}
      <BlurMasks />

      {/* 返回顶部按钮 */}
      <BackToTopButton scrollProgress={scrollProgress} titleRef={titleRef} />

      {/* 可滚动的内容区域 */}
      <div className="min-h-screen flex flex-col">
        {/* 大标题区域 - 垂直居中 */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="max-w-4xl">
            {/* 大标题 */}
            <HeroTitle
              ref={titleRef}
              titleTransform={titleTransform}
              titleOpacity={titleOpacity}
              isScrolling={isScrolling}
            />
          </div>
        </div>

        {/* 中间内容区域 - 滚动后显示 */}
        <ContentSection 
          ref={contentRef}
          contentVisible={contentVisible}
        />
        
        {/* 额外的滚动空间 */}
        <div className="h-[30vh]"></div>
      </div>
    </main>
  );
}
