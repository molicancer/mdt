import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useAnimationStore } from "@/store/animationStore";
import { ANIMATION_CONFIG } from '@/config/animationConfig';

export const HeroTitle = forwardRef<HTMLDivElement>(
  function HeroTitle(_, ref) {
    // 从状态存储获取可见性状态
    const isVisible = useAnimationStore(state => state.isVisible);

    return (
      <motion.div
        ref={ref}
        className="flex flex-col items-center justify-center min-h-screen mx-auto relative will-change-transform"
        initial={{ y: 0 }}
        animate={{ 
          y: isVisible ? 0 : "-100vh",
          opacity: isVisible ? 1 : 0
        }}
        transition={ANIMATION_CONFIG.presets.title.transition}
      >
        <h1 className="text-[118px]/[110px] font-newyork-large text-center relative">
          Design
          <span className="text-[64px] text-zinc-300 absolute ml-3 -mt-3">&</span><br />
          Inspiration
        </h1>
      </motion.div>
    );
  }
); 