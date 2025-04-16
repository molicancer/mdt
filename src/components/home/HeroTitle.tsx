import { forwardRef, useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useAnimationStore } from "@/store/animationStore";
import { useUIStore } from "@/store/uiStore";
import { ANIMATION_CONFIG } from '@/config/animationConfig';
import Image from "next/image";
import { Variants } from "framer-motion";

// 打字机效果的辅助 Hook
function useTypewriter(text: string, speed = 50, isHovering: boolean) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isHovering) {
      let i = 0;
      setDisplayedText(""); // 鼠标悬停开始时重置

      intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, speed);

    } else {
      // 可选：鼠标移开时立即清除文本，或让它随容器淡出
      setDisplayedText(""); 
    }

    // 组件卸载或悬停状态改变时清除 interval
    return () => clearInterval(intervalId);
  }, [text, speed, isHovering]);

  return displayedText;
}

// --- 定义图片动画变体 ---
const imageVariants: Variants = {
  resting: { opacity: 0.03 }, // 默认静止状态
  pulse: { 
    opacity: [0.03, 0.08, 0.03], // 脉冲：3% -> 8% -> 3%
    transition: { duration: 1, ease: "easeInOut" } // 脉冲持续时间
  },
  hovered: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" } // 悬停状态过渡
  }
};
// --- 结束动画变体定义 ---

