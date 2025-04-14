"use client";

import { useRef, useEffect, useState, useCallback } from "react";
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
import { useAnimationStore } from "@/store/animationStore";
import { Loader } from "@/components/ui/loader";
import { useUIStore } from '@/store/uiStore';

// 是否显示调试面板，生产环境下默认为false
const SHOW_DEBUG_PANEL = process.env.NODE_ENV === 'development';

export default function Home() {
  // 创建页面加载状态
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // 创建引用
  const titleRef = useRef<HTMLDivElement>(null);
  
  // 从animationStore获取状态和方法
  const updateAnimationValues = useAnimationStore(state => state.updateAnimationValues);
  const setActiveIssueOffset = useAnimationStore(state => state.setActiveIssueOffset);
  const isInitialStage = useAnimationStore(state => state.isInitialStage);
  const setInitialStage = useAnimationStore(state => state.setInitialStage);
  const setVisibility = useAnimationStore(state => state.setVisibility);
  
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
      elementsOpacity: 0,
      dateOpacity: 0,
      dateCurrentX: 0
    });
    
    // 确保可见性状态为true
    setVisibility(true);
    
    // 重置期数列表垂直偏移量
    setActiveIssueOffset(0);
    
    // 设置短暂延迟确保状态更新后再显示页面
    const timer = setTimeout(() => setIsPageLoaded(true), 300);
    
    return () => clearTimeout(timer);
  }, [updateAnimationValues, setActiveIssueOffset, setVisibility]);
  
  // 当用户开始滚动或触摸滑动时退出初始阶段的函数
  const exitInitialStage = useCallback(() => {
    setInitialStage(false);
    // 确保元素可见性
    setVisibility(true);
    updateAnimationValues({
      elementsOpacity: 1,
      dateOpacity: 1
    });
  }, [setInitialStage, updateAnimationValues, setVisibility]);
  
  // 第一阶段相关：用于检测wheel事件然后退出初始阶段
  useEffect(() => {
    if (!isPageLoaded) return;
    
    // 获取scrollLocked初始状态
    let scrollLocked = useUIStore.getState().scrollLocked;
    
    const handleWheel = (e: WheelEvent) => {
      // 如果滚动被锁定，不处理wheel事件
      if (scrollLocked) return;
      
      if (isInitialStage) {
        e.preventDefault();
        exitInitialStage();
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // 如果滚动被锁定，不处理触摸事件
      if (scrollLocked) return;
      
      if (isInitialStage) {
        e.preventDefault();
        exitInitialStage();
      }
    };
    
    // 使用正确的zustand订阅语法
    const unsubscribe = useUIStore.subscribe(
      (state) => {
        // 检测到滚动锁定状态变化，更新本地变量
        if (state.scrollLocked !== scrollLocked) {
          scrollLocked = state.scrollLocked;
        }
      }
    );
    
    // 添加事件监听器
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      unsubscribe(); // 清理订阅
    };
  }, [isInitialStage, isPageLoaded, exitInitialStage]);
  
  // 使用新的钩子，自动将动画值同步到Zustand
  useUpdateAnimationStore(titleRef, {
    smoothUpdateFactor: 0.3
  });

  // 如果页面尚未加载完成，显示加载组件
  if (!isPageLoaded) {
    return <Loader />;
  }

  return (
    <main className="min-h-screen h-screen overflow-hidden bg-background">
      {/* 顶部导航：z-31 - 只在非初始阶段显示 */}
      {!isInitialStage && <HeaderNav />}

      {/* 底部提示：z-31 - 始终显示 */}
      <FooterNav />

      {/* "Select the issue number"提示 - 只在非初始阶段显示 */}
      {!isInitialStage && <SelectIssueHint />}
      
      {/* "Vol"和"期数"标题 */}
      <VolNumberElements
        visibilityConfig={{
          initialVisible: !isInitialStage,
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