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
  
  // 动画预设
  presets: {
    // 标题动画
    title: {
      initial: { y: 0 },
      animate: { y: "-100vh", opacity: 0 },
      transition: { type: "linear", duration: 1 }
    },
    
    // 内容卡片动画
    contentCard: {
      initial: { height: 300 },
      hover: { height: 450 },
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
    },
    
    // 期数列表动画
    issueList: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    },
    
    // 加载动画
    loader: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    },

    // 数字元素动画
    numberElement: {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: 0.01,
          ease: [0.4, 0, 0.2, 1]
        }
      },
      exit: {
        opacity: 0,
        transition: {
          duration: 0.25
        }
      },
      hover: {
        scale: 1.05,
        opacity: 0.7,
        transition: { 
          duration: 0.3,
          scale: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1.0]
          },
          opacity: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1.0]
          }
        }
      }
    },

    // 内容过渡动画
    contentTransition: {
      fadeOut: {
        opacity: 0,
        transition: { duration: 0.3 }
      },
      fadeIn: {
        opacity: 1,
        transition: { duration: 0.5 }
      }
    },

    // 滚动动画
    scroll: {
      smooth: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      },
      transform: {
        duration: 0.7,
        ease: [0.32, 0.72, 0, 1]
      }
    },

    // 提示文本动画
    hintText: {
      transition: { 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
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

    // 浏览按钮动画
    browseButton: {
      transition: { 
        duration: 0.7, 
        ease: [0.4, 0, 0.2, 1]
      }
    },

    // 期数元素动画
    issueElement: {
      transition: { 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
  },
  
  // 动画工具函数
  utils: {
    // 缓动函数
    easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    
    // 计算变换值
    calculateTransform: (scrollProgress: number, threshold: number, maxTransform: number) => {
      return scrollProgress < threshold ? 0 : maxTransform * ANIMATION_CONFIG.utils.easeOutExpo(scrollProgress);
    }
  }
} as const;

// 导出类型
export type AnimationConfig = typeof ANIMATION_CONFIG; 