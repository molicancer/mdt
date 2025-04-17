import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useAnimationStore } from "@/store/animationStore";

export const HeroTitle = forwardRef<HTMLDivElement>(
  function HeroTitle(_, ref) {
    const isVisible = useAnimationStore(state => state.isVisible);
    const titleTransform = useAnimationStore(state => state.titleTransform);
    const titleOpacity = useAnimationStore(state => state.titleOpacity);
    const isInitialStage = useAnimationStore(state => state.isInitialStage);

    return (
      <div className="relative flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center z-20">
          {/* 标题部分 - 会上移和渐隐 */}
          <motion.div
            ref={ref}
            className="flex flex-col items-center justify-center relative will-change-transform"
            animate={{ 
              y: -titleTransform,
              opacity: titleOpacity
            }}
            transition={{ 
              type: "spring", 
              stiffness: 120, 
              damping: 20 
            }}
          >
            <h1 className="text-[118px]/[110px] font-newyork-large text-center relative mb-4">
              Design
              <span className="text-[64px] text-zinc-300 absolute ml-3 -mt-3">&</span><br />
              Inspiration
            </h1>
          </motion.div>

          {/* InfoText部分 - 只会渐隐不会上移 */}
          <motion.div 
            className="w-full text-center mt-4"
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: isVisible && isInitialStage ? 1 : 0 
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
          >
            <p className="text-base text-[#545454] text-center relative">
              Share the latest design and artificial intelligence consulting<span className="text-black">「 weekly news 」</span><br />
              Updated once a Monday morning
            </p>
          </motion.div>
        </div>
      </div>
    );
  }
); 