import Image from "next/image";
import { motion } from "framer-motion";
import { useGlobalScrollVisibility } from "@/store/animationStore";

export function FooterNav() {
  const isVisible = useGlobalScrollVisibility();

  return (
    <motion.footer 
      className="fixed bottom-0 w-full z-31 mb-12 flex flex-col gap-2 items-center pointer-events-none"
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
          y: [0, -10, 0],
        }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Image 
          src="/img/mouse.svg"
          alt="Scroll Down"
          width={24}
          height={40}
          className="object-contain"
        />
      </motion.div>
      <p className="text-sm text-[#545454]">
        Swipe down to browse weekly news
      </p>
    </motion.footer>
  );
} 