"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

// 辅助函数：分割文本并为字符添加特定类名
const splitTextWithClass = (text: string, className: string): React.ReactNode[] => {
  return text.split("").map((char, index) => (
    <span className={`inline-block ${className}`} key={`${text}-${index}`}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
};

const AnimatedHeroText = () => {
  const animationContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = animationContainerRef.current;
    if (!container) return;

    const animatedElements = container.querySelectorAll(".char-anim");
    if (animatedElements.length === 0) return;

    const tl = gsap.timeline();

    // 主标题动画
    tl.fromTo(
      animatedElements,
      { // 初始状态
        opacity: 0,
        yPercent: 120,
        scaleY: 1.0,
        scaleX: 0.7,
        filter: 'blur(8px)',
        transformOrigin: "50% 0%",
        willChange: "opacity, transform, filter"
      },
      { // 结束状态
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        filter: 'blur(0px)',
        stagger: 0.04,
        ease: 'back.inOut(2)',
        duration: 1
      }
    );

    // // 副标题动画 - 使用GSAP控制，确保在主标题动画后执行
    // tl.fromTo(
    //   ".subtitle-motion", // 选择器指向motion.div的类名
    //   { // 初始状态
    //     opacity: 0,
    //     y: 100,
    //     filter: 'blur(5px)'
    //   },
    //   { // 结束状态
    //     opacity: 1,
    //     y: 0,
    //     filter: 'blur(0px)',
    //     duration: 0.8,
    //     ease: "easeInOut"
    //   },
    //   ">-0.5" // 相对于上一个动画结束前0.5秒开始，实现重叠效果
    // );

    return () => {
      tl.kill();
    };

  }, []);

  return (
    // 容器负责居中
    <div className="flex flex-col items-center justify-center">
      {/* 动画容器 */}
      <div
        ref={animationContainerRef}
        className="font-newyork-large text-center relative"
      >
        <span className="text-[118px]/[110px]">{splitTextWithClass("Design", "char-anim")}</span>
        <span className="char-anim text-[64px] text-zinc-300 absolute ml-3 -mt-2">&</span>
        <span className="text-[118px]/[110px] block">{splitTextWithClass("Inspiration", "char-anim")}</span>
      </div>

      {/* 副标题容器 - Framer Motion控制动画 */}
      <motion.div
        // className="subtitle-motion w-full text-center mt-10" // 添加类名供GSAP选择
        className="w-full text-center mt-10"
        initial={{
          opacity: 0,
          y: 100,
          filter: 'blur(5px)'
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)'
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
          delay: 0.6 // Framer Motion自带的延迟
        }}
      >
        <p className="text-base text-[#545454] text-center relative">
          Share the latest design and artificial intelligence consulting<span className="text-black">「 weekly news 」</span><br />
          Updated once a Monday morning
        </p>
      </motion.div>
    </div>
  );
};

export default AnimatedHeroText; 