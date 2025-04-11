import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";

interface HeroTitleProps {
  titleTransform: number;    // 控制标题在Y轴上的位移距离
  titleOpacity: number;      // 控制标题的透明度
  isScrolling: boolean;      // 标记是否正在滚动
}

export const HeroTitle = forwardRef<HTMLDivElement, HeroTitleProps>(
  function HeroTitle({ titleTransform, titleOpacity, isScrolling }, ref) {
    const isVisible = useScrollVisibility({ threshold: 20 });

    return (
      <motion.div
        ref={ref}
        className="relative will-change-transform"
        initial={{ y: 0 }}
        animate={{ 
          y: isVisible ? 0 : "-100vh",
          opacity: isVisible ? 1 : 0
        }}
        transition={{ 
          type: "linear",
          duration: 1
        }}
      >
        <h1 className="text-[118px]/[110px] font-newyork-large text-center relative">
            Design
            <span className="text-[64px] text-zinc-300 absolute ml-3 -mt-3">&</span>
            Inspiration
        </h1>
      </motion.div>
    );
  }
); 