export const HeroTitle = forwardRef<HTMLDivElement>(
  function HeroTitle(_, ref) {
    // 从状态存储获取动画状态
    const isVisible = useAnimationStore(state => state.isVisible);
    const titleTransform = useAnimationStore(state => state.titleTransform);
    const titleOpacity = useAnimationStore(state => state.titleOpacity);
    const { browseMode } = useUIStore();
    const isInitialStage = useAnimationStore(state => state.isInitialStage);

    console.log('HeroTitle 渲染:', { titleTransform, titleOpacity });

    // --- 悬停和打字机状态 ---
    const [isHovering1, setIsHovering1] = useState(false);
    const [isHovering2, setIsHovering2] = useState(false);

    const fullText1 = "The CEO of Amazon Jeff Bezos";
    const fullText2 = "The Dean of HAI Li Fei fei";

    const displayedText1 = useTypewriter(fullText1, 50, isHovering1);
    const displayedText2 = useTypewriter(fullText2, 50, isHovering2);
    // --- 结束状态定义 ---

    // 动画控件和调度状态
    const controls1 = useAnimation();
    const controls2 = useAnimation();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); 
    const [nextPulser, setNextPulser] = useState<1 | 2>(1); // 用于记录下一个脉冲对象

    // 定义网格单元尺寸
    const GRID_CELL_WIDTH = 180;
    const GRID_CELL_HEIGHT = 240;

    // 计算头像1的偏移量 (左3, 下1)
    const avatar1GridX = -3;
    const avatar1GridY = 1;
    const avatar1OffsetX = avatar1GridX * GRID_CELL_WIDTH;
    const avatar1OffsetY = avatar1GridY * GRID_CELL_HEIGHT;

    // 计算头像2的偏移量 (右3, 上1)
    const avatar2GridX = 3;
    const avatar2GridY = -1;
    const avatar2OffsetX = avatar2GridX * GRID_CELL_WIDTH;
    const avatar2OffsetY = avatar2GridY * GRID_CELL_HEIGHT;

    // 控制交替脉冲的合并 effect
    useEffect(() => {
      // 安排下一个脉冲的函数
      const schedulePulse = (who: 1 | 2) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current); // 清除之前的 timeout

        // 如果处于悬停状态，则不安排
        if (isHovering1 || isHovering2) return;

        const randomDelay = 2000 + Math.random() * 3000; // 2-5 秒随机延迟
        
        timeoutRef.current = setTimeout(() => {
          // 在启动动画前再次检查悬停状态
          if (isHovering1 || isHovering2) return;

          const controls = who === 1 ? controls1 : controls2;
          const nextInLine = who === 1 ? 2 : 1;
          
          // 启动脉冲动画
          controls.start("pulse"); 
          
          // 立刻安排下一个脉冲给另一个头像
          setNextPulser(nextInLine); // 更新下一个周期的状态
          schedulePulse(nextInLine); // 递归调用给另一个头像

        }, randomDelay);
      };

      // 初始设置和悬停处理
      if (isHovering1) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        controls1.start("hovered");
        controls2.start("resting"); // 确保另一个是静止状态
      } else if (isHovering2) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        controls2.start("hovered");
        controls1.start("resting"); // 确保另一个是静止状态
      } else {
         // 重置到静止状态并开始脉冲循环
         controls1.start("resting");
         controls2.start("resting");
         schedulePulse(nextPulser); // 开始循环
      }

      // 清理函数
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [controls1, controls2, isHovering1, isHovering2, nextPulser]); // 添加 nextPulser 依赖

    return (
      <div className="relative flex flex-col items-center justify-center h-screen">
        {/* 假设每个格子宽度200px，高度240px */}
        {/* Avatar 1 Container */}
        {isInitialStage && !browseMode && (
          <motion.div 
            // Container only handles initial fade-in and hover state, background is always visible
            className="absolute flex flex-col items-center z-10 bg-background cursor-pointer"
            style={{ 
              left: `calc(50% + ${avatar1OffsetX}px)`,
              top: `calc(50% + ${avatar1OffsetY}px)`,
              transform: 'translate(-50%, -50%)',
              width: `${GRID_CELL_WIDTH}px`,
              height: `${GRID_CELL_HEIGHT}px` 
            }}
            initial={{ opacity: 0 }} // Container fades in once
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }} // Transition for container fade-in
            onHoverStart={() => setIsHovering1(true)}
            onHoverEnd={() => setIsHovering1(false)}
          >
            {/* Image Wrapper for Breathing/Hover Animation */}
            <motion.div
              className="w-full h-full relative" // Adjust size/position as needed if image isn't fill
              variants={imageVariants}          // Apply variants here
              initial="resting"               // Start resting
              animate={controls1} // Controlled by useAnimation
            >
              <Image src="/img/avatar-man.png" alt="Avatar 1" fill className="rounded-full" /> 
            </motion.div>
           
            {/* Text remains the same, position relative to the outer container */}
            <p 
              className="absolute left-0 right-0 text-base font-newyork-large font-medium text-center" 
              style={{ top: `${GRID_CELL_HEIGHT - 8}px` }}
            >
              {displayedText1} 
            </p>
          </motion.div>
        )}

        {/* Avatar 2 Container */}
        {isInitialStage && !browseMode && (
          <motion.div 
            // Container only handles initial fade-in and hover state, background is always visible
            className="absolute flex flex-col items-center z-10 bg-background cursor-pointer"
            style={{ 
              left: `calc(50% + ${avatar2OffsetX}px)`,
              top: `calc(50% + ${avatar2OffsetY}px)`,
              transform: 'translate(-50%, -50%)',
              width: `${GRID_CELL_WIDTH}px`,
              height: `${GRID_CELL_HEIGHT}px`
            }}
            initial={{ opacity: 0 }} // Container fades in once
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }} // Transition for container fade-in
            onHoverStart={() => setIsHovering2(true)}
            onHoverEnd={() => setIsHovering2(false)}
          >
             {/* Image Wrapper for Breathing/Hover Animation */}
            <motion.div
              className="w-full h-full relative" // Adjust size/position as needed if image isn't fill
              variants={imageVariants}          // Apply variants here
              initial="resting"               // Start resting
              animate={controls2} // Controlled by useAnimation
            >
              <Image src="/img/avatar-woman.png" alt="Avatar 2" fill className="rounded-full" /> 
            </motion.div>
           
            {/* Text remains the same, position relative to the outer container */}
            <p 
              className="absolute left-0 right-0 text-base font-newyork-large font-medium text-center" 
              style={{ top: `${GRID_CELL_HEIGHT - 8}px` }}
            >
              {displayedText2}
            </p>
          </motion.div>
        )}

        <div className="flex flex-col items-center z-20">
          {/* 标题部分 - 会上移和渐隐 */}
          <motion.div
            ref={ref}
            className="flex flex-col items-center justify-center relative will-change-transform"
            animate={{ 
              y: -titleTransform,
              opacity: titleOpacity
            }}
            transition={{ 
              type: "spring", 
              stiffness: 120, 
              damping: 20 
            }}
          >
            <h1 className="text-[118px]/[110px] font-newyork-large text-center relative mb-4">
              Design
              <span className="text-[64px] text-zinc-300 absolute ml-3 -mt-3">&</span><br />
              Inspiration
            </h1>
          </motion.div>

          {/* InfoText部分 - 只会渐隐不会上移 */}
          <motion.div 
            className="w-full text-center mt-4"
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: isVisible && !browseMode && isInitialStage ? 1 : 0 
            }}
            transition={ANIMATION_CONFIG.presets.infoText.transition}
          >
            <p className="text-base text-[#545454] text-center relative">
              Share the latest design and artificial intelligence consulting<span className="text-black">「 weekly news 」</span><br />
              Updated once a Monday morning
            </p>
          </motion.div>
        </div>
      </div>
    );
  }
); 