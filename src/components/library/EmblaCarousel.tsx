"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { IssueContent } from '@/types/issue';
import { EmblaCascadeCard } from './EmblaCascadeCard';
import { DotButton, NextButton, PrevButton } from './EmblaCarouselButtons';

type Axis = 'x' | 'y';

interface EmblaCarouselProps {
  items: IssueContent[];
  className?: string;
  onIndexChange?: (index: number) => void;
}

// 添加底部提示文本
const SwipeIndicator = () => (
  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center w-full">
    <p className="text-gray-500 text-sm">Swipe to select the vol you want to watch</p>
  </div>
);

export function EmblaCarousel({
  items,
  className = "",
  onIndexChange,
}: EmblaCarouselProps) {
  // 配置项状态
  const [axis] = useState<Axis>('y'); // 垂直方向
  const [skipSnaps] = useState(false); // 确保每次只切换一个slide
  const [forceWheelAxis] = useState<Axis | undefined>('y'); // 强制使用Y轴滚动
  const [target] = useState<Element | undefined>(undefined);
  const slideRef = useRef<HTMLDivElement>(null);
  
  // 轮播状态
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  
  // 初始化embla-carousel及wheel手势插件
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      skipSnaps,
      axis,
      align: 'center',
      containScroll: 'trimSnaps',
      dragFree: false, // 禁用惯性滚动
      duration: 5, // 大幅减少滚动持续时间，使切换更快速
    },
    [
      WheelGesturesPlugin({
        forceWheelAxis,
        target,
        wheelDraggingClass: 'is-wheel-dragging'
      })
    ]
  );

  // 计算当前视图中每个项目的位置
  const getPositionInView = (index: number) => {
    if (index === activeIndex) return 0;
    if (index === activeIndex - 1) return -1;
    if (index === activeIndex + 1) return 1;
    return index < activeIndex ? -2 : 2;
  };

  // 轮播控制函数
  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // 监听选择事件
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      const newIndex = emblaApi.selectedScrollSnap();
      setActiveIndex(newIndex);
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
      
      if (onIndexChange) {
        onIndexChange(newIndex);
      }
    };
    
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    onSelect(); // 初始化状态
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onIndexChange]);

  // 添加处理滚轮事件的函数，加快响应速度
  useEffect(() => {
    if (!emblaApi) return;
    
    const handleWheel = (event: WheelEvent) => {
      // 阻止默认行为
      event.preventDefault();
      
      // 根据滚轮方向决定滚动方向
      if (event.deltaY > 0) {
        emblaApi.scrollNext();
      } else if (event.deltaY < 0) {
        emblaApi.scrollPrev();
      }
    };
    
    // 获取viewport元素
    const viewportElement = emblaApi.containerNode();
    viewportElement.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      viewportElement.removeEventListener('wheel', handleWheel);
    };
  }, [emblaApi]);

  return (
    <div className={`relative h-screen overflow-hidden ${className}`}>
      <div className="embla" data-axis={axis}>
        <div ref={emblaRef} className="embla__viewport h-full w-full">
          <div className="embla__container h-full">
            {items.map((item, index) => {
              const position = getPositionInView(index);
              // 只渲染当前视图附近的项目，提高性能
              if (Math.abs(position) > 2) return null;
              
              return (
                <div 
                  key={item.id}
                  ref={index === activeIndex ? slideRef : undefined}
                  className="embla__slide flex-shrink-0 relative"
                  style={{ height: '50vh', maxHeight: '50vh' }}
                >
                  <div className="embla__slide__inner h-full flex items-center justify-center">
                    <EmblaCascadeCard
                      title={`第 ${item.number} 期`}
                      inView={position === 0}
                      position={position}
                      imageUrl={item.icon}
                      date={item.date}
                      number={item.number}
                      topics={position === 0 ? item.topics : undefined}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="embla__dots absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {scrollSnaps.map((_, index) => (
            <DotButton 
              key={index}
              selected={index === activeIndex}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
        
        <SwipeIndicator />
        
        <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled}>
          <span className="sr-only">上一期</span>
        </PrevButton>
        <NextButton onClick={scrollNext} enabled={nextBtnEnabled}>
          <span className="sr-only">下一期</span>
        </NextButton>
      </div>
    </div>
  );
} 