'use client'

import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import './embla.css'

const VerticalCarouselPage: React.FC = () => {
  // 挂载到 viewport 上
  const [viewportRef] = useEmblaCarousel(
    {
      axis: 'y',               // 垂直滚动
      align: 'center',         // 居中对齐
      containScroll: false,
      skipSnaps: false
    },
    [
      // 强制在 Y 轴监听滚轮/触摸板操作
      WheelGesturesPlugin({ forceWheelAxis: 'y' })
    ]
  )

  const slides = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <div className="embla h-screen w-screen">
      {/* viewport 必须有 overflow-hidden，ref 挂这里 */}
      <div
        className="embla__viewport h-full w-full overflow-hidden"
        ref={viewportRef}
      >
        {/* 下面才是真正滑动的 container */}
        <div className="embla__container flex flex-col gap-y-4">
          {slides.map((slide) => (
            <div
              key={slide}
              className="embla__slide flex-shrink-0 w-full h-[80vh] bg-gray-200 flex items-center justify-center text-2xl"
            >
              <div className="embla__slide__number">
                Slide {slide}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VerticalCarouselPage
