import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useAnimationStore } from "@/store/animationStore";
import { SCROLL_THRESHOLDS } from "@/config/scrollThresholds";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

export function SelectIssueHint() {
  // 从Zustand获取状态
  const { browseMode } = useUIStore();
  const scrollProgress = useAnimationStore(state => state.scrollProgress);
  
  const isVisible = scrollProgress > SCROLL_THRESHOLDS.SELECT_HINT_SHOW && !browseMode;

  return (
    <motion.div 
      className="fixed z-31 top-40 left-1/2 transform -translate-x-1/2 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20
      }}
      transition={ANIMATION_CONFIG.presets.hintText.transition}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Select the issue number</span>
      </div>
    </motion.div>
  );
} 