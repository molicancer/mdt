"use client";

import { useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { motion } from "framer-motion";

export interface CardItem {
  id: number | string;
  [key: string]: unknown;
}

interface VerticalCarouselProps<T extends CardItem> {
  items: T[];
  renderCard: (item: T, index: number, position: number) => ReactNode;
  className?: string;
  showPagination?: boolean;
  showControls?: boolean;
  transitionDuration?: number;
  dampingFactor?: number;
  touchThreshold?: number;
  onIndexChange?: (index: number) => void;
}

export function VerticalCarousel<T extends CardItem>({
  items,
  renderCard,
  className = "",
  showPagination = true,
  showControls = true,
  transitionDuration = 700,
  dampingFactor = 0.8,
  touchThreshold = 50,
  onIndexChange,
}: VerticalCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const lastTouchY = useRef(0);
  const lastWheelTime = useRef(0);
  const isTouchInProgress = useRef(false);
  const deltaAccumulator = useRef(0);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  
  const changeIndex = useCallback((direction: number) => {
    if (isScrolling.current) return;
    
    const newIndex = Math.min(Math.max(activeIndex + direction, 0), items.length - 1);
    
    if (newIndex !== activeIndex) {
      isScrolling.current = true;
      setActiveIndex(newIndex);
      
      if (onIndexChange) {
        onIndexChange(newIndex);
      }
      
      setTimeout(() => {
        isScrolling.current = false;
        deltaAccumulator.current = 0;
      }, transitionDuration);
    }
  }, [activeIndex, items.length, transitionDuration, onIndexChange]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      if (isScrolling.current) return;
      
      const now = Date.now();
      if (now - lastWheelTime.current < 150) {
        return;
      }
      lastWheelTime.current = now;
      
      const dampedDelta = event.deltaY * dampingFactor;
      
      if (Math.abs(dampedDelta) > 20) {
        changeIndex(dampedDelta > 0 ? 1 : -1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [activeIndex, items.length, transitionDuration, changeIndex, dampingFactor]);

  useEffect(() => {
    let touchStartTime = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (isScrolling.current) return;
      
      const startY = e.touches[0].clientY;
      touchStartY.current = startY;
      lastTouchY.current = startY;
      touchStartTime = Date.now();
      isTouchInProgress.current = true;
      deltaAccumulator.current = 0;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling.current) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current !== null ? touchStartY.current - currentY : 0;
      
      deltaAccumulator.current = Math.abs(deltaY);
      lastTouchY.current = currentY;
      
      touchEndY.current = currentY;
      
      const timeDiff = Date.now() - touchStartTime;
      const speed = Math.abs(deltaY) / timeDiff;
      
      if (Math.abs(deltaY) > 30 && speed > 0.3) {
        const direction = deltaY > 0 ? 1 : -1;
        isTouchInProgress.current = false;
        changeIndex(direction);
      }
    };
    
    const handleTouchEnd = () => {
      if (isScrolling.current) return;
      
      isTouchInProgress.current = false;
      
      if (deltaAccumulator.current > 30 && touchStartY.current !== null) {
        const direction = touchStartY.current > lastTouchY.current ? 1 : -1;
        changeIndex(direction);
      }
      
      deltaAccumulator.current = 0;
      
      if (touchStartY.current !== null && touchEndY.current !== null) {
        const touchDiff = touchEndY.current - touchStartY.current;
        
        if (Math.abs(touchDiff) > touchThreshold) {
          if (touchDiff > 0) {
            changeIndex(-1);
          } else {
            changeIndex(1);
          }
        }
      }
      
      touchStartY.current = null;
      touchEndY.current = null;
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: true });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });
    }
    
    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [activeIndex, items.length, transitionDuration, changeIndex, touchThreshold]);

  const renderPagination = () => {
    if (!showPagination) return null;
    
    return (
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
        {items.map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full cursor-pointer bg-foreground"
            animate={{
              scale: activeIndex === index ? 1.5 : 1,
              // backgroundColor: activeIndex === index ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)"
            }}
            transition={{
              duration: 0.2
            }}
            onClick={() => {
              if (!isScrolling.current) {
                changeIndex(index - activeIndex);
              }
            }}
          />
        ))}
      </div>
    );
  };

  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <div className="mt-8 flex gap-4">
        <button 
          className="px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => changeIndex(-1)}
          disabled={activeIndex === 0 || isScrolling.current}
        >
          上一张
        </button>
        <button 
          className="px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => changeIndex(1)}
          disabled={activeIndex === items.length - 1 || isScrolling.current}
        >
          下一张
        </button>
      </div>
    );
  };

  // 返回当前项目相对于活动索引的位置
  const getItemPosition = useCallback((index: number) => {
    return index - activeIndex;
  }, [activeIndex]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={containerRef}
        className="h-screen w-full relative overflow-hidden will-change-transform touch-action-none"
      >
        {items.map((item, index) => {
          const position = getItemPosition(index);
          return renderCard(item, index, position);
        })}
        
        {renderPagination()}
      </div>
      
      {renderControls()}
    </div>
  );
} 