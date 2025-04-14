import { FunctionComponent } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useAnimationStore } from "@/store/animationStore";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

export const InfoText: FunctionComponent = () => {
  // 从状态存储获取所需状态
  const isVisible = useAnimationStore(state => state.isVisible);
  const { browseMode } = useUIStore();

  return (
    <motion.div 
      className="fixed w-full text-center flex justify-center"
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20
      }}
      transition={ANIMATION_CONFIG.presets.infoText.transition}
      style={{ 
        top: 'calc(50vh + 140px)',
        opacity: browseMode ? 0 : 1,
        transition: 'opacity 0.5s ease'
      }}
    >
      <p className="text-base text-[#545454] px-4 text-center relative">
        Share the latest design and artificial intelligence consulting<span className="text-black">「 weekly news 」</span><br />
        Updated once a Monday morning
      </p>
    </motion.div>
  );
}; 