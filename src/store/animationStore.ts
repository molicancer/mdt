import { create } from "zustand";
import { useEffect } from "react";
import { useScrollStore } from "./scrollStore";

/**
 * 动画状态接口
 * 注意：所有可见性相关状态(isVisible)已集中在此store管理
 * 注意：isScrolling状态由scrollStore统一管理，这里不再重复
 */
interface AnimationState {
  // 滚动相关状态
  scrollProgress: number;
  isVisible: boolean;  // 统一管理的可见性状态
  
  // 动画值
  titleTransform: number;
  titleOpacity: number;
  
  // 阶段状态
  isInitialStage: boolean; // 是否处于初始阶段（只显示标题、FooterNav和InfoText）
  isArticleReading: boolean; // 是否处于文章阅读状态（Vol、图标、期数固定在顶部）
  
  // 更新方法
  updateAnimationValues: (values: Partial<Omit<AnimationState, "updateAnimationValues" | "setVisibility" | "setInitialStage" | "isInitialStage" | "isArticleReading" | "setArticleReading">>) => void;
  setVisibility: (isVisible: boolean) => void;  // 设置可见性状态的方法
  setInitialStage: (value: boolean) => void; // 设置初始阶段状态
  setArticleReading: (value: boolean) => void; // 设置文章阅读状态
}

export const useAnimationStore = create<AnimationState>((set) => ({
  // 初始值
  scrollProgress: 0,
  isVisible: true,  // 默认可见
  titleTransform: 0,
  titleOpacity: 1,
  isInitialStage: true, // 默认处于初始阶段
  isArticleReading: false, // 默认不处于文章阅读状态
  
  // 更新动画值的方法
  updateAnimationValues: (values) => set((state) => ({
    ...state,
    ...values
  })),
  
  // 更新可见性的方法
  setVisibility: (isVisible) => set({ isVisible }),
  
  // 更新初始阶段状态的方法
  setInitialStage: (value) => set({ isInitialStage: value }),
  
  // 更新文章阅读状态的方法
  setArticleReading: (value) => set({ isArticleReading: value })
}));

/**
 * 全局滚动可见性钩子，根据滚动方向自动控制元素可见性
 */
export function useGlobalScrollVisibility(initialVisible = true) {
  const setVisibility = useAnimationStore(state => state.setVisibility);
  const isVisible = useAnimationStore(state => state.isVisible);
  const { scrollDirection, scrollLocked } = useScrollStore();
  
  // 监听scrollStore中的滚动方向变化
  useEffect(() => {
    // 如果滚动被锁定，不更新可见性
    if (scrollLocked) return;
    
    // 根据滚动方向更新可见性
    if (scrollDirection === 'down' && isVisible) {
      setVisibility(false);
    } else if (scrollDirection === 'up' && !isVisible) {
      setVisibility(true);
    }
  }, [scrollDirection, isVisible, setVisibility, scrollLocked]);
  
  // 初始化可见性状态
  useEffect(() => {
    setVisibility(initialVisible);
  }, [initialVisible, setVisibility]);
  
  return isVisible;
} 