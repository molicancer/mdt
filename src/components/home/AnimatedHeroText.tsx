"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

// 辅助函数：分割文本并为字符添加特定类名
const splitTextWithClass = (text: string, className: string): React.ReactNode[] => {
  return text.split("").map((char, index) => (
    <span className={`inline-block ${className}`} key={`${text}-${index}`}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
};

const AnimatedHeroText = () => {
  const { t, locale } = useI18n();
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

    return () => {
      tl.kill();
    };

  }, [locale]); // 添加locale作为依赖，当语言改变时重新触发动画

  const designText = t('home.heroTitle.design');
  const inspirationText = t('home.heroTitle.inspiration');

  return (
    // 容器负责居中
    <div className="flex flex-col items-center justify-center">
      {/* 动画容器 */}
      <div
        ref={animationContainerRef}
        className="font-newyork-large text-center relative"
      >
        <span className="2xl:text-[160px] xl:text-[110px] lg:text-[80px] text-[60px] leading-none">{splitTextWithClass(designText, "char-anim")}</span>
        <span className="2xl:text-[85px] xl:text-[57px] lg:text-[42px] text-[32px] leading-none char-anim text-zinc-300 absolute ml-3 -mt-2">&</span>
        <span className="2xl:text-[160px] xl:text-[110px] lg:text-[80px] text-[60px] leading-none block">{splitTextWithClass(inspirationText, "char-anim")}</span>
      </div>

      {/* 副标题容器 - Framer Motion控制动画 */}
      <motion.div
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
        key={locale} // 添加key，确保语言切换时动画重新触发
      >
        <p className="text-base text-[#545454] text-center relative dark:invert">
          {t('home.heroSubtitle.share')}<br />{t('home.heroSubtitle.updated')}
        </p>
      </motion.div>
    </div>
  );
};

export default AnimatedHeroText; 