import { useAnimationStore } from "@/store/animationStore";
import { motion } from "framer-motion";

export function BlurMasks() {
  const isArticleReading = useAnimationStore(state => state.isArticleReading);
  
  return (
    <>
      <motion.div
        className="blur-mask-top pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isArticleReading ? 0 : 1
        }}
      >
      </motion.div>
      <div className="blur-mask-bottom pointer-events-none"></div>
      {/* <div className="blur-mask-left pointer-events-none"></div> */}
      {/* <div className="blur-mask-right pointer-events-none"></div> */}
    </>
  );
} 