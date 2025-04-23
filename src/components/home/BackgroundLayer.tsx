"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import Image from "next/image";

// 打字机效果的辅助 Hook
function useTypewriter(text: string, speed = 50, isHovering: boolean) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isHovering) {
      let i = 0;
      setDisplayedText("");
      if (text && text.length > 0) {
      intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
            if (intervalId) clearInterval(intervalId);
        }
      }, speed);
      }
    } else {
      setDisplayedText(""); 
      if (intervalId) clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
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

// Define props, accepting className
interface BackgroundLayerProps {
  className?: string; // Accept an optional className prop
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = React.memo(({ 
  className = "" // Default to empty string
}) => {
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
    if (isHovering1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      controls1.start("hovered").catch(console.error);
      controls2.start("resting").catch(console.error);
    } else if (isHovering2) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      controls2.start("hovered").catch(console.error);
      controls1.start("resting").catch(console.error);
    } else {
       controls1.start("resting").catch(console.error);
       controls2.start("resting").catch(console.error);
       // Pulse scheduling is handled by the next effect
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      controls1.stop();
      controls2.stop();
    };
  }, [controls1, controls2, isHovering1, isHovering2]);

  // Effect for scheduling pulses
  useEffect(() => {
    const schedulePulse = (who: 1 | 2) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (isHovering1 || isHovering2) return;
      const randomDelay = 2000 + Math.random() * 3000;
      timeoutRef.current = setTimeout(() => {
        if (isHovering1 || isHovering2) return;
        const controls = who === 1 ? controls1 : controls2;
        const nextInLine = who === 1 ? 2 : 1;
        controls.start("pulse").catch(console.error);
        setNextPulser(nextInLine);
      }, randomDelay);
    };
    if (!isHovering1 && !isHovering2) {
      schedulePulse(nextPulser);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [controls1, controls2, isHovering1, isHovering2, nextPulser]);

  // Memoized styles
  const avatar1Style = useMemo(() => ({
              left: `calc(50% + ${avatar1OffsetX}px)`,
              top: `calc(50% + ${avatar1OffsetY}px)`,
              transform: 'translate(-50%, -50%)',
              width: `${GRID_CELL_WIDTH}px`,
              height: `${GRID_CELL_HEIGHT}px` 
  }), [avatar1OffsetX, avatar1OffsetY]);

  const avatar2Style = useMemo(() => ({
    left: `calc(50% + ${avatar2OffsetX}px)`,
    top: `calc(50% + ${avatar2OffsetY}px)`,
    transform: 'translate(-50%, -50%)',
    width: `${GRID_CELL_WIDTH}px`,
    height: `${GRID_CELL_HEIGHT}px`
  }), [avatar2OffsetX, avatar2OffsetY]);

  const textStyle = useMemo(() => ({
     top: `${GRID_CELL_HEIGHT - 8}px`
  }), []);

  return (
    <motion.div className={`absolute inset-0 -z-10 ${className}`}>
      {/* Avatar 1 Container */}
      <motion.div
        className="absolute flex flex-col items-center z-10"
        style={avatar1Style}
            onHoverStart={() => setIsHovering1(true)}
            onHoverEnd={() => setIsHovering1(false)}
          >
        {/* Image pulse/hover animation */}
            <motion.div
          className="w-full h-full relative"
          variants={imageVariants}
          initial="resting"
          animate={controls1}
            >
          <Image src="/img/avatar-man.png" alt="Avatar 1" fill className="rounded-full object-cover" />
            </motion.div>
        {/* Typewriter text */}
        <p className="absolute left-0 right-0 text-base font-newyork-large font-medium text-center pointer-events-none" style={textStyle}>
              {displayedText1} 
            </p>
          </motion.div>

      {/* Avatar 2 Container */}
          <motion.div 
        className="absolute flex flex-col items-center z-10"
        style={avatar2Style}
            onHoverStart={() => setIsHovering2(true)}
            onHoverEnd={() => setIsHovering2(false)}
          >
        {/* Image pulse/hover animation */}
            <motion.div
          className="w-full h-full relative"
          variants={imageVariants}
          initial="resting"
          animate={controls2}
            >
          <Image src="/img/avatar-woman.png" alt="Avatar 2" fill className="rounded-full object-cover" />
            </motion.div>
        {/* Typewriter text */}
        <p className="absolute left-0 right-0 text-base font-newyork-large font-medium text-center pointer-events-none" style={textStyle}>
              {displayedText2}
            </p>
          </motion.div>
    </motion.div>
  );
});

BackgroundLayer.displayName = 'BackgroundLayer'; 