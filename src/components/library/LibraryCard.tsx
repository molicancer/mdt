"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { Topic } from "@/types/issue";
import { useI18n } from "@/i18n";

export interface LibraryCardProps {
  id: number | string;
  title: string;
  content: string;
  color: string;
  position: number;
  onClick?: () => void;
  imageUrl?: string;
  subtitle?: string;
  date?: string;
  number?: number;
  topics?: Topic[];
  onNavigate?: (direction: number) => void;
}

export function LibraryCard({
  id,
  title,
  content,
  color,
  position,
  onClick,
  imageUrl,
  subtitle,
  date,
  number,
  topics,
  onNavigate
}: LibraryCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const { locale } = useI18n();
  
  const issueNumber = number !== undefined ? number : 
    title.match(/\d+/)?.[0] || '';
  
  const isActiveCard = position === 0;
  const isPrevCard = position === -1;
  const isNextCard = position === 1;
  
  // 格式化日期支持国际化
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // 中文日期格式
      if (locale === 'zh') {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
      } 
      // 英文日期格式
      else {
        const options: Intl.DateTimeFormatOptions = { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
      }
    } catch (e) {
      // 如果日期无效，直接返回原始字符串
      return dateString;
    }
  };
  
  useEffect(() => {
    if (isPrevCard || isNextCard) {
      console.log(`卡片 ${issueNumber} 位置: ${position}`);
    }
  }, [position, issueNumber, isPrevCard, isNextCard]);
  
  let yOffset = "0%";
  let opacity = 0;
  let scale = 0.8;
  let zIndex = 0;
  
  if (position === 0) {
    yOffset = "0%";
    opacity = 1;
    scale = 1;
    zIndex = 30;
  } else if (position === -1) {
    yOffset = "-100%";
    opacity = 0.7;
    scale = 0.5;
    zIndex = 20;
  } else if (position === 1) {
    yOffset = "100%";
    opacity = 0.7;
    scale = 0.5;
    zIndex = 20;
  } else if (position === -2) {
    yOffset = "-130%";
    opacity = 0.3;
    scale = 0.9;
    zIndex = 10;
  } else if (position === 2) {
    yOffset = "130%";
    opacity = 0.3;
    scale = 0.9;
    zIndex = 10;
  } else {
    yOffset = position < 0 ? "-150%" : "150%";
    opacity = 0;
    scale = 0.8;
    zIndex = 0;
  }

  if (Math.abs(position) > 3) {
    return null;
  }

  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`点击上一张卡片 ${issueNumber}`);
    if (onNavigate) onNavigate(-1);
  };
  
  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`点击下一张卡片 ${issueNumber}`);
    if (onNavigate) onNavigate(1);
  };

  const getTransition = () => {
    if (prefersReducedMotion) {
      return { type: "tween" as const, duration: 0.3 };
    }
    
    if (position === 0) {
      return {
        type: "spring" as const,
        stiffness: 450,
        damping: 30,
        mass: 0.8,
      };
    }
    
    if (Math.abs(position) === 1) {
      return {
        type: "spring" as const,
        stiffness: 500,
        damping: 35,
        mass: 0.9,
      };
    }
    
    return {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
      mass: 1,
    };
  };

  const backfaceProps = {
    WebkitBackfaceVisibility: "hidden" as const,
    backfaceVisibility: "hidden" as const,
    perspective: 1000 as const,
  };

  const getHoverEffects = () => {
    let hoverScale = scale;
    let hoverCursor = 'default';
    
    if (isPrevCard || isNextCard) {
      hoverScale = scale * 1.05;
      hoverCursor = 'pointer';
    }
    
    return {
      scale: hoverScale,
      cursor: hoverCursor 
    };
  };

  // 根据卡片位置调整整个布局
  const containerPosition = isPrevCard ? 'top-0' : isNextCard ? 'bottom-0' : 'top-1/2 -translate-y-1/2';
  
  // 根据卡片位置调整内边距
  const paddingClass = isPrevCard ? 'pt-4 pb-8' : isNextCard ? 'pt-8 pb-4' : 'py-8';

  return (
    <motion.div
      className={`absolute left-0 flex items-center justify-center w-full ${containerPosition}`}
      initial={false}
      layout={false}
      animate={{
        opacity,
        scale,
      }}
      transition={getTransition()}
      style={{ 
        transformOrigin: "center center",
        zIndex,
        willChange: "transform",
        ...backfaceProps
      }}
      onClick={
        isPrevCard ? handlePrevClick :
        isNextCard ? handleNextClick :
        undefined
      }
      whileHover={getHoverEffects()}
      data-position={position}
      data-issue-number={issueNumber}
    >
      <div className={`flex flex-col items-center justify-center ${paddingClass}`}>
        <div className="flex items-center justify-center w-full">
          <div className="flex-none w-3xs text-[120px] text-right font-newyork-large">Vol</div>
          
          {imageUrl && (
            <div ref={imageRef} className="flex-none -mx-4">
                <Image 
                  src={imageUrl} 
                  alt={title}
                  width={200}
                  height={200}
                  className="dark:invert transition-all duration-300"
                  quality={85}
                  sizes="(max-width: 768px) 128px, 160px"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5jU3rHgAAAABJRU5ErkJggg=="
                />
            </div>
          )}
          
          <div className="flex-none w-3xs text-[120px] text-left font-newyork-large">{issueNumber}</div>
        </div>
        
        {isActiveCard && date && (
          <p className="mt-6 mb-3 text-center text-sm text-[#545454]">
            {locale === 'zh' ? `最新发布 ${formatDate(date)}` : `the latest ${formatDate(date)}`}
          </p>
        )}
        
        {isActiveCard && topics && topics.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            {topics.map((topic, index) => (
              <motion.p 
                key={topic.id} 
                className="text-lg font-newyork-large"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut"
                }}
              >
                {topic.title}
              </motion.p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 