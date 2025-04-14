import { FunctionComponent } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useAnimationStore, useGlobalScrollVisibility } from "@/store/animationStore";
import { ANIMATION_CONFIG } from "@/config/animationConfig";

export const BrowseButton: FunctionComponent = () => {
  // 使用全局滚动可见性（自动会初始化滚动监听）
  useGlobalScrollVisibility();
  
  // 从状态存储获取所需状态
  const isVisible = useAnimationStore(state => state.isVisible);
  const { browseMode, activeIssue, toggleBrowseMode, scrollLocked } = useUIStore();
  
  // 点击按钮切换状态
  const handleToggle = () => {
    // toggleBrowseMode已在store内同时设置browseMode和scrollLocked
    toggleBrowseMode();
    console.log(`${browseMode ? '退出' : '进入'}浏览模式，滚动${scrollLocked ? '已锁定' : '已解锁'}`);
  };
  
  return (
    <motion.div 
      className="fixed flex justify-center w-full z-[100] pointer-events-auto"
      initial={{ bottom: '-100px' }}
      animate={{ 
        bottom: isVisible ? '-100px' : '60px',
        opacity: isVisible ? 0 : 1
      }}
      transition={ANIMATION_CONFIG.presets.browseButton.transition}
    >
        <motion.button 
          className="text-white bg-black hover:bg-gray-800 rounded-full px-12 py-4 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
        >
          {browseMode ? "返回" : `浏览 Vol ${activeIssue ?? '...'}`}
        </motion.button>
    </motion.div>
  );
}; 