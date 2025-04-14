import { useEffect, useRef, useState } from "react";
import { useScrollStore } from "@/store/scrollStore";
import { SCROLL_THRESHOLDS, calculateTransform, calculateOpacity } from "@/config/scrollThresholds";
import { useUIStore } from "@/store/uiStore";

interface ScrollAnimationConfig {
  smoothUpdateFactor?: number; // 平滑更新因子
}

interface ScrollAnimationState {
  scrollY: number; // 当前滚动位置
  scrollProgress: number; // 滚动进度（0-1）
  contentVisible: boolean; // 内容是否可见
  isScrolling: boolean; // 是否正在滚动
  titleTransform: number; // 标题变换量
  titleOpacity: number; // 标题透明度
  textOpacity: number; // 文字透明度
  volTransform: number; // Vol变换量
  numberTransform: number; // 期数变换量
  elementsOpacity: number; // 元素透明度
  dateOpacity: number; // 日期透明度
  dateCurrentX: number; // 日期当前X位置
  extendedScrollProgress: number; // 扩展滚动进度，支持更大范围（0-1+）
}

export function useScrollAnimation(
  titleRef: React.RefObject<HTMLDivElement | null>,
  config: ScrollAnimationConfig = {}
): ScrollAnimationState {
  // 默认配置值
  const {
    smoothUpdateFactor = 0.5,
  } = config;

  // 从scrollStore获取滚动状态
  const scrollY = useScrollStore(state => state.scrollY);
  const isScrolling = useScrollStore(state => state.isScrolling);
  const scrollDirection = useScrollStore(state => state.scrollDirection);
  
  // 从uiStore获取滚动锁定状态
  const scrollLocked = useUIStore(state => state.scrollLocked);
  
  // 本地状态
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);

  // 引用
  const animationFrameId = useRef<number | null>(null);
  const targetScrollProgress = useRef(0);
  const accumulatedWheelDelta = useRef(0);

  // 动画值常量
  const moveDistance = 380; // Vol和期数的移动距离
  const dateInitialX = -600; // 日期初始X位置
  const dateFinalX = -moveDistance; // 日期最终X位置

  // 使用requestAnimationFrame平滑更新状态
  useEffect(() => {
    // 如果滚动被锁定，不启动动画循环
    if (scrollLocked) return;
    
    const updateScrollValues = () => {
      // 平滑过渡到目标滚动进度
      const currentProgress = scrollProgress;
      const targetProgress = targetScrollProgress.current;
      
      // 使用更新系数实现快速响应
      const newProgress = currentProgress + (targetProgress - currentProgress) * smoothUpdateFactor;
      
      // 当足够接近目标值时，直接设置为目标值
      if (Math.abs(newProgress - targetProgress) < 0.001) {
        setScrollProgress(targetProgress);
      } else {
        setScrollProgress(newProgress);
      }
      
      // 继续下一帧动画
      animationFrameId.current = requestAnimationFrame(updateScrollValues);
    };
    
    // 启动动画循环
    animationFrameId.current = requestAnimationFrame(updateScrollValues);
    
    // 清理函数
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [scrollProgress, smoothUpdateFactor, scrollLocked]);

  // 监听wheel事件，累积滚动量并计算进度
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 如果滚动被锁定，不处理wheel事件
      if (scrollLocked) return;
      
      // 累积deltaY值，用于计算虚拟滚动量
      accumulatedWheelDelta.current += e.deltaY;
      
      // 限制累积值范围
      accumulatedWheelDelta.current = Math.max(0, Math.min(100, accumulatedWheelDelta.current));
      
      // 计算滚动进度比例，范围0-1
      const progress = accumulatedWheelDelta.current / 100;
      targetScrollProgress.current = progress;
      
      // 当滚动到一定程度时显示中间内容
      if (progress > 0.6 && !contentVisible) {
        setContentVisible(true);
      } else if (progress < 0.3 && contentVisible) {
        setContentVisible(false);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [contentVisible, scrollLocked]);

  // 监听滚动方向，当向上滚动时减少累积量
  useEffect(() => {
    // 如果滚动被锁定，不处理滚动方向变化
    if (scrollLocked) return;
    
    if (scrollDirection === 'up' && accumulatedWheelDelta.current > 0) {
      accumulatedWheelDelta.current = Math.max(0, accumulatedWheelDelta.current - 2);
      targetScrollProgress.current = accumulatedWheelDelta.current / 100;
    }
  }, [scrollDirection, scrollLocked]);

  // 计算标题位置的偏移量
  const titleTransform = calculateTransform(
    scrollProgress, 
    SCROLL_THRESHOLDS.TITLE_TRANSFORM, 
    250
  );
  
  // 计算标题和说明文字的透明度
  const titleOpacity = calculateOpacity(
    scrollProgress, 
    SCROLL_THRESHOLDS.TITLE_HIDE, 
    3
  );
  
  const textOpacity = calculateOpacity(
    scrollProgress, 
    SCROLL_THRESHOLDS.TEXT_OPACITY, 
    3
  );
  
  // 计算Vol和期数的位移量，使用非线性动画，在第一阶段迅速完成移动
  const progressRatio = Math.min(scrollProgress / SCROLL_THRESHOLDS.FIRST_STAGE_COMPLETE, 1);
  const volTransform = moveDistance * progressRatio;
  const numberTransform = moveDistance * progressRatio;
  
  // 计算Vol和期数的透明度，与移动同步
  const elementsOpacity = Math.min(progressRatio * 1.2, 1);
  
  // 计算日期文本的透明度，在第一阶段与Vol和期数同步显示
  const dateOpacity = Math.min(progressRatio, 1);
  
  // 计算日期文本的位置，同样在第一阶段完成移动
  const dateCurrentX = dateInitialX + (dateFinalX - dateInitialX) * progressRatio;

  // 计算扩展滚动进度
  const extendedScrollProgress = scrollProgress > 1 ? 1 : scrollProgress;

  return {
    scrollY,
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
    dateCurrentX,
    extendedScrollProgress
  };
}