import { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import Image from 'next/image';
import { IssueContent } from "@/types/issue";
import { getAllIssues, getIssueByNumber } from "@/lib/api/issueApi";
import { useAnimationStore } from "@/store/animationStore";
import { SCROLL_THRESHOLDS } from "@/config/scrollThresholds";
import { ANIMATION_CONFIG } from '@/config/animationConfig';

// 无需传递props的组件
export const ContentSection = forwardRef<HTMLDivElement>(
  function ContentSection(_, ref) {
    // 从 Zustand 获取 browseMode 和 activeIssue
    const { browseMode, activeIssue } = useUIStore();
    
    // 从 animationStore 获取 scrollProgress 和 isInitialStage
    const scrollProgress = useAnimationStore(state => state.scrollProgress);
    const isInitialStage = useAnimationStore(state => state.isInitialStage);
    
    // 状态: 期刊数据
    const [issues, setIssues] = useState<IssueContent[]>([]);
    
    // 状态: 当前内容
    const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
    
    // 加载期刊数据并处理期数变化
    useEffect(() => {
      const loadContent = async () => {
        try {
          // 如果issues为空，先获取所有期刊数据
          if (issues.length === 0) {
            const data = await getAllIssues();
            setIssues(data);
            
            // 如果有activeIssue，在加载的数据中查找对应内容
            if (activeIssue) {
              const targetIssue = data.find(item => item.number === activeIssue);
              if (targetIssue) {
                setCurrentContent(targetIssue);
                return;
              }
            }
            
            // 没有activeIssue或找不到对应内容时，使用第一个作为默认值
            if (data.length > 0 && !currentContent) {
              setCurrentContent(data[0]);
            }
            return;
          }
          
          // issues已加载，处理activeIssue变化
          if (activeIssue) {
            // 先从已加载的issues中查找
            const targetContent = issues.find(item => item.number === activeIssue);
            
            if (targetContent) {
              setCurrentContent(targetContent);
            } else {
              // 如果找不到，尝试单独获取
              const fetchedIssue = await getIssueByNumber(activeIssue);
              if (fetchedIssue) {
                setCurrentContent(fetchedIssue);
              }
            }
          } else if (!currentContent && issues.length > 0) {
            // 没有activeIssue但issues已加载，使用第一个作为默认值
            setCurrentContent(issues[0]);
          }
        } catch (error) {
          console.error("获取期刊数据失败", error);
        }
      };
      
      loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIssue, issues.length]);
    
    if (!currentContent) return null;
    
    // 渲染图标 - 直接使用图片URL
    
    return (
      <motion.div 
        ref={ref}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-[21] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: browseMode ? 1 : (scrollProgress > SCROLL_THRESHOLDS.CONTENT_SHOW ? 1 : 0),
        }}
        transition={ANIMATION_CONFIG.presets.contentCard.transition}
      >
        {/* 新增：垂直Flex容器，用于包裹图标和文字，并居中 */}
        <div className="fixed inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
          
          {/* 图标部分 - 作为Flex子项 */}
          <motion.div 
            className="flex items-center justify-center" 
            initial={{ opacity: 0 }}
            animate={{
              opacity: isInitialStage ? 0 : 1
            }}
            transition={ANIMATION_CONFIG.presets.contentCard.transition}
          >
            
            {/* Vol 文字 */}
            <motion.div 
              className="flex items-center mr-4"
              initial={{ opacity: 0, x: -150 }}
              animate={{
                opacity: isInitialStage ? 0 : 1,
                x: isInitialStage ? -150 : 0,
              }}
              transition={ANIMATION_CONFIG.presets.contentCard.transition}
            >
              <h2 className={`${ANIMATION_CONFIG.volNumber.base.fontFamily} leading-none`} 
                  style={{ 
                    fontSize: `${ANIMATION_CONFIG.volNumber.base.fontSize}px`
                  }}>
                Vol
              </h2>
            </motion.div>
            
            {/* 图标 */}
            <AnimatePresence>
              <motion.div 
                key={`icon-${currentContent.number}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={ANIMATION_CONFIG.presets.contentCard.transition}
                className="flex-shrink-0"
              >
                <Image src={currentContent.icon} alt={`vol${currentContent?.number}`} width={200} height={200} />
              </motion.div>
            </AnimatePresence>
            
            {/* 期数 */}
            <motion.div 
              className="flex items-center ml-4"
              initial={{ opacity: 0, x: 150 }}
              animate={{
                opacity: isInitialStage ? 0 : 1,
                x: isInitialStage ? 150 : 0,
              }}
              transition={ANIMATION_CONFIG.presets.contentCard.transition}
            >
              <h2 className={`${ANIMATION_CONFIG.volNumber.base.fontFamily} leading-none`} 
                  style={{ 
                    fontSize: `${ANIMATION_CONFIG.volNumber.base.fontSize}px`
                  }}>
                {currentContent.number}
              </h2>
            </motion.div>
          </motion.div>
          
          {/* 下方文字区域 - 作为Flex子项，移除绝对定位，添加上边距 */}
          <motion.div 
            className="w-full text-center mt-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isInitialStage ? 0 : 1
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* 第一行文字 */} 
            <motion.p 
              className="font-newyork-large text-base mb-3.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isInitialStage ? 0 : 1,
                y: isInitialStage ? 20 : 0
              }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
            >
              ✨ The biggest topic of Issue {currentContent.number}
            </motion.p>

            {/* 第二行文字 */} 
            <motion.h3 
              className="font-newyork-large text-2xl font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isInitialStage ? 0 : 1,
                y: isInitialStage ? 20 : 0
              }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeInOut" }}
            >
              {currentContent.title}
            </motion.h3>
          </motion.div>
        </div>

        {/* 中间内容区域 - 注释掉或按需保留 */}
        {/* <motion.div ... /> */}
      </motion.div>
    );
  }
); 