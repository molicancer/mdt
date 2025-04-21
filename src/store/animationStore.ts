import { create } from "zustand";

interface AnimationState {
  isVisible: boolean;  // 统一管理的可见性状态
  isInitialStage: boolean; // 是否处于初始阶段（用于背景等）
  
  // 更新方法
  setVisibility: (isVisible: boolean) => void;  // 设置可见性状态的方法
  setIsInInitialStage: (value: boolean) => void; // 设置初始阶段状态 (Renamed from setInitialStage for clarity)
}

export const useAnimationStore = create<AnimationState>((set) => ({
  // 初始值
  isVisible: true,  // 默认可见
  isInitialStage: true, // 默认处于初始阶段
  
  // 更新可见性的方法
  setVisibility: (isVisible) => set({ isVisible }),
  
  // 更新初始阶段状态的方法
  setIsInInitialStage: (value) => set({ isInitialStage: value }), // Renamed setter
})); 