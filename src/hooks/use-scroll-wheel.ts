import { useEffect } from 'react';
import { useScrollStore } from '@/store/scrollStore';

interface ScrollWheelConfig {
  initialVisible?: boolean;
}

/**
 * 使用wheel事件检测页面滚动，并更新动画状态
 */
export function useScrollWheel({
  initialVisible = true,
}: ScrollWheelConfig = {}) {
  // 从状态库获取可见性状态和更新方法
  const isVisible = useScrollStore(state => state.isVisible);
  const handleWheel = useScrollStore(state => state.handleWheel);
  const setVisibility = useScrollStore(state => state.setVisibility);
  
  // 监听wheel事件
  useEffect(() => {
    const wheelEventHandler = (e: WheelEvent) => {
      // 使用scrollStore的handleWheel处理wheel事件
      handleWheel(e);
    };
    
    // 初始化可见性状态
    setVisibility(initialVisible);
    
    // 添加事件监听
    window.addEventListener('wheel', wheelEventHandler, { passive: true });
    
    // 清理函数
    return () => {
      window.removeEventListener('wheel', wheelEventHandler);
    };
  }, [handleWheel, setVisibility, initialVisible]);
  
  return isVisible;
} 