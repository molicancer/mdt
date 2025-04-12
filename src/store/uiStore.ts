import { create } from 'zustand';

// 定义UI状态接口
interface UIState {
  // 浏览模式状态
  browseMode: boolean;
  // 切换浏览模式
  toggleBrowseMode: () => void;
  // 设置浏览模式
  setBrowseMode: (value: boolean) => void;
  
  // 当前选中的期数
  activeIssue: number | null;
  // 设置当前选中的期数
  setActiveIssue: (issue: number) => void;
  // 是否已初始化期数
  isIssueInitialized: boolean;
  // 标记期数已初始化
  markIssueInitialized: () => void;
}

// 创建UI状态存储
export const useUIStore = create<UIState>((set) => ({
  // 初始状态
  browseMode: false,
  activeIssue: null, // 初始为 null，表示尚未从 API 获取
  isIssueInitialized: false,
  
  // 状态更新方法
  toggleBrowseMode: () => set((state) => ({ 
    browseMode: !state.browseMode 
  })),
  
  setBrowseMode: (value: boolean) => set({ 
    browseMode: value 
  }),
  
  setActiveIssue: (issue: number) => set({ 
    activeIssue: issue,
    isIssueInitialized: true
  }),
  
  markIssueInitialized: () => set({
    isIssueInitialized: true
  })
})); 