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
  // 使用原有的滚动动画钩子
  const animationValues = useScrollAnimation(elementRef, options);
  
  // 将动画值同步到Zustand存储
  useEffect(() => {
    // 更新动画存储
    useAnimationStore.getState().updateAnimationValues(animationValues);
  }, [animationValues]);
  
  // 仍然返回动画值，以便直接使用
  return animationValues;
} 