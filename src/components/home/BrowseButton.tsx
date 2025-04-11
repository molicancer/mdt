import { FunctionComponent } from "react";
import { motion } from "framer-motion";
import { useScrollVisibility } from "@/hooks/use-scroll-visibility";

interface BrowseButtonProps {
  scrollProgress: number; // 滚动进度
  activeIssue?: number; // 当前选中的期数
  browseMode?: boolean; // 是否处于浏览模式
  onBrowseClick?: () => void; // 浏览按钮点击事件
}

export const BrowseButton: FunctionComponent<BrowseButtonProps> = ({ 
  activeIssue = 54,
  browseMode = false,
  onBrowseClick
}) => {
  // 使用 useScrollVisibility 钩子，与 HeroTitle 使用相同的阈值
  const isVisible = useScrollVisibility();
  
  return (
    <motion.div 
      className="fixed flex justify-center w-full z-[100] pointer-events-auto"
      initial={{ bottom: '-100px' }}
      animate={{ 
        bottom: isVisible ? '-100px' : '60px'
      }}
      transition={{ 
        duration: 0.7, 
        ease: [0.4, 0, 0.2, 1]
      }}
    >
        <motion.button 
          className="text-white bg-black hover:bg-gray-800 rounded-full px-12 py-4 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBrowseClick}
        >
          {browseMode ? "返回" : `浏览 Vol ${activeIssue}`}
        </motion.button>
    </motion.div>
  );
}; 