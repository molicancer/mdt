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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 更新滚动位置
      const newScrollY = Math.max(0, scrollY + e.deltaY);
      setScrollY(newScrollY);

      // 根据滚动位置更新可见性
      if (newScrollY > threshold && isVisible) {
        setIsVisible(false);
      } else if (newScrollY <= threshold && !isVisible) {
        setIsVisible(true);
      }
    };

    // 添加事件监听
    window.addEventListener('wheel', handleWheel, { passive: true });

    // 清理函数
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [threshold, isVisible, scrollY]);

  return isVisible;
} 