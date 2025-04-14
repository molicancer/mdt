import { useEffect } from 'react';
import { useAnimationStore } from '@/store/animationStore';
import { useScrollAnimation } from './use-scroll-animation';

interface AnimationOptions {
  smoothUpdateFactor?: number;
}

/**
 * 将useScrollAnimation返回的动画值同步到Zustand状态存储
 */
export function useUpdateAnimationStore(
  elementRef: React.RefObject<HTMLDivElement | null>, 
  options: AnimationOptions = {}
) {
  // 从状态库获取初始阶段状态
  const isInitialStage = useAnimationStore(state => state.isInitialStage);
  
  // 使用原有的滚动动画钩子
  const animationValues = useScrollAnimation(elementRef, {
    smoothUpdateFactor: options.smoothUpdateFactor
  });
  
  // 将动画值同步到Zustand存储，只在非初始阶段更新
  useEffect(() => {
    // 如果处于初始阶段，不更新任何动画状态
    if (isInitialStage) {
      return;
    }
    
    // 只在非初始阶段更新动画状态
    useAnimationStore.getState().updateAnimationValues(animationValues);
  }, [animationValues, isInitialStage]);
  
  // 仍然返回动画值，以便直接使用
  return isInitialStage ? 
    // 在初始阶段返回固定值
    {
      scrollY: 0,
      scrollProgress: 0,
      contentVisible: false,
      isScrolling: false,
      titleTransform: 0,
      titleOpacity: 1,
      textOpacity: 0,
      volTransform: 0,
      numberTransform: 0,
      elementsOpacity: 0,
      dateOpacity: 0,
      dateCurrentX: 0,
      extendedScrollProgress: 0
    } : 
    // 否则返回实际动画值
    animationValues;
} 