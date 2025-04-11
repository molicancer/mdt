import Image from "next/image";
import { forwardRef } from "react";

interface HeroTitleProps {
  titleTransform: number;
  titleOpacity: number;
  isScrolling: boolean;
}

export const HeroTitle = forwardRef<HTMLDivElement, HeroTitleProps>(
  function HeroTitle({ titleTransform, titleOpacity, isScrolling }, ref) {
    return (
      <div
        ref={ref}
        className="relative will-change-transform"
        style={{ 
          transform: `translateY(-${titleTransform}px)`,
          transition: isScrolling ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: titleOpacity
        }}
      >
        <Image 
          src="/img/hero-title.svg" 
          alt="Design & Inspiration" 
          width={566} 
          height={220} 
          className="mx-auto" 
          priority
        />
      </div>
    );
  }
); 