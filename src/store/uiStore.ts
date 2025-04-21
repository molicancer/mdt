import { create } from 'zustand';

interface UIState {  
  // 当前选中的期数
  activeIssue: number | null;
  // 设置当前选中的期数
  setActiveIssue: (issue: number) => void;
}

// 创建UI状态存储
export const useUIStore = create<UIState>((set) => ({
  // 初始状态
  activeIssue: null, // 初始为 null，表示尚未从 API 获取
  
  setActiveIssue: (issue: number) => set({ 
    activeIssue: issue
  })
})); 