// 滚动阈值配置
export const SCROLL_THRESHOLDS = {
  FIRST_STAGE_START: 0,
  FIRST_STAGE_COMPLETE: 100,
  SECOND_STAGE_START: 101,
  SECOND_STAGE_COMPLETE: 200,
  THIRD_STAGE_START: 201,
  THIRD_STAGE_COMPLETE: 300,
} as const;

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
} as const;

// UI配置
export const UI_CONFIG = {
  // Vol数字元素配置
  volNumber: {
    base: {
      fontSize: 150,
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
} as const;

// API配置
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://172.16.69.13:8080',
  endpoints: {
    posts: '/wp-json/wp/v2/posts',
    media: '/wp-json/wp/v2/media',
  },
  defaultParams: {
    per_page: 100,
    _embed: true,
  },
} as const;

// 调试配置
export const DEBUG_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  logLevel: 'info',
  showDebugPanel: process.env.NODE_ENV === 'development',
} as const;

// 导出所有配置
export const APP_CONFIG = {
  scroll: SCROLL_THRESHOLDS,
  animation: ANIMATION_CONFIG,
  ui: UI_CONFIG,
  api: API_CONFIG,
  debug: DEBUG_CONFIG,
} as const;

// 导出类型
export type ScrollThresholds = typeof SCROLL_THRESHOLDS;
export type AnimationConfig = typeof ANIMATION_CONFIG;
export type UIConfig = typeof UI_CONFIG;
export type APIConfig = typeof API_CONFIG;
export type DebugConfig = typeof DEBUG_CONFIG;
export type AppConfig = typeof APP_CONFIG; 