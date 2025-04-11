import { useEffect, useRef, useState } from "react";

// 缓动函数
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

interface ScrollAnimationConfig {
  scrollThreshold?: number; // 滚动阈值
  showContentThreshold?: number; // 显示内容的阈值
  hideContentThreshold?: number; // 隐藏内容的阈值
  smoothUpdateFactor?: number; // 平滑更新因子
  extendedScrollThreshold?: number; // 扩展滚动阈值，用于支持更长的滚动范围
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
  extendedScrollProgress: number; // 扩展滚动进度，支持更大范围（0-1+）
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
    extendedScrollThreshold = 1000,
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
        if (progress > 0.1 && progress < 0.3) {
          // 自动滚动到第一阶段结束位置
          window.scrollTo({
            top: scrollThreshold * 0.2,
            behavior: 'smooth'
          });
        } else if (progress >= 0.3 && progress < 0.5) {
          // 停留在第二阶段
          window.scrollTo({
            top: scrollThreshold * 0.4,
            behavior: 'smooth'
          });
        } else if (progress >= 0.5 && progress < 0.8) {
          // 自动滚动到第三阶段
          window.scrollTo({
            top: scrollThreshold * 0.6,
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
      // 如果处于第一阶段和第二阶段之间的过渡区域
      if (scrollProgress > 0.15 && scrollProgress < 0.25) {
        // 减缓滚动速度，创造阻尼感
        e.preventDefault();
        
        // 向下滚动，进入第二阶段
        if (e.deltaY > 0 && e.deltaY > 30) {
          window.scrollTo({
            top: scrollThreshold * 0.4, // 直接滚动到第二阶段中心
            behavior: 'smooth'
          });
        } 
        // 向上滚动，回到第一阶段
        else if (e.deltaY < 0 && e.deltaY < -30) {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
      
      // 如果处于第二阶段和第三阶段之间的过渡区域
      else if (scrollProgress > 0.45 && scrollProgress < 0.55) {
        e.preventDefault();
        
        // 向下滚动，进入第三阶段
        if (e.deltaY > 0 && e.deltaY > 30) {
          window.scrollTo({
            top: scrollThreshold * 0.6, // 仅滚动到第三阶段的开始
            behavior: 'smooth'
          });
        } 
        // 向上滚动，回到第二阶段
        else if (e.deltaY < 0 && e.deltaY < -30) {
          window.scrollTo({
            top: scrollThreshold * 0.4, // 回到第二阶段中心
            behavior: 'smooth'
          });
        }
      }
      
      // 处理起始状态的向下滚动
      else if (scrollProgress < 0.1 && e.deltaY > 0) {
        e.preventDefault();
        window.scrollTo({
          top: scrollThreshold * 0.4, // 直接滚动到第二阶段
          behavior: 'smooth'
        });
      }
      
      // 处理滚动到第三阶段后的行为，阻止继续滚动
      else if (scrollProgress > 0.6 && e.deltaY > 0) {
        // 阻止继续向下滚动
        e.preventDefault();
      }
      
      // 处理已滚动状态的向上滚动
      else if (scrollProgress > 0.6 && e.deltaY < 0) {
        e.preventDefault();
        window.scrollTo({
          top: scrollThreshold * 0.4, // 回到第二阶段
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
      const threshold = 30; // 设置较小的阈值，提高灵敏度
      
      // 根据当前滚动位置和滑动方向决定目标位置
      
      // 第一阶段
      if (scrollProgress < 0.15) {
        // 向上滑动(第一阶段 -> 第二阶段)
        if (diff < -threshold) {
          window.scrollTo({
            top: scrollThreshold * 0.4, // 滚动到第二阶段中心
            behavior: 'smooth'
          });
        }
      } 
      // 第一和第二阶段之间
      else if (scrollProgress >= 0.15 && scrollProgress < 0.25) {
        if (diff < -threshold) {
          // 向上滑动(进入第二阶段)
          window.scrollTo({
            top: scrollThreshold * 0.4,
            behavior: 'smooth'
          });
        } else if (diff > threshold) {
          // 向下滑动(回到第一阶段)
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
      // 第二阶段
      else if (scrollProgress >= 0.25 && scrollProgress < 0.45) {
        if (diff < -threshold) {
          // 向上滑动(第二阶段 -> 第三阶段)
          window.scrollTo({
            top: scrollThreshold * 0.6,
            behavior: 'smooth'
          });
        } else if (diff > threshold) {
          // 向下滑动(第二阶段 -> 第一阶段)
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
      // 第二和第三阶段之间
      else if (scrollProgress >= 0.45 && scrollProgress < 0.55) {
        if (diff < -threshold) {
          // 向上滑动(进入第三阶段)
          window.scrollTo({
            top: scrollThreshold * 0.6,
            behavior: 'smooth'
          });
        } else if (diff > threshold) {
          // 向下滑动(回到第二阶段)
          window.scrollTo({
            top: scrollThreshold * 0.4,
            behavior: 'smooth'
          });
        }
      }
      // 第三阶段
      else if (scrollProgress >= 0.55) {
        // 向下滑动(第三阶段 -> 第二阶段)
        if (diff > threshold) {
          window.scrollTo({
            top: scrollThreshold * 0.4, // 滚动到第二阶段
            behavior: 'smooth'
          });
        }
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
  const titleTransform = scrollProgress < 0.05 ? 0 : 250 * easeOutExpo(scrollProgress);
  
  // 计算标题和说明文字的透明度
  const titleOpacity = Math.max(1 - scrollProgress * 3, 0);
  const textOpacity = scrollProgress < 0.05 ? 1 : Math.max(1 - scrollProgress * 3, 0);
  
  // 计算Vol和54的位移量，使用非线性动画，在第一阶段迅速完成移动
  const progressRatio = Math.min(scrollProgress / 0.2, 1); // 0.2的进度内完成全部移动
  const volTransform = moveDistance * progressRatio;
  const numberTransform = moveDistance * progressRatio;
  
  // 计算Vol和54的透明度，与移动同步
  const elementsOpacity = Math.min(progressRatio * 1.2, 1);
  
  // 计算日期文本的透明度，在第一阶段与Vol和54同步显示
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