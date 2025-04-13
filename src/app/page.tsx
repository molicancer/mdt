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
import { DebugPanel } from "@/components/debug/DebugPanel";
import { useUpdateAnimationStore } from "@/hooks/use-update-animation-store";
import { useGlobalScrollVisibility } from "@/store/animationStore";
import { useAnimationStore } from "@/store/animationStore";
import { Loader } from "@/components/ui/loader";

// 是否显示调试面板，生产环境下默认为false
const SHOW_DEBUG_PANEL = process.env.NODE_ENV === 'development';

export default function Home() {
  // 创建页面加载状态
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // 创建引用
  const titleRef = useRef<HTMLDivElement>(null);
  
  // 初始化全局滚动可见性，阈值设为20
  useGlobalScrollVisibility(20);
  
  // 从animationStore获取状态和方法
  const updateAnimationValues = useAnimationStore(state => state.updateAnimationValues);
  const setActiveIssueOffset = useAnimationStore(state => state.setActiveIssueOffset);
  const isInitialStage = useAnimationStore(state => state.isInitialStage);
  const setInitialStage = useAnimationStore(state => state.setInitialStage);
  
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
      elementsOpacity: 0, // 初始阶段隐藏期数元素
      dateOpacity: 0, // 初始阶段隐藏日期
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
  
  // 监听滚动事件，当用户开始滚动时退出初始阶段
  useEffect(() => {
    if (!isPageLoaded) return;
    
    const handleScroll = () => {
      if (isInitialStage && window.scrollY > 20) {
        // 当用户开始滚动时，退出初始阶段，显示其他元素
        setInitialStage(false);
        updateAnimationValues({
          elementsOpacity: 1,
          dateOpacity: 1
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isInitialStage, setInitialStage, updateAnimationValues, isPageLoaded]);
  
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
      {/* 顶部导航：z-31 - 只在非初始阶段显示 */}
      {!isInitialStage && <HeaderNav />}

      {/* 底部提示：z-31 - 始终显示 */}
      <FooterNav />

      {/* "Select the issue number"提示 - 只在非初始阶段显示 */}
      {!isInitialStage && <SelectIssueHint />}
      
      {/* "Vol"和"54"标题 - 现在使用animationStore获取动画状态 */}
      <VolNumberElements
        visibilityConfig={{
          threshold: 150,
          initialVisible: !isInitialStage, // 初始阶段不显示
          fadeInDelay: 300,
          fadeOutDelay: 300
        }}
      />
      
      {/* 模糊遮罩：z-30 - 只在非初始阶段显示 */}
      {!isInitialStage && <BlurMasks />}
      
      {/* 浏览按钮 - 只在非初始阶段显示 */}
      {!isInitialStage && <BrowseButton />}

      {/* 大标题区域 - 始终显示 */}
      <HeroTitle ref={titleRef} />
      
      {/* 信息文本区域 - 始终显示 */}
      <InfoText />

      {/* 中间内容区域 - 只在非初始阶段显示 */}
      {!isInitialStage && <ContentSection />}

      {/* 调试面板 - 只在开发环境显示 */}
      {SHOW_DEBUG_PANEL && <DebugPanel />}
    </main>
  );
}