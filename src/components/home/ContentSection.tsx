import { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import Image from 'next/image';
import { IssueContent } from "@/types/issue";
import { getAllIssues, getIssueByNumber, getArticleContent, ArticleData } from "@/lib/api/issueApi";
import { useAnimationStore } from "@/store/animationStore";
import { ANIMATION_CONFIG, SCROLL_THRESHOLDS } from '@/config/animationConfig';

export const ContentSection = forwardRef<HTMLDivElement>(
  function ContentSection(_, ref) {
    // 从 Zustand 获取 browseMode 和 activeIssue
    const { activeIssue } = useUIStore();
    
    // 从 animationStore 获取 scrollProgress、isInitialStage 和 isArticleReading
    const scrollProgress = useAnimationStore(state => state.scrollProgress);
    const isInitialStage = useAnimationStore(state => state.isInitialStage);
    const isArticleReading = useAnimationStore(state => state.isArticleReading);
    
    // 状态: 期刊数据
    const [issues, setIssues] = useState<IssueContent[]>([]);
    
    // 状态: 当前内容
    const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
    
    // 状态: 文章详细内容
    const [articleData, setArticleData] = useState<ArticleData | null>(null);
    
    // 状态: 文章内容加载状态
    const [isLoading, setIsLoading] = useState(false);
    
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
    
    // 监听文章阅读状态变化，获取文章详细内容
    useEffect(() => {
      const fetchArticleContent = async () => {
        if (isArticleReading && currentContent && !articleData) {
          try {
            setIsLoading(true);
            const data = await getArticleContent(currentContent.number);
            setArticleData(data);
          } catch (error) {
            console.error("获取文章内容失败", error);
          } finally {
            setIsLoading(false);
          }
        }
      };
      
      fetchArticleContent();
    }, [isArticleReading, currentContent, articleData]);
    
    if (!currentContent) return null;
    
    return (
      <>
        {/* 期数指示器和标题容器 */}
        <motion.div 
          ref={ref}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-[21] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: scrollProgress > SCROLL_THRESHOLDS.CONTENT_SHOW ? 1 : 0,
            top: isArticleReading ? 0 : '50%',
            marginTop: isArticleReading ? '120px' : 0
          }}
          transition={ANIMATION_CONFIG.presets.issueHeader.transition}
        >
          {/* 期数标题部分 */}
          <motion.div 
            className="flex items-center justify-center" 
            animate={{
              scale: isArticleReading ? 0.27 : 1
            }}
            transition={ANIMATION_CONFIG.presets.issueHeader.transition}
          >
            {/* Vol 文字 */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -150 }}
              animate={{
                opacity: isInitialStage ? 0 : 1,
                x: isInitialStage ? -150 : 0,
              }}
              transition={ANIMATION_CONFIG.presets.issueHeader.transition}
            >
              <h2 className={`${ANIMATION_CONFIG.volNumber.base.fontFamily} leading-none`} style={{ fontSize: `${ANIMATION_CONFIG.volNumber.base.fontSize}px` }}>Vol</h2>
            </motion.div>
            
            {/* 图标 */}
            <AnimatePresence>
              <motion.div 
                key={`icon-${currentContent.number}`}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                }}
                transition={ANIMATION_CONFIG.presets.issueHeader.transition}
                className="flex-shrink-0 -mx-4"
              >
                <Image src={currentContent.icon} alt={`vol${currentContent?.number}`} width={200} height={200} />
              </motion.div>
            </AnimatePresence>
            
            {/* 期数 */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: 150 }}
              animate={{
                opacity: isInitialStage ? 0 : 1,
                x: isInitialStage ? 150 : 0,
              }}
              transition={ANIMATION_CONFIG.presets.issueHeader.transition}
            >
              <h2 className={`${ANIMATION_CONFIG.volNumber.base.fontFamily} leading-none`} style={{ fontSize: `${ANIMATION_CONFIG.volNumber.base.fontSize}px` }}>{currentContent.number}</h2>
            </motion.div>
          </motion.div>
          
          {/* 文章标题区域 */}
          <div className="w-full text-center mt-8 pointer-events-none">
            {/* 第一行文字 - 在文章阅读模式下隐藏 */} 
            <motion.p 
              className="font-newyork-large text-base mb-3.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isInitialStage || isArticleReading ? 0 : 1,
                y: isInitialStage ? 30 : 0
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              ✨ The biggest topic of Issue {currentContent.number}
            </motion.p>

            {/* 文章标题 - 在文章阅读模式下缩小并移动到顶部 */} 
            <motion.h3 
              className="w-3xl text-2xl mx-auto font-newyork-large font-semibold"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isInitialStage ? 0 : (
                  isArticleReading ? 0 : 1
                ),
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {currentContent.title}
            </motion.h3>
          </div>
        </motion.div>

        {/* 文章内容区域 - 移到外部，作为兄弟元素 */}
        <motion.div
          className="fixed w-3xl mx-auto top-75 inset-0 overflow-y-auto z-20 pointer-events-auto" // 使用 pt-32 留出顶部空间给 Header
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isArticleReading ? 1 : 0,
            display: isArticleReading ? "block" : "none"
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.h3 
            className="text-4xl mx-auto font-newyork-large font-semibold mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isInitialStage ? 0 : 1,
              y: isInitialStage ? 50 : 0,
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {currentContent.title}
          </motion.h3>
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loading-spinner"></div>
              </div>
            ) : articleData ? (
              <div className="article-content">
                {/* 
                <div className="flex justify-between items-center">
                  <div className="article-meta">
                    <p className="text-sm text-gray-500">
                      {new Date(articleData.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-base text-gray-700">{articleData.author}</p>
                  </div>
                </div>
                */}
                <div 
                  className="prose prose-lg max-w-none" 
                  dangerouslySetInnerHTML={{ __html: articleData.content }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">加载文章内容中...</p>
              </div>
            )}
          </div>
        </motion.div>
      </>
    );
  }
); 