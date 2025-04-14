import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from '@/config/animationConfig';

export function Loader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={ANIMATION_CONFIG.presets.loader.transition}
      >
        <motion.div
          className="h-12 w-12 mb-4 rounded-full border-2 border-t-transparent border-primary"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <p className="text-xl">加载中...</p>
      </motion.div>
    </div>
  );
} 