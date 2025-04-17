import { create } from 'zustand';

/**
 * 滚动状态接口
 * 注意：可见性相关状态(isVisible)已移至animationStore中统一管理
 * 注意：滚动锁定状态现在直接集成在scrollStore中，减少store间依赖
 */
interface ScrollState {
  // 滚动状态
  isScrolling: boolean;
  scrollY: number;
  accumulatedDelta: number; // 累积的wheel deltaY值
  scrollDirection: 'up' | 'down' | null;
  lastScrollTime: number;
  
  // 滚动锁定状态 - 从uiStore迁移到这里集中管理所有滚动相关状态
  scrollLocked: boolean;
  setScrollLocked: (locked: boolean) => void;
  
  // 复合动作
  handleWheel: (e: WheelEvent) => void; // 处理wheel事件
}

// 创建滚动状态存储
export const useScrollStore = create<ScrollState>((set, get) => ({
  // 初始状态
  isScrolling: false,
  scrollY: 0,
  accumulatedDelta: 0,
  scrollDirection: null,
  lastScrollTime: 0,
  scrollLocked: false, // 滚动锁定状态默认为false
  
  // 设置滚动锁定状态
  setScrollLocked: (locked: boolean) => set({ scrollLocked: locked }),
  
  // 处理wheel事件
  handleWheel: (e) => {
    // 如果滚动被锁定，不处理wheel事件
    if (get().scrollLocked) return;
    
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
    
    // 设置滚动状态超时
    setTimeout(() => {
      set({ isScrolling: false });
    }, 100);
  }
})); 