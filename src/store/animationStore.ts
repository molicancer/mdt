import { create } from "zustand";
import { useEffect } from "react";
import { useScrollStore } from "./scrollStore";
import { SCROLL_THRESHOLDS } from "@/config/scrollThresholds";
import { useUIStore } from "./uiStore";

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
  
  // 阶段状态
  isInitialStage: boolean; // 新增：是否处于初始阶段（只显示标题、FooterNav和InfoText）
  
  // 更新方法
  updateAnimationValues: (values: Partial<Omit<AnimationState, "updateAnimationValues" | "setVisibility" | "setActiveIssueOffset" | "setStage2State" | "setBrowseModeState" | "setInitialStage" | "isInitialStage">>) => void;
  setVisibility: (isVisible: boolean) => void;  // 新增：设置可见性状态的方法
  setActiveIssueOffset: (offset: number) => void; // 新增：设置激活期数垂直偏移的方法
  setStage2State: () => void; // 新增：直接进入第二阶段
  setBrowseModeState: () => void; // 新增：设置浏览模式状态的方法
  setInitialStage: (value: boolean) => void; // 新增：设置初始阶段状态
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
  elementsOpacity: 0, // 默认隐藏期数元素
  dateOpacity: 0, // 默认隐藏日期
  dateCurrentX: 0,
  activeIssueOffset: 0, // 初始偏移为0
  isInitialStage: true, // 默认处于初始阶段
  
  // 更新动画值的方法
  updateAnimationValues: (values) => set((state) => ({
    ...state,
    ...values
  })),
  
  // 更新可见性的方法
  setVisibility: (isVisible) => set({ isVisible }),
  
  // 更新激活期数垂直偏移的方法
  setActiveIssueOffset: (activeIssueOffset) => set({ activeIssueOffset }),
  
  // 更新初始阶段状态的方法
  setInitialStage: (value) => set({ isInitialStage: value }),
  
  // 更新第二阶段状态的方法
  setStage2State: () => set({
    isVisible: true, // 整体容器应该可见
    titleTransform: -200, // 标题完全移出视野
    titleOpacity: 0, // 标题完全透明
    volTransform: 100, // Vol元素已经移动到位
    numberTransform: 100, // 数字列表已经移动到位
    elementsOpacity: 1, // 元素完全不透明
    dateOpacity: 1, // 日期完全不透明
    dateCurrentX: 50, // 日期X位置
    scrollProgress: SCROLL_THRESHOLDS.FIRST_STAGE_COMPLETE * 5, // 滚动进度超过第一阶段
    isScrolling: false, // 不处于滚动状态
    isInitialStage: false // 不再处于初始阶段
  }),
  
  // 更新浏览模式状态的方法（标记3）
  setBrowseModeState: () => set({
    isVisible: true, // 整体容器应该可见
    titleTransform: -200, // 标题完全移出视野
    titleOpacity: 0, // 标题完全透明
    volTransform: 300, // Vol元素移动到浏览位置
    numberTransform: 300, // 数字列表移动到浏览位置
    elementsOpacity: 1, // 元素完全不透明
    dateOpacity: 0, // 日期在浏览模式下不可见
    dateCurrentX: 50,
    scrollProgress: SCROLL_THRESHOLDS.FIRST_STAGE_COMPLETE * 5,
    isScrolling: false,
    isInitialStage: false // 不再处于初始阶段
  })
}));

// 新增：全局滚动可见性钩子，使用scrollStore
export function useGlobalScrollVisibility(initialVisible = true) {
  const setVisibility = useAnimationStore(state => state.setVisibility);
  const isVisible = useAnimationStore(state => state.isVisible);
  const { scrollDirection } = useScrollStore();
  const scrollLocked = useUIStore(state => state.scrollLocked);
  
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