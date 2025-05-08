import { useEffect, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// 确保插件注册
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); // 重新注册 ScrollToPlugin

interface AnimationRefs {
  issueHeaderRef: RefObject<HTMLDivElement | null>;
  contentContainerRef: RefObject<HTMLDivElement | null>;
  volRef: RefObject<HTMLDivElement | null>;
  coverRef: RefObject<HTMLDivElement | null>;
  numberRef: RefObject<HTMLDivElement | null>;
  titleTextRef: RefObject<HTMLDivElement | null>;
  subtitleRef: RefObject<HTMLParagraphElement | null>;
  heroRef: RefObject<HTMLDivElement | null>;
  articlesContainerRef: RefObject<HTMLDivElement | null>;
  fixedBgRef: RefObject<HTMLDivElement | null>;
  backgroundWrapperRef: RefObject<HTMLDivElement | null>;
  blurMasksRef: RefObject<HTMLDivElement | null>;
}

interface UseScrollSnapAnimationProps {
  refs: AnimationRefs;
  isContentLoaded: boolean;
  setIsInInitialStage: (isInitial: boolean) => void;
}

/**
 * 自定义Hook，用于管理滚动和动画逻辑 (恢复了GSAP吸附滚动)
 */
export const useScrollSnapAnimation = ({ 
  refs, 
  isContentLoaded,
  setIsInInitialStage 
}: UseScrollSnapAnimationProps) => {
  
  useEffect(() => {
    // 如果内容未加载或任何引用缺失，则不初始化动画
    if (!isContentLoaded || 
        !refs.issueHeaderRef.current || !refs.contentContainerRef.current || 
        !refs.volRef.current || !refs.coverRef.current || !refs.numberRef.current || 
        !refs.heroRef.current || !refs.backgroundWrapperRef.current || 
        !refs.titleTextRef.current || !refs.articlesContainerRef.current ||
        !refs.fixedBgRef.current || !refs.subtitleRef.current ||
        !refs.blurMasksRef.current) {
      return;
    }

    // 获取 DOM 元素
    const headerEl = refs.issueHeaderRef.current!;
    const articlesEl = refs.articlesContainerRef.current!;
    
    // 滚动位置常量
    const scrollTopY = 0; 
    // 目标滚动位置：让封面图片垂直居中显示
    const scrollContentY = headerEl.offsetTop - (window.innerHeight - headerEl.offsetHeight) / 2;
    // 目标滚动位置：文章区域
    const scrollArticlesY = articlesEl.offsetTop - 120;

    // 定义滚动处理变量
    let isSnapping = false; // 标记是否正在执行吸附动画
    let canScroll = true;   // 标记是否允许滚动（用于截流）
    let lastScrollTime = Date.now(); // 上次滚动时间戳，初始化为当前时间
    let touchStartY = 0;    // 触摸开始Y坐标
    let scrollDirection = 0; // 滚动方向：1=向下, -1=向上
    let wheelDeltaAccumulator = 0; // 累积的滚轮增量
    const WHEEL_THRESHOLD = 15; // 触摸板触发滚动的阈值
    
    // 重置累积器的定时器ID
    let wheelAccumulatorResetTimer: number | null = null;

    // 统一处理页面滚动逻辑
    function handlePageScroll(deltaY: number) {
      // 严格截流：如果不允许滚动或正在吸附中，忽略事件
      if (!canScroll || isSnapping) return;
      
      // 检查是否距离上次滚动太短时间
      const now = Date.now();
      if (now - lastScrollTime < 700) return; // 如果距离上次滚动不到700ms，忽略此次滚动
      
      // 计算滚动方向
      scrollDirection = deltaY > 0 ? 1 : -1;
      
      const currentScroll = window.scrollY;
      
      // 如果在文章区域，直接放行，不执行吸附
      if (currentScroll > scrollArticlesY * 0.8) {
        return;
      }
      
      let targetScroll: number;
      
      // 根据当前位置和方向确定目标位置
      if (scrollDirection > 0) { // 向下滚动
        if (currentScroll < scrollContentY / 2) {
          // 从顶部滚动到内容区域
          targetScroll = scrollContentY;
          setIsInInitialStage(false);
        } else if (currentScroll < (scrollContentY + scrollArticlesY) / 2) {
          // 从内容区域滚动到文章区域
          targetScroll = scrollArticlesY;
          setIsInInitialStage(false);
        } else {
          // 已经在文章区域，允许自由滚动
          return;
        }
      } else { // 向上滚动
        if (currentScroll > (scrollContentY + scrollArticlesY) / 2) {
          // 从文章区域向上滚动到内容区域
          targetScroll = scrollContentY;
          setIsInInitialStage(false);
        } else if (currentScroll > scrollContentY / 2) {
          // 从内容区域向上滚动到顶部
          targetScroll = scrollTopY;
          setIsInInitialStage(true);
        } else {
          // 已经在顶部区域，无需再滚动
          return;
        }
      }
      
      // 更新时间戳
      lastScrollTime = Date.now();
      
      // 设置锁定状态并执行滚动动画
      canScroll = false;
      isSnapping = true;
      
      gsap.to(window, {
        scrollTo: { y: targetScroll, autoKill: true },
        duration: 0.8,
        ease: "power2.out", // 优化滚动感觉更流畅
        overwrite: true,
        onComplete: () => {
          isSnapping = false;
          // 延迟一段时间后再允许滚动，减少延迟时间提高响应性
          setTimeout(() => {
            canScroll = true;
          }, 400);
        },
        onInterrupt: () => {
          isSnapping = false;
          // 即使被中断也要延迟恢复滚动
          setTimeout(() => {
            canScroll = true;
          }, 400);
        }
      });
    }

    // 定义事件处理函数
    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      const currentScroll = window.scrollY;
      
      // 如果已经滚动到文章区域，不阻止默认滚动
      if (currentScroll > scrollArticlesY * 0.8) {
        return;
      }
      
      // 在其他区域阻止默认滚动行为，使我们能够完全控制滚动
      e.preventDefault();
    }

    function handleTouchEnd(e: TouchEvent) {
      const currentScroll = window.scrollY;
      
      // 文章区域允许自由滚动
      if (currentScroll > scrollArticlesY * 0.8) {
        return;
      }
      
      if (!canScroll || isSnapping) return;
      
      const touchEndY = e.changedTouches[0]?.clientY || 0;
      const touchDelta = touchEndY - touchStartY;
      
      // 只有明显的滑动才会触发翻页
      if (Math.abs(touchDelta) > 50) {
        handlePageScroll(touchDelta < 0 ? 100 : -100);
      }
    }

    function handleWheel(e: WheelEvent) {
      const currentScroll = window.scrollY;
      
      // 如果已经滚动到文章区域，完全允许自由滚动
      if (currentScroll > scrollArticlesY * 0.8) {
        // 不阻止默认行为，允许浏览器原生滚动
        return;
      }
      
      // 对于非文章区域，阻止默认滚动行为
      e.preventDefault();
      
      // 如果正在进行动画或不允许滚动，则直接返回
      if (!canScroll || isSnapping) return;
      
      // 判断设备类型（触摸板还是鼠标滚轮）
      const isTrackpad = Math.abs(e.deltaY) < 20;
      
      if (isTrackpad) {
        // 对于触摸板，累积滚动量直到达到阈值
        wheelDeltaAccumulator += e.deltaY;
        
        // 设置重置累积器的定时器
        if (wheelAccumulatorResetTimer !== null) {
          window.clearTimeout(wheelAccumulatorResetTimer);
        }
        
        // 如果用户停止滚动500ms，重置累积器
        wheelAccumulatorResetTimer = window.setTimeout(() => {
          wheelDeltaAccumulator = 0;
        }, 500);
        
        // 检查是否超过阈值
        if (Math.abs(wheelDeltaAccumulator) > WHEEL_THRESHOLD) {
          handlePageScroll(wheelDeltaAccumulator);
          wheelDeltaAccumulator = 0; // 重置累积器
        }
      } else {
        // 对于鼠标滚轮，直接处理
        handlePageScroll(e.deltaY);
      }
    }
    
    // 添加事件监听，指定选项对象
    const wheelOptions: AddEventListenerOptions = { passive: false }; // passive: false 允许我们调用 preventDefault()
    const touchOptions: AddEventListenerOptions = { passive: false }; // 修改为passive: false以允许preventDefault
    
    document.addEventListener('wheel', handleWheel, wheelOptions);
    document.addEventListener('touchstart', handleTouchStart, touchOptions);
    document.addEventListener('touchmove', handleTouchMove, touchOptions);
    document.addEventListener('touchend', handleTouchEnd, touchOptions);

    // 使用GSAP上下文确保所有动画正确清理
    const ctx = gsap.context(() => {
      // 获取所有DOM元素
      const headerEl = refs.issueHeaderRef.current!;
      const containerEl = refs.contentContainerRef.current!;
      const coverEl = refs.coverRef.current!;
      const volEl = refs.volRef.current!;
      const numEl = refs.numberRef.current!;
      const titleEl = refs.titleTextRef.current!;
      const subtitleEl = refs.subtitleRef.current!;
      const heroEl = refs.heroRef.current!;
      const articlesEl = refs.articlesContainerRef.current!;
      const fixedBgEl = refs.fixedBgRef.current!;
      const backgroundWrapperEl = refs.backgroundWrapperRef.current!;
      const blurMasksEl = refs.blurMasksRef.current!;

      // 设置初始状态
      gsap.set(volEl, { x: -150 });
      gsap.set(numEl, { x: 150 });
      gsap.set(articlesEl, { opacity: 0 });
      gsap.set(fixedBgEl, { opacity: 0 });

      // 清除已存在的ScrollTrigger
      ScrollTrigger.getAll().forEach(t => t.kill());

      // 1. 期刊封面和文字入场动画
      gsap.timeline({
        scrollTrigger: {
          trigger: containerEl,
          start: "top 100%",
          end: "top 50%",
          scrub: true,
        }
      })
      .to(coverEl, { opacity: 1 }, 0)
      .to([volEl, numEl], { opacity: 1, x: 0 }, 0.5);

      // 2. Header 缩放和固定效果
      gsap.timeline({
        scrollTrigger: {
          trigger: headerEl,
          start: "center 50%",
          end: "center 40",
          scrub: true,
        }
      }).to(headerEl, { yPercent: 0, scale: 0.3 }, 0);

      // 3. 标题文本字体大小和副标题动画
      gsap.timeline({
        scrollTrigger: {
          trigger: titleEl,
          start: "top 50%",
          end: "top 100",
          scrub: 0.5,
        }
      })
      .to(titleEl, { opacity: 0 }, 0)
      .to(subtitleEl, { opacity: 0 }, 0)
      .to(blurMasksEl, { opacity: 0 }, 0);

      // 4. 文章容器淡入动画
      gsap.timeline({
        scrollTrigger: {
          trigger: articlesEl,
          start: "top 50%",
          end: "top 25%",
          scrub: 0.5,
          // 添加标记，使ScrollTrigger不影响正常滚动
          preventOverlaps: true,
          fastScrollEnd: true,
        }
      })
      .to(articlesEl, { opacity: 1 }, 0)
      .to(fixedBgEl, { opacity: 1 }, 0.2);

      // 5. 背景层淡出动画
      gsap.timeline({
        scrollTrigger: {
          trigger: heroEl,
          start: "bottom bottom",
          end: "bottom center",
          scrub: 0.5,
          // 添加标记，使ScrollTrigger不影响正常滚动
          preventOverlaps: true,
          fastScrollEnd: true,
        }
      }).to(backgroundWrapperEl, { opacity: 0 }, 0);

      // 6. 模拟 CSS Scroll Snap 的吸附滚动逻辑
      // 刷新所有ScrollTrigger (虽然上面没用scrub，但其他动画可能需要)
      ScrollTrigger.refresh();
    });

    // 清理函数
    return () => {
      // 清理事件监听器，确保使用相同的选项对象
      document.removeEventListener('wheel', handleWheel, wheelOptions);
      document.removeEventListener('touchstart', handleTouchStart, touchOptions);
      document.removeEventListener('touchmove', handleTouchMove, touchOptions);
      document.removeEventListener('touchend', handleTouchEnd, touchOptions);
      
      // 清理GSAP动画及上下文
      ctx.revert(); // 这会清理所有在ctx内创建的GSAP动画
      
      // 杀死所有window滚动动画
      gsap.killTweensOf(window);
      
      // 清理ScrollTrigger实例
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      // 清理定时器
      if (wheelAccumulatorResetTimer !== null) {
        window.clearTimeout(wheelAccumulatorResetTimer);
      }
    };
  }, [
    isContentLoaded, 
    refs.issueHeaderRef, 
    refs.contentContainerRef, 
    refs.volRef, 
    refs.coverRef, 
    refs.numberRef, 
    refs.heroRef, 
    refs.backgroundWrapperRef, 
    refs.titleTextRef, 
    refs.articlesContainerRef,
    refs.fixedBgRef,
    refs.subtitleRef,
    refs.blurMasksRef,
    setIsInInitialStage
  ]);
};
