/**
 * 滚动进度阈值配置
 * 
 * 这个文件定义了不同UI元素显示和隐藏的滚动进度阈值。
 * 所有组件都应该使用这些共享值以确保动画行为一致。
 */

export const SCROLL_THRESHOLDS = {
  // 显示内容区域的阈值（当滚动进度超过这个值时显示内容）
  CONTENT_SHOW: 0.03,
  
  // 隐藏标题文本的阈值（当滚动进度超过这个值时开始隐藏标题）
  TITLE_HIDE: 0.03,
  
  
  // 计算标题变换的阈值（当滚动进度超过这个值时标题开始移动）
  TITLE_TRANSFORM: 0.03,
  
  // 文本透明度变化的阈值（当滚动进度超过这个值时文本开始变透明）
  TEXT_OPACITY: 0.03,
  
  // 滚动进度完成到第一阶段的比例（在这个进度内完成Vol和期数元素的移动）
  FIRST_STAGE_COMPLETE: 0.03,
} as const;

// 缓动函数
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * 根据滚动进度和阈值计算变换值
 */
export function calculateTransform(
  scrollProgress: number, 
  threshold: number, 
  maxTransform: number,
  easeFn = easeOutExpo
): number {
  return scrollProgress < threshold ? 0 : maxTransform * easeFn(scrollProgress);
}

/**
 * 根据滚动进度和阈值计算透明度
 */
export function calculateOpacity(
  scrollProgress: number, 
  threshold: number, 
  fadeSpeed = 3
): number {
  return scrollProgress < threshold ? 1 : Math.max(1 - scrollProgress * fadeSpeed, 0);
} 