/**
 * 统一动画配置文件
 * 
 * 该文件合并了原有的animationConfig.ts和scrollThresholds.ts
 * 包含所有与动画相关的配置、阈值和辅助函数
 */

// 滚动阈值配置
export const SCROLL_THRESHOLDS = {
  // 显示内容区域的阈值（当滚动进度超过这个值时显示内容）
  CONTENT_SHOW: 0.03,
  
  // 隐藏标题文本的阈值（当滚动进度超过这个值时开始隐藏标题）
  TITLE_HIDE: 0.03,
  
  // 计算标题变换的阈值（当滚动进度超过这个值时标题开始移动）
  TITLE_TRANSFORM: 0.03,
  
  // 文本透明度变化的阈值（当滚动进度超过这个值时文本开始变透明）
  TEXT_OPACITY: 0.03,
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

// 动画配置
export const ANIMATION_CONFIG = {
  // 基础动画配置
  base: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
    delay: 0.01,
  },
  
  // 字体动画配置
  font: {
    transitionDuration: 0.35,
    ease: [0.32, 0.72, 0, 1],
  },
  
  // 滚动动画配置
  scroll: {
    smoothFactor: 0.3,
    threshold: 0.1,
    debounceTime: 100,
  },
  
  // 元素淡入淡出配置
  fade: {
    duration: 300,
    fadeInDuration: 500,
  },
  
  // Vol数字元素配置
  volNumber: {
    base: {
      fontSize: 146,
      fontFamily: "font-newyork-large",
      heightRatio: 1.06,
    },
    layout: {
      maxDisplayCount: 10,
      activeBrowseTransform: 300,
    },
    animation: {
      duration: 0.5,
      baseDelay: 0.01,
      incrementDelay: 0.02,
      ease: [0.4, 0, 0.2, 1],
      fontSizeTransition: {
        duration: 0.35,
        ease: [0.32, 0.72, 0, 1]
      }
    },
    defaults: {
      initialVisible: true,
    },
  },
  
  // 内容区域配置
  content: {
    maxWidth: 1200,
    padding: 24,
    gap: 16,
  },
  
  // 导航配置
  nav: {
    height: 60,
    mobileHeight: 50,
    zIndex: 31,
  },
  
  // 动画预设
  presets: {
    // 期数标题动画
    issueHeader: {
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
    },
    
    // 加载动画
    loader: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    },

    // 信息文本动画
    infoText: {
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    },

    // 页脚导航动画
    footerNav: {
      transition: { 
        duration: 0.25,
        ease: "easeInOut"
      }
    },
    
    // 鼠标滚动图标动画
    mouseScrollIcon: {
      transition: {
        duration: 0.75,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // 动画工具函数 - 使用上方定义的共享函数
  utils: {
    easeOutExpo,
    calculateTransform,
    calculateOpacity
  }
} as const;

// 导出类型
export type AnimationConfig = typeof ANIMATION_CONFIG; 