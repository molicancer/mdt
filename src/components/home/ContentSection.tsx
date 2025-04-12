import { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import Image from 'next/image';
import { IssueContent } from "@/types/issue";
import { getAllIssues, getIssueByNumber } from "@/lib/api/issueApi";
import { useAnimationStore } from "@/store/animationStore";

// 无需传递props的组件
export const ContentSection = forwardRef<HTMLDivElement>(
  function ContentSection(_, ref) {
    // 从 Zustand 获取 browseMode 和 activeIssue
    const { browseMode, activeIssue } = useUIStore();
    
    // 从 animationStore 获取 scrollProgress
    const scrollProgress = useAnimationStore(state => state.scrollProgress);
    
    // 状态: 期刊数据
    const [issues, setIssues] = useState<IssueContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // 状态: 当前内容
    const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
    const [prevContent, setPrevContent] = useState<IssueContent | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // 内容淡入淡出动画状态
    const [contentFadeState, setContentFadeState] = useState("visible"); // "fading-out", "fading-in", "visible"
    const [pendingContent, setPendingContent] = useState<IssueContent | null>(null);
    
    // 加载所有期刊数据
    useEffect(() => {
      const fetchIssues = async () => {
        try {
          setIsLoading(true);
          const data = await getAllIssues();
          setIssues(data);
          setIsLoading(false);
        } catch (error) {
          console.error("获取期刊数据失败", error);
          setIsLoading(false);
        }
      };
      
      fetchIssues();
    }, []);
    
    // 监听期数变化
    useEffect(() => {
      if (issues.length === 0) return;
      
      const fetchIssue = async () => {
        try {
          // 找到对应的内容
          const targetContent = issues.find(item => item.number === activeIssue);
          
          if (!targetContent && activeIssue) {
            // 如果当前activeIssue找不到对应内容，尝试从API获取
            const fetchedIssue = await getIssueByNumber(activeIssue);
            if (fetchedIssue) {
              handleContentChange(fetchedIssue);
              return;
            }
          }
          
          // 有匹配的内容
          if (targetContent) {
            handleContentChange(targetContent);
            return;
          }
          
          // 如果没有匹配的内容且currentContent为空，使用第一个
          if (!currentContent && issues.length > 0) {
            const defaultIssue = issues[0];
            setCurrentContent(defaultIssue);
          }
        } catch (error) {
          console.error("获取期刊内容失败", error);
        }
      };
      
      fetchIssue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIssue, issues, currentContent]);
    
    // 处理内容变化的逻辑
    const handleContentChange = (targetContent: IssueContent) => {
      // 首次加载，直接设置
      if (!currentContent) {
        setCurrentContent(targetContent);
        return;
      }
      
      // 已有内容且期数变化了，触发过渡
      if (currentContent.number !== targetContent.number) {
        console.log(`开始切换: ${currentContent.number} -> ${targetContent.number}`);
        
        // 标记过渡开始，保存上一个内容
        setPrevContent(currentContent);
        setIsTransitioning(true);
        
        // 先将当前内容淡出
        setContentFadeState("fading-out");
        setPendingContent(targetContent);
      }
    };
    
    // 处理内容淡入淡出
    useEffect(() => {
      if (contentFadeState === "fading-out") {
        // 内容淡出动画结束后，设置新内容并开始淡入
        const timer = setTimeout(() => {
          if (pendingContent) {
            setCurrentContent(pendingContent);
            setContentFadeState("fading-in");
          }
        }, 300); // 淡出时间
        
        return () => clearTimeout(timer);
      } 
      else if (contentFadeState === "fading-in") {
        // 淡入动画结束后，设置为可见状态
        const timer = setTimeout(() => {
          setContentFadeState("visible");
          setIsTransitioning(false);
          setPrevContent(null);
        }, 500); // 淡入时间
        
        return () => clearTimeout(timer);
      }
    }, [contentFadeState, pendingContent]);
    
    if (isLoading) return <div className="fixed inset-0 flex items-center justify-center">加载中...</div>;
    if (!currentContent) return null;
    
    // 内容透明度，根据淡入淡出状态确定
    const contentOpacity = 
      contentFadeState === "fading-out" ? 0 : 
      contentFadeState === "fading-in" ? 1 : 1;
    
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
        initial={{ 
          opacity: 0,
        }}
        animate={{ 
          opacity: browseMode ? 1 : (scrollProgress > 0.2 ? 1 : 0),
        }}
        transition={{ 
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* 颜色区域整体容器 - 浏览模式下隐藏 */}
        <motion.div 
          className="flex justify-center relative"
          initial={{ opacity: 1, visibility: "visible" }}
          animate={{ 
            opacity: browseMode ? 0 : 1,
            visibility: browseMode ? "hidden" : "visible"
          }}
          transition={{ 
            duration: 0.7,
            visibility: { delay: browseMode ? 0.7 : 0 }
          }}
        >
          {/* 主颜色区域 - 悬停触发区域限制在这个div内 */}
          <motion.div 
            className="w-full max-w-md relative pointer-events-auto"
            initial="initial"
            whileHover="hover"
          >
            {/* 可视的颜色块 */}
            <motion.div
              className="rounded-2xl w-full cursor-pointer"
              style={{ backgroundColor: currentContent.color }}
              variants={{
                initial: { height: 300 },
                hover: { height: 450 }
              }}
              transition={{ 
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              {/* 过渡层 - 仅在切换期数时显示 */}
              <AnimatePresence>
                {isTransitioning && prevContent && (
                  <motion.div 
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    initial={{ opacity: 1 }}
                    animate={{ 
                      opacity: contentFadeState === "fading-out" ? 1 : 0
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    style={{
                      backgroundColor: prevContent.color,
                      zIndex: 1
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* 文字内容 - 仅在悬停时显示/移动 */}
            <motion.div 
              className="absolute w-full pointer-events-none"
              variants={{
                initial: { top: '340px', zIndex: 1 },
                hover: { top: '0', zIndex: 10 }
              }}
              transition={{ 
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <div className="w-full text-center">
                <motion.div 
                  className="mb-3 text-sm font-medium"
                  variants={{
                    initial: { transform: "translateY(0)" },
                    hover: { transform: "translateY(150px)" }
                  }}
                  transition={{ 
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.05
                  }}
                >
                  这周有什么新鲜事 👀 ?
                </motion.div>
                <motion.h3 
                  className="text-3xl font-newyork font-bold mb-1"
                  variants={{
                    initial: { transform: "translateY(0)" },
                    hover: { transform: "translateY(150px)" }
                  }}
                  transition={{ 
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.1
                  }}
                >
                  {currentContent.title}
                </motion.h3>
                <motion.p 
                  className="text-xl font-newyork text-gray-700 mb-4"
                  variants={{
                    initial: { transform: "translateY(0)" },
                    hover: { transform: "translateY(150px)" }
                  }}
                  transition={{ 
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.15
                  }}
                >
                  {currentContent.subtitle}
                </motion.p>
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
                  {currentContent.items.map((item, index) => (
                    <motion.p 
                      key={index} 
                      className="text-base"
                      variants={{
                        initial: { y: 150 + index * 20, opacity: 0 }, // 每个项目的起始位置不同，越后越低
                        hover: { 
                          y: 150, // 所有项目的结束位置相同
                          opacity: 1,
                          transition: {
                            duration: 1.2,
                            ease: [0.16, 1, 0.3, 1], // 使用弹簧曲线
                            delay: index * 0.08 // 微小延迟差异，足以产生手风琴效果
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
                            ease: [0.16, 1, 0.3, 1], // 弹簧曲线
                            delay: currentContent.items.length * 0.08 + 0.1 // 延迟最大
                          }
                        }
                      }}
                    >
                      {currentContent.author}
                    </motion.p>
                  )}
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
            opacity: contentFadeState === "visible" ? 1 : contentOpacity
          }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <motion.div 
            className="w-full max-w-md flex items-center justify-center"
            initial={{ height: 300, opacity: 1 }}
            animate={{ 
              height: browseMode ? 150 : 300,
              opacity: contentFadeState === "visible" ? 1 : contentOpacity
            }}
            transition={{ 
              duration: 0.7,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <motion.div 
              initial={{ scale: 1 }}
              animate={{ 
                scale: browseMode ? 0.7 : 1
              }}
              transition={{ 
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              {renderIcon(currentContent.icon)}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }
); 