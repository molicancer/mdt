import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useAnimationStore } from "@/store/animationStore";

export function SelectIssueHint() {
  // 从Zustand获取状态
  const { browseMode } = useUIStore();
  const scrollProgress = useAnimationStore(state => state.scrollProgress);
  
  return (
    <motion.div 
      className="fixed z-31 top-40 left-1/2 transform -translate-x-1/2 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: (scrollProgress > 0.1 && !browseMode) ? 1 : 0
      }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Select the issue number</span>
      </div>
    </motion.div>
  );
} 