"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

const TestPage = () => {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    // 当向上滚动超过20px时，触发飞出效果
    if (latest > 20 && isVisible) {
      setIsVisible(false);
    } else if (latest <= 20 && !isVisible) {
      setIsVisible(true);
    }
  });
  
  return (
    <div className="min-h-[200vh] relative">
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black rounded-lg"
        initial={{ y: 0 }}
        animate={{ 
          y: isVisible ? 0 : "-100vh",
          opacity: isVisible ? 1 : 0
        }}
        transition={{ 
          type: "linear",
          duration: 1
        }}
      />
    </div>
  );
};

export default TestPage;
