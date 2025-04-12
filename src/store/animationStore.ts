import { create } from "zustand";
import { useEffect } from "react";

interface AnimationState {
  // 滚动相关状态
  scrollProgress: number;
  isScrolling: boolean;
  isVisible: boolean;  // 新增：滚动可见性状态
  
  // 动画值
  titleTransform: number;
  titleOpacity: number;
  volTransform: number;
  numberTransform: number;
  elementsOpacity: number;
  dateOpacity: number;
  dateCurrentX: number;
  activeIssueOffset: number; // 新增：当前激活期数的垂直偏移量
  
  // 更新方法
  updateAnimationValues: (values: Partial<Omit<AnimationState, "updateAnimationValues" | "setVisibility" | "setActiveIssueOffset">>) => void;
  setVisibility: (isVisible: boolean) => void;  // 新增：设置可见性状态的方法
  setActiveIssueOffset: (offset: number) => void; // 新增：设置激活期数垂直偏移的方法
}

export const useAnimationStore = create<AnimationState>((set) => ({
  // 初始值
  scrollProgress: 0,
  isScrolling: false,
  isVisible: true,  // 默认可见
  titleTransform: 0,
  titleOpacity: 1,
  volTransform: 0,
  numberTransform: 0,
  elementsOpacity: 1,
  dateOpacity: 1,
  dateCurrentX: 0,
  activeIssueOffset: 0, // 初始偏移为0
  
  // 更新动画值的方法
  updateAnimationValues: (values) => set((state) => ({
    ...state,
    ...values
  })),
  
  // 更新可见性的方法
  setVisibility: (isVisible) => set({ isVisible }),
  
  // 更新激活期数垂直偏移的方法
  setActiveIssueOffset: (activeIssueOffset) => set({ activeIssueOffset })
}));

// 新增：全局滚动可见性钩子，封装useScrollVisibility逻辑
export function useGlobalScrollVisibility(threshold = 20) {
  const setVisibility = useAnimationStore(state => state.setVisibility);
  const isVisible = useAnimationStore(state => state.isVisible);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // 根据滚动位置更新可见性
      if (scrollY > threshold && isVisible) {
        setVisibility(false);
      } else if (scrollY <= threshold && !isVisible) {
        setVisibility(true);
      }
    };

    // 添加事件监听
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, isVisible, setVisibility]);
  
  return isVisible;
} 