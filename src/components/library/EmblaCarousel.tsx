"use client";

import React, { useCallback, useEffect, useState } from 'react';
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

export function EmblaCarousel({
  items,
  className = "",
  onIndexChange,
}: EmblaCarouselProps) {
  // 配置项状态
  const [axis] = useState<Axis>('y'); // 垂直方向
  const [skipSnaps] = useState(false);
  const [forceWheelAxis] = useState<Axis | undefined>('y'); // 强制使用Y轴滚动
  const [target] = useState<Element | undefined>(undefined);
  
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
    },
    [
      WheelGesturesPlugin({
        forceWheelAxis,
        target,
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
                  className="embla__slide h-screen flex-shrink-0 relative"
                >
                  <div className="embla__slide__inner h-full flex items-center justify-center">
                    <EmblaCascadeCard
                      id={item.id}
                      title={`第 ${item.number} 期`}
                      content={item.title || `MDT 期刊 Vol.${item.number}`}
                      color={`hsl(${(parseInt(String(item.id)) * 25) % 360}, 80%, 70%)`}
                      inView={position === 0}
                      position={position}
                      imageUrl={item.icon}
                      subtitle={item.subtitle}
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
        
        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton 
              key={index}
              selected={index === activeIndex}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
        
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