import { create } from 'zustand';

// 期数数据接口
export interface Issue {
  id: number;        // WordPress文章ID
  number: number;    // 实际显示的期数号（从slug中提取）
  isLatest?: boolean; // 是否是最新一期
  date?: string;      // 发布日期
  title?: string;     // 期数标题
  slug?: string;      // URL slug，用于导航
}

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
  
  // 期数数据
  issues: Issue[];
  // 设置期数数据
  setIssues: (issues: Issue[]) => void;
  
  // 期数位置
  issuePositions: Record<number, number>;
  // 设置期数位置
  setIssuePosition: (issueNumber: number, position: number) => void;
  // 批量设置期数位置
  setIssuePositions: (positions: Record<number, number>) => void;
  
  // 普通模式下的最后位置
  lastNormalPositions: Record<number, number>;
  // 设置最后位置
  setLastNormalPositions: (positions: Record<number, number>) => void;
  
  // 当前活动期数值 (总是有值的版本)
  currentActiveIssue: number;
  // 设置当前活动期数值
  setCurrentActiveIssue: (issue: number) => void;
}

// 创建UI状态存储
export const useUIStore = create<UIState>((set) => ({
  // 初始状态
  browseMode: false,
  activeIssue: null, // 初始为 null，表示尚未从 API 获取
  isIssueInitialized: false,
  issues: [],
  issuePositions: {},
  lastNormalPositions: {},
  currentActiveIssue: 54, // 默认当前期数
  
  // 状态更新方法
  toggleBrowseMode: () => set((state) => ({ 
    browseMode: !state.browseMode 
  })),
  
  setBrowseMode: (value: boolean) => set({ 
    browseMode: value 
  }),
  
  setActiveIssue: (issue: number) => set({ 
    activeIssue: issue,
    currentActiveIssue: issue, // 同步更新currentActiveIssue
    isIssueInitialized: true
  }),
  
  markIssueInitialized: () => set({
    isIssueInitialized: true
  }),
  
  // 期数数据方法
  setIssues: (issues: Issue[]) => set({ issues }),
  
  // 期数位置方法
  setIssuePosition: (issueNumber: number, position: number) => set((state) => ({
    issuePositions: { 
      ...state.issuePositions, 
      [issueNumber]: position 
    }
  })),
  
  setIssuePositions: (positions: Record<number, number>) => set((state) => ({
    issuePositions: { 
      ...state.issuePositions, 
      ...positions 
    }
  })),
  
  // 最后位置方法
  setLastNormalPositions: (positions: Record<number, number>) => set({ 
    lastNormalPositions: positions 
  }),
  
  // 当前活动期数方法
  setCurrentActiveIssue: (issue: number) => set({ 
    currentActiveIssue: issue 
  })
})); 