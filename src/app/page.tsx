"use client";

import { useRef, useEffect, useState } from "react";
import { BlurMasks } from "@/components/home/BlurMasks";
import { ContentSection } from "@/components/home/ContentSection";
import { FooterNav } from "@/components/home/FooterNav";
import { HeaderNav } from "@/components/home/HeaderNav";
import { HeroTitle } from "@/components/home/HeroTitle";
import { InfoText } from "@/components/home/InfoText";
import { SelectIssueHint } from "@/components/home/SelectIssueHint";
import { VolNumberElements } from "@/components/home/VolNumberElements";
import { BrowseButton } from "@/components/home/BrowseButton";
import { useUpdateAnimationStore } from "@/hooks/use-update-animation-store";
import { useGlobalScrollVisibility } from "@/store/animationStore";
import { useAnimationStore } from "@/store/animationStore";
import { Loader } from "@/components/ui/loader";

export default function Home() {
  // 创建页面加载状态
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // 创建引用
  const titleRef = useRef<HTMLDivElement>(null);
  
  // 初始化全局滚动可见性，阈值设为20
  useGlobalScrollVisibility(20);
  
  // 从animationStore获取重置方法
  const updateAnimationValues = useAnimationStore(state => state.updateAnimationValues);
  const setActiveIssueOffset = useAnimationStore(state => state.setActiveIssueOffset);
  
  // 页面加载和刷新时进行处理
  useEffect(() => {
    // 确保滚动条回到顶部
    window.scrollTo(0, 0);
    
    // 重置所有动画状态为初始值
    updateAnimationValues({
      scrollProgress: 0,
      isScrolling: false,
      titleTransform: 0,
      titleOpacity: 1,
      volTransform: 0,
      numberTransform: 0,
      elementsOpacity: 1,
      dateOpacity: 1,
      dateCurrentX: 0
    });
    
    // 重置期数列表垂直偏移量
    setActiveIssueOffset(0);
    
    // 设置一个短暂的延迟，确保状态完全更新后再显示页面
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300); // 增加延迟时间，确保所有动画状态设置完成
    
    return () => clearTimeout(timer);
  }, [updateAnimationValues, setActiveIssueOffset]);
  
  // 使用新的钩子，自动将动画值同步到Zustand
  useUpdateAnimationStore(titleRef, {
    scrollThreshold: 200,
    showContentThreshold: 0.3,
    hideContentThreshold: 0.15,
    smoothUpdateFactor: 0.3
  });

  // 如果页面尚未加载完成，显示加载组件
  if (!isPageLoaded) {
    return <Loader />;
  }

  return (
    <main className="min-h-screen h-[300vh] overflow-x-hidden bg-background">
      {/* 顶部导航：z-31 */}
      <HeaderNav />

      {/* 底部提示：z-31 */}
      <FooterNav />

      {/* "Select the issue number"提示 - 现在已将样式内置到组件 */}
      <SelectIssueHint />
      
      {/* "Vol"和"54"标题 - 现在使用animationStore获取动画状态 */}
      <VolNumberElements
        visibilityConfig={{
          threshold: 150,
          initialVisible: true,
          fadeInDelay: 300,
          fadeOutDelay: 300
        }}
      />
      
      {/* 模糊遮罩：z-30 */}
      <BlurMasks />
      
      {/* 浏览按钮 - 独立层级，保证在最上层，与HeaderNav同级 */}
      <BrowseButton />

      {/* 大标题区域 - 现在不需要传入动画属性，组件会从Zustand获取 */}
      <HeroTitle ref={titleRef} />
      
      {/* 信息文本区域 */}
      <InfoText />

      {/* 中间内容区域 - 现在从animationStore获取scrollProgress */}
      <ContentSection />
    </main>
  );
}