"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { BlurMasks } from "@/components/home/BlurMasks";
import { BackgroundLayer } from "@/components/home/BackgroundLayer";
import { ContentSection } from "@/components/home/ContentSection";
import { FooterNav } from "@/components/home/FooterNav";
import { HeaderNav } from "@/components/home/HeaderNav";
import { HeroTitle } from "@/components/home/HeroTitle";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { useAnimationStore } from "@/store/animationStore";
import { Loader } from "@/components/ui/loader";
import { useScrollStore } from '@/store/scrollStore';

// 是否显示调试面板，生产环境下默认为false
const SHOW_DEBUG_PANEL = process.env.NODE_ENV === 'development';

// 重置动画值的默认参数
const initialAnimationValues = {
  scrollProgress: 0,
  titleTransform: 0,
  titleOpacity: 1,
};

// 滚动阈值设置
const SCROLL_THRESHOLDS = {
  INITIAL_TO_PREVIEW: 300, // 从初始状态到预览状态的滚动阈值
  PREVIEW_TO_READING: 600 // 从预览状态到阅读状态的滚动阈值
};

export default function Home() {
  // 创建页面加载状态
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // 创建引用
  const titleRef = useRef<HTMLDivElement>(null);
  
  // 从animationStore获取状态和方法
  const updateAnimationValues = useAnimationStore(state => state.updateAnimationValues);
  const isInitialStage = useAnimationStore(state => state.isInitialStage);
  const setInitialStage = useAnimationStore(state => state.setInitialStage);
  const isArticleReading = useAnimationStore(state => state.isArticleReading);
  const setArticleReading = useAnimationStore(state => state.setArticleReading);
  
  // 滚动状态跟踪
  const [scrollState, setScrollState] = useState({
    // 累积的滚动量
    accumulatedScroll: 0,
  });
  
  // 页面加载时初始化
  useEffect(() => {
    // 确保滚动条回到顶部
    window.scrollTo(0, 0);
    
    // 重置所有动画状态为初始值
    updateAnimationValues(initialAnimationValues);
    setArticleReading(false);
    
    // 重置滚动状态
    setScrollState({
      accumulatedScroll: 0,
    });
    
    // 设置短暂延迟确保状态更新后再显示页面
    const timer = setTimeout(() => setIsPageLoaded(true), 300);
    
    return () => clearTimeout(timer);
  }, [updateAnimationValues, setArticleReading]);
  
  // 退出初始阶段进入预览状态
  const exitInitialStage = useCallback(() => {
    setInitialStage(false);
    updateAnimationValues({
      scrollProgress: 1 // 设置scrollProgress为1，确保HeroTitle完全消失
    });
    setScrollState(prev => ({
      ...prev,
      accumulatedScroll: 0,
    }));
  }, [setInitialStage, updateAnimationValues]);
  
  // 重置到初始阶段
  const resetToInitialStage = useCallback(() => {
    setInitialStage(true);
    setArticleReading(false);
    updateAnimationValues(initialAnimationValues);
    setScrollState({
      accumulatedScroll: 0,
    });
  }, [setInitialStage, setArticleReading, updateAnimationValues]);
  
  // 进入文章阅读状态
  const enterArticleReadingState = useCallback(() => {
    if (!isInitialStage && !isArticleReading) {
      setArticleReading(true);
      setScrollState(prev => ({
        ...prev,
        accumulatedScroll: 0
      }));
    }
  }, [isInitialStage, isArticleReading, setArticleReading]);
  
  // 退出文章阅读状态
  const exitArticleReadingState = useCallback(() => {
    if (isArticleReading) {
      setArticleReading(false);
      setScrollState({
        accumulatedScroll: 0,
      });
    }
  }, [isArticleReading, setArticleReading]);
  
  // 处理滚动事件和触摸事件
  useEffect(() => {
    if (!isPageLoaded) return;
    
    // 获取scrollLocked初始状态
    let scrollLocked = useScrollStore.getState().scrollLocked;
    let lastScrollY = 0;
    
    // 动画进展状态
    let animationProgress = isInitialStage ? 0 : 1;
    let accumulatedDeltaY = 0;
    
    // 处理滚动事件
    const handleScroll = (deltaY: number) => {
      // 如果滚动被锁定，不处理滚动
      if (scrollLocked) return;
      
      // 1. 处理初始状态 -> 预览状态的转换
      if (isInitialStage) {
        if (deltaY > 0) { // 向下滚动
          accumulatedDeltaY += deltaY;
          
          // 计算动画进展
          animationProgress = Math.min(1, accumulatedDeltaY / SCROLL_THRESHOLDS.INITIAL_TO_PREVIEW);
          
          // 更新动画值
          updateAnimationValues({
            scrollProgress: animationProgress,
            titleTransform: 500 * animationProgress,
            titleOpacity: 1 - animationProgress
          });
          
          // 当累积足够多的滚动量，进入预览状态
          if (accumulatedDeltaY >= SCROLL_THRESHOLDS.INITIAL_TO_PREVIEW) {
            exitInitialStage();
            accumulatedDeltaY = 0;
          }
        }
      } 
      // 2. 处理预览状态 -> 阅读状态的转换
      else if (!isArticleReading) {
        if (deltaY > 0) { // 继续向下滚动
          // 获取当前累积的滚动量
          const currentAccumulatedScroll = scrollState.accumulatedScroll;
          // 计算新的累积滚动量
          const newAccumulatedScroll = currentAccumulatedScroll + deltaY;
          
          // 先检查是否应该进入阅读状态
          if (newAccumulatedScroll >= SCROLL_THRESHOLDS.PREVIEW_TO_READING) {
            // 先更新状态，然后在下一个渲染周期进入阅读状态
            setScrollState({
              accumulatedScroll: 0
            });
            // 在状态更新后调用enterArticleReadingState
            setTimeout(() => {
              enterArticleReadingState();
            }, 0);
          } else {
            // 如果未达到阈值，只更新累积的滚动量
            setScrollState({
              accumulatedScroll: newAccumulatedScroll
            });
          }
        } else if (deltaY < 0 && window.scrollY <= 0) { // 向上滚动且在页面顶部
          resetToInitialStage();
          accumulatedDeltaY = 0;
        }
      }
      // 3. 处理阅读状态 -> 预览状态的转换
      else if (isArticleReading && deltaY < 0 && window.scrollY <= 0) {
        exitArticleReadingState();
      }
    };
    
    // wheel事件处理
    const handleWheel = (e: WheelEvent) => {
      // 如果这是初始状态到预览状态的转换，阻止默认滚动
      if (isInitialStage || (e.deltaY < 0 && window.scrollY <= 0 && !isArticleReading)) {
        e.preventDefault();
      }
      
      handleScroll(e.deltaY);
    };
    
    // 触摸事件处理
    const handleTouchMove = (e: TouchEvent) => {
      if (scrollLocked) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = lastScrollY - currentY;
      lastScrollY = currentY;
      
      // 如果这是初始状态到预览状态的转换，阻止默认滚动
      if (isInitialStage || (deltaY < 0 && window.scrollY <= 0 && !isArticleReading)) {
        e.preventDefault();
      }
      
      handleScroll(deltaY);
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        lastScrollY = e.touches[0].clientY;
      }
    };
    
    // 使用scrollStore订阅锁定状态
    const unsubscribe = useScrollStore.subscribe(
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
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      unsubscribe(); // 清理订阅
    };
  }, [
    isInitialStage, 
    isArticleReading, 
    isPageLoaded, 
    exitInitialStage, 
    resetToInitialStage, 
    enterArticleReadingState, 
    exitArticleReadingState,
    updateAnimationValues,
    scrollState
  ]);

  // 如果页面尚未加载完成，显示加载组件
  if (!isPageLoaded) {
    return <Loader />;
  }

  return (
    <main className="relative min-h-screen">
      <BackgroundLayer isInitialStage={isInitialStage} />
      <HeaderNav />
      <FooterNav />
      <BlurMasks />
      <HeroTitle ref={titleRef} />
      <ContentSection />
      {SHOW_DEBUG_PANEL && <DebugPanel />}
    </main>
  );
}