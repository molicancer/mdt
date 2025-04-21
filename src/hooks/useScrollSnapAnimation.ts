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
        !refs.fixedBgRef.current || !refs.subtitleRef.current) {
      return;
    }

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
      .to(titleEl, { fontSize: "40px" }, 0)
      .to(subtitleEl, { opacity: 0 }, 0);

      // 4. 文章容器淡入动画
      gsap.timeline({
        scrollTrigger: {
          trigger: articlesEl,
          start: "top 50%",
          end: "top 25%",
          scrub: 0.5,
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
          scrub: 0.5
        }
      }).to(backgroundWrapperEl, { opacity: 0 }, 0);

      // 6. 模拟 CSS Scroll Snap 的吸附滚动逻辑
      const scrollTopY = 0; 
      // 目标滚动位置：让 header 大致在视口中间偏上一点的位置
      const scrollContentY = headerEl.offsetTop - window.innerHeight * 0.4;
      let isSnapping = false;

      // 使用 ScrollTrigger 监测滚动方向和速度，实时判断滚动是否接近目标
      ScrollTrigger.create({
        trigger: "body", // 监测整个页面滚动
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self: ScrollTrigger) => { // 使用 onUpdate 监听滚动实时状态
          // 如果正在吸附中，则不处理
          if (isSnapping) return;

          const currentScroll = self.scroll();
          const velocity = self.getVelocity();
          const threshold = 50; // 滚动速度阈值，用来判定是否需要吸附

          let snapTarget: number | null = null;

          // 判断滚动方向和速度来决定吸附目标
          if (velocity > threshold) { // 向下滚动
            if (currentScroll < scrollContentY / 2) { // 如果在顶部区域，吸附到内容区
              snapTarget = scrollContentY;
              setIsInInitialStage(false);
            }
          } else if (velocity < -threshold) { // 向上滚动
            if (currentScroll > scrollContentY / 2) { // 如果在内容区，吸附回顶部
              snapTarget = scrollTopY;
              setIsInInitialStage(true);
            } 
          } else { // 如果速度较低，判断当前位置决定是否吸附
            if (currentScroll > scrollContentY / 2 && currentScroll < scrollContentY * 1.2) {
              snapTarget = scrollContentY;
              setIsInInitialStage(false);
            } else if (currentScroll < scrollContentY / 2 && currentScroll > 50) { // 避免在最顶部反复触发
              snapTarget = scrollTopY;
              setIsInInitialStage(true);
            }
          }

          // 如果确定了吸附目标，并且与当前位置有足够距离，则执行吸附动画
          if (snapTarget !== null && Math.abs(currentScroll - snapTarget) > 10) {
            isSnapping = true;
            gsap.to(window, {
              scrollTo: { y: snapTarget, autoKill: true }, // autoKill 设为 true
              duration: 0.6, // 统一吸附时间
              ease: "power1.inOut", // 恢复平滑缓动
              overwrite: true,
              onComplete: () => { 
                isSnapping = false; 
                // 不需要手动 refresh，因为 ScrollTrigger 会自动处理
              },
              onInterrupt: () => { 
                isSnapping = false; 
              }
            });
          }
        }
      });

      // 刷新所有ScrollTrigger (虽然上面没用scrub，但其他动画可能需要)
      ScrollTrigger.refresh();
    });

    // 清理函数
    return () => {
      ctx.revert(); // 自动清理所有GSAP动画和ScrollTrigger
      gsap.killTweensOf(window); // 重新添加滚动动画清理
    };
  // 重新添加 setIsInInitialStage
  }, [refs, isContentLoaded, setIsInInitialStage]); 
};
