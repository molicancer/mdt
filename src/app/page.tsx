"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { BlurMasks } from "@/components/home/BlurMasks";
import { ContentSection } from "@/components/home/ContentSection";
import { FooterNav } from "@/components/home/FooterNav";
import { HeaderNav } from "@/components/home/HeaderNav";
import { HeroTitle } from "@/components/home/HeroTitle";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { useUpdateAnimationStore } from "@/hooks/use-update-animation-store";
import { useAnimationStore } from "@/store/animationStore";
import { Loader } from "@/components/ui/loader";
import { useUIStore } from '@/store/uiStore';
import { motion } from "framer-motion";

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
  }, []);
  
  // 当用户开始滚动或触摸滑动时退出初始阶段的函数
  const exitInitialStage = useCallback(() => {
    setInitialStage(false);
    // 确保元素可见性 - setVisibility(true) 已移除
    updateAnimationValues({
      elementsOpacity: 1,
      dateOpacity: 1
    });
  }, []);
  
  // 第一阶段相关：用于检测wheel事件然后退出初始阶段
  useEffect(() => {
    if (!isPageLoaded) return;
    
    // 获取scrollLocked初始状态
    let scrollLocked = useUIStore.getState().scrollLocked;
    
    const handleWheel = (e: WheelEvent) => {
      // 如果滚动被锁定，不处理wheel事件
      if (scrollLocked) return;
      
      // 阻止默认滚动行为，禁止页面滚动导航
      e.preventDefault();
      
      
      // 向下滚动 - 触发标题移出
      if (e.deltaY > 0 && isInitialStage) {
        exitInitialStage();
      } 
      // 向上滚动且已经滚动过 - 恢复初始状态
      else if (e.deltaY < 0 && !isInitialStage && window.scrollY <= 0) {
        setInitialStage(true);
        // 重置动画状态
        updateAnimationValues({
          titleTransform: 0,
          titleOpacity: 1,
          volTransform: 0,
          numberTransform: 0,
          elementsOpacity: 0,
          dateOpacity: 0,
          dateCurrentX: 0,
          scrollProgress: 0
        });
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // 如果滚动被锁定，不处理触摸事件
      if (scrollLocked) return;
      
      // 阻止默认触摸移动行为，禁止页面滚动导航
      e.preventDefault();
      
      // 如果是初始阶段，向下滑动就退出初始阶段
      if (isInitialStage) {
        exitInitialStage();
      }
      // 如果不是初始阶段，且在页面顶部，向上滑动恢复初始状态
      else if (!isInitialStage && window.scrollY <= 0) {
        // 检测向上滑动手势 - 简化版，实际项目中可能需要更复杂的检测
        if (e.touches && e.touches.length > 0) {
          setInitialStage(true);
          // 重置动画状态
          updateAnimationValues({
            titleTransform: 0,
            titleOpacity: 1,
            volTransform: 0,
            numberTransform: 0,
            elementsOpacity: 0,
            dateOpacity: 0,
            dateCurrentX: 0,
            scrollProgress: 0
          });
        }
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
    
    // 添加事件监听器，设置passive为false以允许preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      unsubscribe(); // 清理订阅
    };
  }, [isInitialStage, isPageLoaded, exitInitialStage, setInitialStage, updateAnimationValues]);
  
  // 使用新的钩子，自动将动画值同步到Zustand
  useUpdateAnimationStore(titleRef, {
    smoothUpdateFactor: 0.3
  });

  // 如果页面尚未加载完成，显示加载组件
  if (!isPageLoaded) {
    return <Loader />;
  }

  return (
    <main className="relative min-h-screen h-screen overflow-hidden">
      {/* 背景层 - 单独动画 */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: 'var(--background)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isInitialStage ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* 顶部导航 */}
      <HeaderNav />

      {/* 底部提示 */}
      <FooterNav />
            
      {/* 模糊遮罩：z-30 */}
      <BlurMasks />
            
      <HeroTitle ref={titleRef} />

      {/* 中间内容区域 */}
      <ContentSection />

      {/* 调试面板 - 只在开发环境显示 */}
      {SHOW_DEBUG_PANEL && <DebugPanel />}
    </main>
  );
}