import { useState, useEffect } from "react";

interface UseScrollVisibilityOptions {
  threshold?: number;
  initialVisible?: boolean;
}

export function useScrollVisibility({
  threshold = 20,
  initialVisible = true
}: UseScrollVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(initialVisible);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // 根据滚动位置更新可见性
      if (scrollY > threshold && isVisible) {
        setIsVisible(false);
      } else if (scrollY <= threshold && !isVisible) {
        setIsVisible(true);
      }
    };

    // 添加事件监听
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, isVisible]);

  return isVisible;
} 