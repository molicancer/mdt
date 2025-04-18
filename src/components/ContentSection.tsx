import { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';

// 状态管理
import { useUIStore } from "@/store/uiStore";
import { useAnimationStore } from "@/store/animationStore";

// 数据类型和API
import { IssueContent } from "@/types/issue";
import { getAllIssues, getIssueByNumber, getArticleContent, ArticleData } from "@/lib/api/apiAdapter";

// 动画配置
const issueHeaderTransition = { duration: 0.7, ease: [0.4, 0, 0.2, 1] };

export const ContentSection = forwardRef<HTMLDivElement>(
  function ContentSection(_, ref) {
    // ========== 状态管理 ==========
    
    // Zustand全局状态
    const { activeIssue } = useUIStore();
    const scrollProgress = useAnimationStore(state => state.scrollProgress);
    const isInitialStage = useAnimationStore(state => state.isInitialStage);
    const isArticleReading = useAnimationStore(state => state.isArticleReading);
    
    // 本地状态
    const [issues, setIssues] = useState<IssueContent[]>([]); // 期刊列表数据
    const [currentContent, setCurrentContent] = useState<IssueContent | null>(null); // 当前显示的期刊
    const [articleData, setArticleData] = useState<ArticleData | null>(null); // 文章详细内容
    const [isLoading, setIsLoading] = useState(false); // 加载状态
    
    // ========== 数据加载 ==========
    
    // 加载期刊数据并处理期数变化
    useEffect(() => {
      const loadContent = async () => {
        try {
          // 1. 首次加载期刊列表
          if (issues.length === 0) {
            const data = await getAllIssues();
            setIssues(data);
            
            // 如果有指定期数，查找对应内容
            if (activeIssue) {
              const targetIssue = data.find(item => item.number === activeIssue);
              if (targetIssue) {
                setCurrentContent(targetIssue);
                return;
              }
            }
            
            // 默认显示第一期
            if (data.length > 0 && !currentContent) {
              setCurrentContent(data[0]);
            }
            return;
          }
          
          // 2. 处理期数切换
          if (activeIssue) {
            // 从已加载数据中查找
            const targetContent = issues.find(item => item.number === activeIssue);
            
            if (targetContent) {
              setCurrentContent(targetContent);
            } else {
              // 未找到则重新请求
              const fetchedIssue = await getIssueByNumber(activeIssue);
              if (fetchedIssue) {
                setCurrentContent(fetchedIssue);
              }
            }
          } else if (!currentContent && issues.length > 0) {
            // 无指定期数时默认第一期
            setCurrentContent(issues[0]);
          }
        } catch (error) {
          console.error("获取期刊数据失败", error);
        }
      };
      
      loadContent();
    // 依赖项仅包含需要触发重新加载的状态
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIssue, issues.length]);
    
    // 加载文章详细内容
    useEffect(() => {
      const fetchArticleContent = async () => {
        // 仅在进入阅读模式且未加载过内容时获取
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
    
    // 内容未加载时不渲染
    if (!currentContent) return null;
    
    // ========== 渲染UI ==========
    return (
      <>
        {/* 期数标题区域 - 位于页面中央，阅读时缩小并移至顶部 */}
        <motion.div 
          ref={ref}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-[21] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: scrollProgress > 0.03 ? 1 : 0,
            top: isArticleReading ? 0 : '50%',
            marginTop: isArticleReading ? '120px' : 0
          }}
          transition={issueHeaderTransition}
        >
          {/* Vol + 图标 + 期数 组合 */}
          <motion.div 
            className="flex items-center justify-center" 
            animate={{
              scale: isArticleReading ? 0.27 : 1
            }}
            transition={issueHeaderTransition}
          >
            {/* "Vol" 文字 */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -150 }}
              animate={{
                opacity: isInitialStage ? 0 : 1,
                x: isInitialStage ? -150 : 0,
              }}
              transition={issueHeaderTransition}
            >
              <h2 className="text-[146px] font-newyork-large leading-none">Vol</h2>
            </motion.div>
            
            {/* 期刊图标 */}
            <AnimatePresence>
              <motion.div 
                key={`icon-${currentContent.number}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={issueHeaderTransition}
                className="flex-shrink-0 -mx-4"
              >
                <Image 
                  src={currentContent.icon} 
                  alt={`Vol ${currentContent.number} Cover`} 
                  width={200} 
                  height={200} 
                />
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
              transition={issueHeaderTransition}
            >
              <h2 className="text-[146px] font-newyork-large leading-none">
                {currentContent.number}
              </h2>
            </motion.div>
          </motion.div>
          
          {/* 标题区域 */}
          <div className="w-full text-center mt-8 pointer-events-none">
            {/* 主题介绍文本 - 阅读模式下隐藏 */} 
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

            {/* 期刊标题 - 阅读模式下隐藏 */} 
            <motion.h3 
              className="w-3xl text-2xl mx-auto font-newyork-large font-semibold"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isInitialStage ? 0 : (isArticleReading ? 0 : 1)
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {currentContent.title}
            </motion.h3>
          </div>
        </motion.div>

        {/* 文章内容区域 - 阅读模式下显示 */}
        <motion.div
          className="fixed w-3xl mx-auto top-75 inset-0 overflow-y-auto z-20 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isArticleReading ? 1 : 0,
            display: isArticleReading ? "block" : "none"
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* 文章标题 */}
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

          {/* 文章内容 */}
          <div>
            {isLoading ? (
              // 加载中状态
              <div className="flex justify-center items-center h-64">
                <div className="loading-spinner"></div>
              </div>
            ) : articleData ? (
              // 文章内容
              <div className="article-content">
                <div 
                  className="prose prose-lg max-w-none" 
                  dangerouslySetInnerHTML={{ __html: articleData.content }}
                />
              </div>
            ) : (
              // 空状态
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