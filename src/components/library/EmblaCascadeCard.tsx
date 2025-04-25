"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { Topic } from "@/types/issue";
import { useI18n } from "@/i18n";

export interface EmblaCascadeCardProps {
  title: string;
  inView: boolean;
  imageUrl?: string;
  date?: string;
  number?: number;
  topics?: Topic[];
  position: number; // 相对于当前视图的位置：-1（上方）, 0（中间）, 1（下方）
}

export function EmblaCascadeCard({
  title,
  inView,
  imageUrl,
  date,
  number,
  topics,
  position
}: EmblaCascadeCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const imageRef = useRef<HTMLDivElement>(null);
  const { locale } = useI18n();
  
  const issueNumber = number !== undefined ? number : 
    title.match(/\d+/)?.[0] || '';
  
  // 格式化日期支持国际化
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
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
  };
  
  // 样式计算
  let yOffset = "0%";
  let opacity = 1;
  let scale = 1;
  let zIndex = 30;
  
  if (position === -1) {
    yOffset = "calc(-100% + 64px)"; // 上方卡片紧贴顶部，留64px边距
    opacity = 0.7;
    scale = 0.5;
    zIndex = 20;
  } else if (position === 1) {
    yOffset = "calc(100% - 64px)"; // 下方卡片紧贴底部，留64px边距
    opacity = 0.7;
    scale = 0.5;
    zIndex = 20;
  }

  const getTransition = () => {
    if (prefersReducedMotion) {
      return { type: "tween" as const, duration: 0.3 };
    }
    
    return {
      type: "spring" as const,
      stiffness: 450,
      damping: 30,
      mass: 0.8,
    };
  };

  const backfaceProps = {
    WebkitBackfaceVisibility: "hidden" as const,
    backfaceVisibility: "hidden" as const,
    perspective: 1000 as const,
  };

  return (
    <motion.div
      className="absolute left-0 top-0 w-full h-full flex items-center justify-center"
      initial={false}
      layout={false}
      animate={{
        y: yOffset,
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
      data-position={position}
      data-issue-number={issueNumber}
    >
      <div className="flex flex-col items-center justify-center p-8">
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
        
        {inView && date && (
          <p className="mt-6 mb-3 text-center text-sm text-[#545454]">
            {locale === 'zh' ? `最新发布 ${formatDate(date)}` : `the latest ${formatDate(date)}`}
          </p>
        )}
        
        {inView && topics && topics.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            {topics.map((topic, index) => (
              <motion.p 
                key={topic.id} 
                className="text-lg font-newyork-large cursor-pointer"
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