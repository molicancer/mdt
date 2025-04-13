import { useEffect } from 'react';
import { useAnimationStore } from '@/store/animationStore';
import { useScrollAnimation } from './use-scroll-animation';

/**
 * 将useScrollAnimation返回的动画值同步到Zustand状态存储
 */
export function useUpdateAnimationStore(
  elementRef: React.RefObject<HTMLDivElement | null>, 
  options = {}
) {
  // 从状态库获取初始阶段状态
  const isInitialStage = useAnimationStore(state => state.isInitialStage);
  
  // 使用原有的滚动动画钩子
  const animationValues = useScrollAnimation(elementRef, options);
  
  // 将动画值同步到Zustand存储，只在非初始阶段或滚动开始时
  useEffect(() => {
    // 如果处于初始阶段并且没有开始滚动，则不更新动画状态
    if (isInitialStage && !animationValues.isScrolling) {
      return;
    }
    
    // 检测到滚动时，自动退出初始阶段
    if (isInitialStage && animationValues.isScrolling && animationValues.scrollProgress > 0) {
      useAnimationStore.getState().setInitialStage(false);
    }
    
    // 更新动画存储
    useAnimationStore.getState().updateAnimationValues(animationValues);
  }, [animationValues, isInitialStage]);
  
  // 仍然返回动画值，以便直接使用
  return animationValues;
} 