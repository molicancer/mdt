"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { marked } from 'marked';
import { HeaderNav } from '@/components/home/HeaderNav';
import { FooterNav } from '@/components/home/FooterNav';
import { BlurMasks } from '@/components/home/BlurMasks';
import { BackgroundLayer } from '@/components/home/BackgroundLayer';
import { getLatestIssue, getArticleContent, getAllCategories, getArticleDetail, ArticleData, ArticleDetail, Category } from '@/lib/api/apiAdapter';
import { IssueContent } from '@/types/issue';
import AnimatedHeroText from '@/components/AnimatedHeroText';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// 代表一篇文章的基本信息
interface Article {
  id: number;
  documentId: string;
  title: string;
  content: string;
  link?: string | null;
}

// 重新定义分组后的文章结构
interface CategoryWithArticles {
  id: number | string;
  name: string;
  sortOrder: number;
  articles: ArticleDetail[];
}

// 安全地将 Markdown 转换为 HTML
const markdownToHtml = (markdown: string): string => {
  try {
    // 使用 marked.parse 的同步方式
    return marked.parse(markdown, { async: false }) as string;
  } catch (error) {
    console.error('Markdown 解析错误:', error);
    return `<p>内容解析错误</p><p>${markdown}</p>`;
  }
};

const TestPage = () => {
  const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [isInInitialStage, setIsInInitialStage] = useState(true);
  
  // 分类和文章相关状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [articleDetails, setArticleDetails] = useState<ArticleDetail[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [categorizedArticles, setCategorizedArticles] = useState<CategoryWithArticles[]>([]);

  const issueHeaderRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const backgroundWrapperRef = useRef<HTMLDivElement>(null);

  // 获取最新期刊
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const latestIssue = await getLatestIssue();
        setCurrentContent(latestIssue);
      } catch (error) {
        console.error("Failed to fetch latest issue:", error);
      }
    };
    fetchLatest();
  }, []);

  // 获取分类、期刊详情和分类文章
  useEffect(() => {
    if (!currentContent) return;

    const fetchAllData = async () => {
      setIsLoadingDetails(true);
      
      try {
        // 1. 获取所有分类
        const allCategories = await getAllCategories();
        console.log("[调试] 所有分类:", allCategories);
        setCategories(allCategories);
        
        // 2. 获取期刊详情
        const response = await fetch(`http://172.16.7.55:1337/api/issues/${currentContent.documentId}?populate=*`);
        if (!response.ok) {
          throw new Error(`获取期刊详情失败: ${response.status}`);
        }
        
        const issueData = await response.json();
        console.log("[调试] 期刊详情:", issueData);
        
        if (!issueData.data || !issueData.data.articles || !issueData.data.articles.length) {
          console.log("[调试] 期刊中没有文章");
          setIsLoadingDetails(false);
          return;
        }
        
        // 3. 获取每篇文章的详情（带分类）
        const articlesInIssue = issueData.data.articles;
        const detailPromises = articlesInIssue.map((article: any) => 
          getArticleDetail(article.documentId)
        );
        
        const articleDetailsWithCategories = await Promise.all(detailPromises);
        console.log("[调试] 文章详情:", articleDetailsWithCategories);
        
        // 过滤掉 null 项
        const validArticleDetails = articleDetailsWithCategories.filter(
          (article): article is ArticleDetail => article !== null
        );
        
        setArticleDetails(validArticleDetails);
        
        // 4. 按分类对文章进行分组
        await organizeArticlesByCategory(validArticleDetails, allCategories);
      } catch (error) {
        console.error("获取数据失败:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    
    // 5. 同时获取原始的文章内容（作为备用）
    const fetchArticleContent = async () => {
      if (isLoadingArticle) return;
      
      setIsLoadingArticle(true);
      try {
        const data = await getArticleContent(currentContent.number);
        setArticleData(data);
      } catch (error) {
        console.error("获取文章内容失败:", error);
      } finally {
        setIsLoadingArticle(false);
      }
    };
    
    fetchAllData();
    fetchArticleContent();
  }, [currentContent]);
  
  // 重新实现按分类分组的逻辑
  const organizeArticlesByCategory = async (
    articles: ArticleDetail[], 
    allCategories: Category[]
  ) => {
    console.log("[调试] 开始分组文章...");
    console.log("[调试] 文章数:", articles.length);
    console.log("[调试] 分类数:", allCategories.length);
    
    // 按分类ID为key创建映射
    const categoryMap = new Map<number, Category>();
    allCategories.forEach(cat => categoryMap.set(cat.id, cat));
    
    // 初始化所有已知分类的数组
    const categorized: CategoryWithArticles[] = allCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      sortOrder: cat.sort_order || 999,
      articles: []
    }));
    
    // 添加"其他"分类
    const otherCategory: CategoryWithArticles = {
      id: "other",
      name: "其他",
      sortOrder: 1000,
      articles: []
    };
    
    // 遍历所有文章，放入对应分类
    for (const article of articles) {
      if (article.category && categoryMap.has(article.category.id)) {
        // 找到对应的分类，添加文章
        const catIndex = categorized.findIndex(c => c.id === article.category!.id);
        if (catIndex >= 0) {
          categorized[catIndex].articles.push(article);
        }
      } else {
        // 没有分类的放入"其他"
        otherCategory.articles.push(article);
      }
    }
    
    // 添加"其他"分类（如果有文章）
    if (otherCategory.articles.length > 0) {
      categorized.push(otherCategory);
    }
    
    // 过滤掉没有文章的分类，并按排序顺序排列
    const finalCategories = categorized
      .filter(cat => cat.articles.length > 0)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    console.log("[调试] 分组结果:", finalCategories);
    setCategorizedArticles(finalCategories);
  };

  useEffect(() => {
    if (!currentContent || !issueHeaderRef.current || !contentContainerRef.current || !volRef.current || !coverRef.current || !numberRef.current || !heroRef.current || !backgroundWrapperRef.current) return;

    const headerEl = issueHeaderRef.current;
    const containerEl = contentContainerRef.current;
    const coverEl = coverRef.current;
    const volEl = volRef.current;
    const numEl = numberRef.current;
    const backgroundWrapperEl = backgroundWrapperRef.current;

    gsap.set(coverRef, { opacity: 0 });
    gsap.set(volEl, { x: -150 });
    gsap.set(numEl, { x: 150 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerEl,
        start: "top 100%",
        end: "top 50%",
        scrub: true,
        id: "issueHeaderAnimate",
        // markers: true
      }
    });
    

    tl.to(coverEl, {
      opacity: 1,
      ease: "none"
    }, 0);

    tl.to([volEl, numEl], {
      opacity: 1,
      x: 0,
      ease: "power1.out",
    }, 0.5);

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: headerEl,
        start: "center 50%",
        end: "bottom top",
        scrub: true,
        id: "headerScaleTrigger",
        // markers: true,
        onLeave: (self) => {
          // 当离开触发区域时，将头部固定在视口顶部
          gsap.set(headerEl, { 
            position: "fixed",
            top: "0",
            left: "50%",
            xPercent: -50,
            scale: 0.3,
            yPercent: 0,
            zIndex: 100
          });
        },
        onEnterBack: (self) => {
          // 当重新进入触发区域时，恢复原始状态
          gsap.set(headerEl, { 
            clearProps: "position,top,left,xPercent,zIndex" 
          });
        }
      }
    });

    tl2.to(headerEl, {
      yPercent: 0,
      scale: 0.3,
      ease: "none"
    }, 0);

    tl.to(backgroundWrapperEl, {
      opacity: 0,
      ease: "none"
    }, 0);

    return () => {
      ScrollTrigger.getById("issueHeaderAnimate")?.kill();
      tl.kill();
      gsap.set(headerEl, { clearProps: "opacity" });
      gsap.set([volEl, numEl], { clearProps: "x" });
      ScrollTrigger.getById("headerScaleTrigger")?.kill();
      gsap.set(coverEl, { clearProps: "opacity" });
      gsap.set([volEl, numEl], { clearProps: "opacity,x" });
      gsap.set(backgroundWrapperEl, { clearProps: "opacity" });
    };

  }, [currentContent]);

  // Snap scrolling logic using ScrollTrigger (replaces Observer)
  useEffect(() => {
    // Ensure both refs are available
    if (!heroRef.current || !contentContainerRef.current) return;

    const heroEl = heroRef.current;
    const containerEl = contentContainerRef.current;

    // --- DEBUGGING --- 
    console.log("Initializing snapScroll. Refs:", { heroEl, containerEl });
    // --- END DEBUGGING ---

    // Define snap points
    const scrollTopY = 0;
    const scrollContentY = containerEl.offsetTop - window.innerHeight * 0.5;

    // --- DEBUGGING --- 
    console.log("Calculated snap points:", { scrollTopY, scrollContentY });
    if (isNaN(scrollContentY)) {
      console.error("scrollContentY calculation resulted in NaN!");
      return; // Prevent setting up trigger with bad value
    }
    // --- END DEBUGGING ---

    let isSnapping = false; // Flag to prevent re-triggering during snap animation

    const snapTrigger = ScrollTrigger.create({
      trigger: heroEl,
      start: "top top", // Trigger when hero top meets viewport top
      markers: true, // <<< ENABLED MARKERS FOR DEBUGGING

      // Callback when scrolling DOWN past the start trigger point
      onEnter: (self) => {
        console.log("SnapTrigger: onEnter fired. Direction:", self.direction); // <<< DEBUG LOG
        if (isSnapping || gsap.isTweening(window) || self.direction !== 1) return;

        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - scrollContentY) > 5) {
          isSnapping = true;
          setIsInInitialStage(false);
          gsap.to(window, {
            scrollTo: { y: scrollContentY, autoKill: false },
            duration: 0.8,
            ease: "power2.inOut",
            overwrite: true,
            onComplete: () => { ScrollTrigger.refresh(); isSnapping = false; },
            onInterrupt: () => { isSnapping = false; }
          });
        }
      },

      // Callback when scrolling UP past the start trigger point
      onLeaveBack: (self) => {
        console.log("SnapTrigger: onLeaveBack fired. Direction:", self.direction); // <<< DEBUG LOG
        if (isSnapping || gsap.isTweening(window) || self.direction !== -1) return;

        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - scrollTopY) > 5) {
          isSnapping = true;
          setIsInInitialStage(true);
          gsap.to(window, {
            scrollTo: { y: scrollTopY, autoKill: false },
            duration: 0.8,
            ease: "power2.inOut",
            overwrite: true,
            onComplete: () => { ScrollTrigger.refresh(); isSnapping = false; },
            onInterrupt: () => { isSnapping = false; }
          });
        }
      },
      id: "snapScroll"
    });

    return () => {
      console.log("Cleaning up snapScroll trigger"); // <<< DEBUG LOG
      snapTrigger?.kill();
      gsap.killTweensOf(window);
    };

  }, [currentContent]); // Rerun when content loads/refs change

  if (!currentContent) {
    return <div className="min-h-screen flex items-center justify-center">Loading Issue...</div>;
  }

  return (
    <div className="relative w-full">
      {/* Wrapper div for fixed positioning with ref */}
      <div ref={backgroundWrapperRef} className="fixed inset-0 body-background">
        <BackgroundLayer isInitialStage={isInInitialStage} />
      </div>
      <HeaderNav />
      <FooterNav />
      <BlurMasks />
      <div ref={heroRef} className="h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <AnimatedHeroText />
      </div>

      <div ref={contentContainerRef} className="max-w-3xl mx-auto h-screen mt-50">
        <div ref={issueHeaderRef} className="flex items-center sticky top-10 origin-top z-100 -translate-y-1/2">
          <div ref={volRef} className="flex-none w-3xs text-[120px] text-right font-newyork-large opacity-0">Vol</div>
          <div ref={coverRef} className="grow flex justify-center opacity-0">
            <Image src={currentContent.icon || "/test.png"} alt="cover" width={200} height={200} />
          </div>
          <div ref={numberRef} className="flex-none w-3xs text-[120px] text-left font-newyork-large opacity-0">{currentContent.number.toString().padStart(2, '0')}</div>
        </div>

        <div className="w-full text-center mb-12">
          <p className="font-newyork-large text-base mb-3.5">
            ✨ The biggest topic of Issue {currentContent.number.toString().padStart(2, '0')}
          </p>
          <h3 className="w-3xl text-2xl mx-auto font-newyork-large font-semibold">
            {currentContent.title}
          </h3>
        </div>

        {/* 文章内容区域 - 按分类显示 */}
        <div className="text-foreground z-10 sticky top-44 pb-50">
          {isLoadingDetails ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
              加载分类文章中...
            </div>
          ) : categorizedArticles.length > 0 ? (
            <div className="space-y-12">
              {/* 调试信息 */}
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-900/50 rounded">
                <div>已加载分类数: {categorizedArticles.length}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categorizedArticles.map(cat => (
                    <span key={cat.id} className="px-2 py-1 bg-gray-800 rounded text-gray-300">
                      {cat.name} ({cat.articles.length})
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Render articles by category */}
              {categorizedArticles.map(category => (
                <div key={category.id} className="mb-12">
                  {/* Category header */}
                  <div className="border-b border-gray-700 pb-2 mb-6">
                    <h2 className="text-2xl font-bold font-newyork-large tracking-wider">
                      {category.name}
                    </h2>
                  </div>
                  
                  {/* Articles in this category */}
                  <div className="space-y-6">
                    {category.articles.map(article => (
                      <div key={article.documentId} className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <h3 className="text-xl font-medium mb-3 font-newyork-large">{article.title}</h3>
                        
                        {article.excerpt && (
                          <p className="text-sm text-gray-300 mb-4 opacity-80">{article.excerpt}</p>
                        )}
                        
                        {/* Article content as HTML */}
                        {article.content && (
                          <div 
                            className="prose prose-sm prose-invert max-w-none mb-4"
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }}
                          />
                        )}
                        
                        {/* External link if available */}
                        <div className="text-sm text-gray-400 flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                          {article.link ? (
                            <a 
                              href={article.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-400 hover:underline flex items-center"
                            >
                              <span className="mr-1">阅读原文</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <div>无外部链接</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : isLoadingArticle ? (
            <div className="text-center py-12">Loading Article...</div>
          ) : articleData ? (
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: articleData.content }}
            />
          ) : (
            <div className="text-center py-12">Article content not available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;