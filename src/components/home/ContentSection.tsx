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
    
    // 从 animationStore 获取 scrollProgress
    const scrollProgress = useAnimationStore(state => state.scrollProgress);
    
    // 状态: 期刊数据
    const [issues, setIssues] = useState<IssueContent[]>([]);
    
    // 状态: 当前内容
    const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
    
    // hover状态
    const [isHovering, setIsHovering] = useState(false);
    
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
    const renderIcon = (iconUrl: string) => {
      return (
        <Image src={iconUrl} alt={`vol${currentContent?.number}`} width={200} height={200} />
      );
    };
    
    return (
      <motion.div 
        ref={ref}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-xl z-[21] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: browseMode ? 1 : (scrollProgress > SCROLL_THRESHOLDS.CONTENT_SHOW ? 1 : 0),
        }}
        transition={ANIMATION_CONFIG.presets.contentCard.transition}
      >
        {/* 颜色区域整体容器 - 浏览模式下隐藏 */}
        <motion.div 
          className="flex justify-center relative"
          initial={{ opacity: 1, visibility: "visible" }}
          animate={{ 
            opacity: browseMode ? 0 : 1,
            visibility: browseMode ? "hidden" : "visible"
          }}
          transition={ANIMATION_CONFIG.presets.contentCard.transition}
        >
          {/* 主颜色区域 - 悬停触发区域限制在这个div内 */}
          <motion.div 
            className="w-full max-w-md relative pointer-events-auto"
            initial="initial"
            whileHover="hover"
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            {/* 可视的颜色块 */}
            <motion.div
              className="rounded-2xl w-full cursor-pointer relative overflow-hidden"
              style={{ backgroundColor: currentContent.color }}
              variants={{
                initial: { height: 300 },
                hover: { height: 450 }
              }}
              transition={ANIMATION_CONFIG.presets.contentCard.transition}
              layoutId="colorBlock"
              key={currentContent.number}
            >
              {/* 内容过渡效果 */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`color-content-${currentContent.number}`}
                  className="absolute inset-0 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={ANIMATION_CONFIG.presets.contentCard.transition}
                  style={{ backgroundColor: currentContent.color }}
                />
              </AnimatePresence>
            </motion.div>
            
            {/* 文字内容 - 仅在悬停时显示/移动 */}
            <motion.div 
              className="absolute w-full pointer-events-none"
              variants={{
                initial: { top: '340px', zIndex: 1 },
                hover: { top: '0', zIndex: 10 }
              }}
              transition={ANIMATION_CONFIG.presets.contentCard.transition}
            >
              <div className="w-full text-center">
                <motion.div 
                  className="mb-3 text-sm font-medium"
                  variants={{
                    initial: { transform: "translateY(0)" },
                    hover: { transform: "translateY(150px)" }
                  }}
                  transition={ANIMATION_CONFIG.presets.contentCard.transition}
                >
                  这周有什么新鲜事 👀 ?
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={`title-${currentContent.number}`}
                    className="text-3xl font-newyork font-bold mb-1"
                    variants={{
                      initial: { transform: "translateY(0)" },
                      hover: { transform: "translateY(150px)" }
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={ANIMATION_CONFIG.presets.contentCard.transition}
                  >
                    {currentContent.title}
                  </motion.h3>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={`subtitle-${currentContent.number}`}
                    className="text-xl font-newyork text-gray-700 mb-4"
                    variants={{
                      initial: { transform: "translateY(0)" },
                      hover: { transform: "translateY(150px)" }
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={ANIMATION_CONFIG.presets.contentCard.transition}
                  >
                    {currentContent.subtitle}
                  </motion.p>
                </AnimatePresence>
                <motion.div 
                  className="space-y-1 text-center"
                  initial={{ opacity: 0 }}
                  variants={{
                    initial: { opacity: 0 },
                    hover: { 
                      opacity: 1,
                      transition: { 
                        staggerChildren: 0.1, 
                        delayChildren: 0.3 
                      }
                    }
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div key={`items-${currentContent.number}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {currentContent.items.map((item, index) => (
                        <motion.p 
                          key={index} 
                          className="text-base"
                          variants={{
                            initial: { y: 150 + index * 20, opacity: 0 },
                            hover: { 
                              y: 150,
                              opacity: 1,
                              transition: {
                                duration: 1.2,
                                ease: ANIMATION_CONFIG.font.ease,
                                delay: index * 0.08
                              }
                            }
                          }}
                        >
                          {item}
                        </motion.p>
                      ))}
                      {currentContent.author && (
                        <motion.p 
                          className="text-base text-gray-600 mt-4 opacity-70"
                          variants={{
                            initial: { y: 150 + currentContent.items.length * 20, opacity: 0 },
                            hover: { 
                              y: 150,
                              opacity: 0.7,
                              transition: {
                                duration: 1.2,
                                ease: ANIMATION_CONFIG.font.ease,
                                delay: currentContent.items.length * 0.08 + 0.1
                              }
                            }
                          }}
                        >
                          {currentContent.author}
                        </motion.p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* 图标部分 - 与颜色区域分离，以便在浏览模式下保持可见 */}
        <motion.div 
          className={`${browseMode ? 'fixed inset-x-0 z-30' : 'absolute left-0 w-full'} flex justify-center pointer-events-none`}
          initial={{ top: 0, transform: "translateY(0)", opacity: 1 }}
          animate={{ 
            top: browseMode ? '50%' : 0,
            transform: browseMode ? "translateY(-50%)" : "translateY(0)",
            opacity: 1
          }}
          transition={ANIMATION_CONFIG.presets.contentCard.transition}
        >
          <motion.div 
            className="w-full max-w-md flex items-center justify-center"
            initial={{ height: 300, opacity: 1 }}
            animate={{ 
              height: browseMode ? 150 : 300
            }}
            transition={ANIMATION_CONFIG.presets.contentCard.transition}
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={`icon-${currentContent.number}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isHovering && !browseMode ? 0.3 : 1,
                  scale: browseMode ? 0.7 : 1
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={ANIMATION_CONFIG.presets.contentCard.transition}
              >
                {renderIcon(currentContent.icon)}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }
); 