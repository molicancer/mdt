import { create } from 'zustand';
import { useUIStore } from './uiStore';

interface ScrollState {
  // 滚动状态
  isVisible: boolean;
  isScrolling: boolean;
  scrollY: number;
  accumulatedDelta: number; // 累积的wheel deltaY值
  scrollDirection: 'up' | 'down' | null;
  lastScrollTime: number;
  
  // 方法
  setVisibility: (isVisible: boolean) => void;
  setScrolling: (isScrolling: boolean) => void;
  setScrollY: (scrollY: number) => void;
  setAccumulatedDelta: (delta: number) => void;
  addToDelta: (amount: number) => void; // 增加累积值
  setScrollDirection: (direction: 'up' | 'down' | null) => void;
  setLastScrollTime: (time: number) => void;
  
  // 复合动作
  handleWheel: (e: WheelEvent) => void; // 处理wheel事件
}

// 帮助器函数，从外部获取滚动锁定状态
// 注意：这里不能用useUIStore的hook，因为在zustand store创建过程中不能使用hooks
// 所以我们创建一个函数在每次调用时获取最新的锁定状态
const isScrollLocked = () => {
  return useUIStore.getState().scrollLocked;
};

// 创建滚动状态存储
export const useScrollStore = create<ScrollState>((set, get) => ({
  // 初始状态
  isVisible: true,
  isScrolling: false,
  scrollY: 0,
  accumulatedDelta: 0,
  scrollDirection: null,
  lastScrollTime: 0,
  
  // 基础方法
  setVisibility: (isVisible) => set({ isVisible }),
  setScrolling: (isScrolling) => set({ isScrolling }),
  setScrollY: (scrollY) => set({ scrollY }),
  setAccumulatedDelta: (accumulatedDelta) => set({ accumulatedDelta }),
  addToDelta: (amount) => set(state => ({ 
    accumulatedDelta: Math.max(0, Math.min(100, state.accumulatedDelta + amount)) 
  })),
  setScrollDirection: (scrollDirection) => set({ scrollDirection }),
  setLastScrollTime: (lastScrollTime) => set({ lastScrollTime }),
  
  // 处理wheel事件
  handleWheel: (e) => {
    // 如果滚动被锁定，不处理wheel事件
    if (isScrollLocked()) return;
    
    const state = get();
    const deltaY = e.deltaY;
    const now = Date.now();
    
    // 设置滚动方向
    const direction = deltaY > 0 ? 'down' : 'up';
    
    // 更新状态
    set({
      isScrolling: true,
      scrollDirection: direction,
      lastScrollTime: now
    });
    
    // 根据方向累积delta值
    if (direction === 'down') {
      set(state => ({ 
        accumulatedDelta: Math.min(100, state.accumulatedDelta + Math.abs(deltaY) * 0.1)
      }));
    } else {
      set(state => ({ 
        accumulatedDelta: Math.max(0, state.accumulatedDelta - Math.abs(deltaY) * 0.1)
      }));
    }
    
    // 根据累积值计算虚拟scrollY
    set(state => ({
      scrollY: state.accumulatedDelta
    }));
    
    // 只有向上滚动时才更新可见性状态
    // 移除向下滚动时隐藏元素的逻辑
    if (direction === 'up' && !state.isVisible) {
      set({ isVisible: true });
    }
    
    // 设置滚动状态超时
    setTimeout(() => {
      set({ isScrolling: false });
    }, 100);
  }
})); 