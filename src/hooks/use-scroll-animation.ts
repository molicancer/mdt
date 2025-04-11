import { useEffect, useRef, useState } from "react";

// 缓动函数
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

interface ScrollAnimationConfig {
  scrollThreshold?: number; // 滚动阈值
  showContentThreshold?: number; // 显示内容的阈值
  hideContentThreshold?: number; // 隐藏内容的阈值
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
  numberTransform: number; // 54变换量
  elementsOpacity: number; // 元素透明度
  dateOpacity: number; // 日期透明度
  dateCurrentX: number; // 日期当前X位置
}

export function useScrollAnimation(
  titleRef: React.RefObject<HTMLDivElement | null>,
  config: ScrollAnimationConfig = {}
): ScrollAnimationState {
  // 默认配置值
  const {
    scrollThreshold = 500,
    showContentThreshold = 0.6,
    hideContentThreshold = 0.3,
    smoothUpdateFactor = 0.5,
  } = config;

  // 状态
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // 引用
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const targetScrollProgress = useRef(0);

  // 动画值常量
  const moveDistance = 380; // Vol和54的移动距离
  const dateInitialX = -600; // 日期初始X位置
  const dateFinalX = -moveDistance; // 日期最终X位置
  const dateOpacityStart = 0.05; // 日期开始显示的滚动进度
  const dateOpacityEnd = 0.4; // 日期完全显示的滚动进度

  // 使用requestAnimationFrame平滑更新状态
  useEffect(() => {
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
  }, [scrollProgress, smoothUpdateFactor]);

  // 监听滚动事件，计算目标滚动进度
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      lastScrollY.current = currentScrollY;
      setScrollY(currentScrollY);
      
      // 计算滚动进度
      const progress = Math.min(currentScrollY / scrollThreshold, 1);
      // 更新目标进度，而不是直接更新状态
      targetScrollProgress.current = progress;
      
      // 设置滚动状态
      setIsScrolling(true);
      
      // 当滚动到一定程度时显示中间内容
      if (progress > showContentThreshold && !contentVisible) {
        setContentVisible(true);
      } else if (progress < hideContentThreshold && contentVisible) {
        setContentVisible(false);
      }
      
      // 清除之前的定时器，重置超时
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // 设置新的定时器
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
        
        // 如果滚动进度在中间位置，自动完成动画
        if (progress > 0.1 && progress < 0.6) {
          // 自动滚动到适当位置
          window.scrollTo({
            top: progress > 0.3 ? scrollThreshold : 0,
            behavior: 'smooth'
          });
        } else if (progress > 0.6 && progress < 0.9) {
          // 如果在内容区域但没完全滚动，自动滚动到内容
          window.scrollTo({
            top: scrollThreshold,
            behavior: 'smooth'
          });
        } else if (progress < 0.05) {
          // 确保非常接近顶部时，强制回到顶部并重置状态
          targetScrollProgress.current = 0;
          setScrollY(0);
          // 确保大标题立即显示，处理null情况
          const titleElement = titleRef.current;
          if (titleElement) {
            titleElement.style.opacity = '1';
            titleElement.style.transform = 'translateY(0)';
          }
        }
      }, 100); // 减少超时时间，提高响应性
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [contentVisible, scrollThreshold, showContentThreshold, hideContentThreshold, titleRef]);

  // 处理鼠标滚轮事件，实现更好的swipe效果
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 处理起始状态的向下滚动
      if (scrollProgress < 0.1 && e.deltaY > 0) {
        e.preventDefault();
        window.scrollTo({
          top: scrollThreshold, // 直接滚动到目标位置
          behavior: 'smooth'
        });
      }
      
      // 处理已滚动状态的向上滚动
      if (scrollProgress > 0.6 && e.deltaY < 0) {
        e.preventDefault();
        window.scrollTo({
          top: 0, // 回到顶部
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [scrollProgress, scrollThreshold]);
  
  // 添加触摸事件处理，优化触摸板滚动体验
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      touchEndY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = () => {
      const diff = touchEndY - touchStartY;
      const threshold = 50; // 设置较小的阈值，提高灵敏度
      
      // 向上滑动
      if (diff < -threshold && scrollProgress < 0.3) {
        window.scrollTo({
          top: scrollThreshold,
          behavior: 'smooth'
        });
      }
      
      // 向下滑动
      if (diff > threshold && scrollProgress > 0.3) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollProgress, scrollThreshold]);

  // 计算标题位置的偏移量
  const titleTransform = scrollProgress < 0.05 ? 0 : 220 * easeOutExpo(scrollProgress);
  
  // 计算标题和说明文字的透明度
  const titleOpacity = Math.max(1 - scrollProgress * 1.8, 0);
  const textOpacity = scrollProgress < 0.05 ? 1 : Math.max(1 - scrollProgress * 3, 0);
  
  // 计算Vol和54的位移量，使用线性动画
  const volTransform = scrollProgress * moveDistance;
  const numberTransform = scrollProgress * moveDistance;
  
  // 计算Vol和54的透明度
  const elementsOpacity = Math.min(scrollProgress * 1.2, 1);
  
  // 计算日期文本的透明度
  const dateOpacity = scrollProgress < dateOpacityStart ? 0 :
                     scrollProgress > dateOpacityEnd ? 1 :
                     (scrollProgress - dateOpacityStart) / (dateOpacityEnd - dateOpacityStart);
  
  // 计算日期文本的位置
  const dateCurrentX = dateInitialX + (dateFinalX - dateInitialX) * scrollProgress;

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
    dateCurrentX
  };
} 