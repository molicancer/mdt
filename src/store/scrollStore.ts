import { create } from 'zustand';

interface ScrollState {
  // 滚动锁定状态 - 从uiStore迁移到这里集中管理所有滚动相关状态
  scrollLocked: boolean;
  setScrollLocked: (locked: boolean) => void;
}

// 创建滚动状态存储
export const useScrollStore = create<ScrollState>((set, get) => ({
  // 初始状态
  scrollLocked: false, // 滚动锁定状态默认为false
  
  // 设置滚动锁定状态
  setScrollLocked: (locked: boolean) => set({ scrollLocked: locked }),
})); 