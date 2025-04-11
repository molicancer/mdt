import { FunctionComponent } from "react";
import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";

interface InfoTextProps {
  browseMode?: boolean;
}

export const InfoText: FunctionComponent<InfoTextProps> = ({ 
  browseMode = false 
}) => {
  const isVisible = useScrollVisibility();

  return (
    <motion.div 
      className="fixed w-full text-center flex justify-center"
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.5,
        ease: "easeInOut"
      }}
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