import { create } from 'zustand';

/**
 * UI状态接口
 * 注意：经过代码检查，移除了未使用的功能
 * 注意：滚动锁定状态已迁移到scrollStore中集中管理
 * 注意：Issue类型已统一迁移到types/issue.ts中
 */
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