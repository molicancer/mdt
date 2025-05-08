'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { useAnimationStore } from "@/store/animationStore";
import { useI18n } from "@/i18n";

export function ScrollDownIndicator() {
  const { t } = useI18n();
  const isVisible = useAnimationStore((state) => state.isInitialStage);

  return (
    <motion.div 
      className="fixed bottom-0 w-full z-31 mb-15 mx-auto flex flex-col gap-2 items-center pointer-events-none"
      initial={{ opacity: 1, y: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20
      }}
      transition={{ 
        duration: 0.25,
        ease: "easeInOut"
      }}
    >
      <motion.div
        animate={{ 
          y: [0, -6, 0],
        }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Image 
          src="/icon/swipe-down.svg"
          alt="Scroll Down"
          width={24}
          height={40}
          className="object-contain dark:invert"
        />
      </motion.div>
      <p className="text-sm text-[#545454]">
        {t('home.swipeDown')}
      </p>
    </motion.div>
  );
}