"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { HeaderNav } from '@/components/home/HeaderNav';
import { FooterNav } from '@/components/home/FooterNav';
import { BlurMasks } from '@/components/home/BlurMasks';
import { BackgroundLayer } from '@/components/home/BackgroundLayer';
import { 
  getLatestIssue, 
  getIssueWithCategorizedArticles,
} from '@/lib/api/apiAdapter';
import { IssueContent, CategoryWithArticles } from '@/types/issue';
import AnimatedHeroText from '@/components/home/AnimatedHeroText';
import { markdownToHtml } from '@/lib/utils';
import { useScrollSnapAnimation } from '@/hooks/useScrollSnapAnimation';

const Home = () => {
  const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
  const [isInInitialStage, setIsInInitialStage] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [categorizedArticles, setCategorizedArticles] = useState<CategoryWithArticles[]>([]);

  // 创建所有需要的引用
  const issueHeaderRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const backgroundWrapperRef = useRef<HTMLDivElement>(null);
  const articlesContainerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const fixedBgRef = useRef<HTMLDivElement>(null);

  // 获取最新期刊
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const latestIssue = await getLatestIssue();
        setCurrentContent(latestIssue);
      } catch (error) {
        console.error("获取最新期刊失败:", error);
      }
    };
    fetchLatest();
  }, []);

  // 获取分类文章
  useEffect(() => {
    if (!currentContent) return;
    const fetchCategorizedData = async () => {
      setIsLoadingDetails(true);
      setCategorizedArticles([]);
      try {
        const data = await getIssueWithCategorizedArticles(currentContent.documentId);
        setCategorizedArticles(data);
      } catch (error) {
        console.error("获取分类文章数据失败:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };
        
    fetchCategorizedData();
  }, [currentContent]);

  // 使用自定义hook处理滚动和动画
  useScrollSnapAnimation({
    refs: {
      issueHeaderRef,
      contentContainerRef,
      volRef,
      coverRef,
      numberRef,
      titleTextRef,
      subtitleRef,
      heroRef,
      articlesContainerRef,
      fixedBgRef,
      backgroundWrapperRef
    },
    isContentLoaded: !!currentContent,
    setIsInInitialStage
  });

  if (!currentContent) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="relative w-full">
      <div ref={backgroundWrapperRef} className="fixed inset-0 body-background">
        <BackgroundLayer />
      </div>
      
      <HeaderNav />
      <FooterNav />
      <div className="pointer-events-none">
        <BlurMasks />
      </div>
      
      <div ref={heroRef} className="h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <AnimatedHeroText />
      </div>

      <div ref={contentContainerRef} className="max-w-5xl mx-auto mt-50">
        <div ref={issueHeaderRef} className="flex items-center justify-center sticky top-10 origin-top z-100 -translate-y-1/2">
          <div ref={volRef} className="flex-none w-3xs text-[120px] text-right font-newyork-large opacity-0">Vol</div>
          <div ref={coverRef} className="opacity-0 -mx-4">
            <Image src={currentContent.icon || "/test.png"} alt="cover" width={200} height={200} />
          </div>
          <div ref={numberRef} className="flex-none w-3xs text-[120px] text-left font-newyork-large opacity-0">{currentContent.number.toString().padStart(2, '0')}</div>
        </div>

        <p ref={subtitleRef} className="font-newyork-large text-base mb-3.5 text-center">
          ✨ The biggest topic of Issue {currentContent.number.toString().padStart(2, '0')}
        </p>
        <h3 ref={titleTextRef} className="w-3xl mx-auto font-newyork-large font-semibold text-[24px] sticky top-30 z-30 text-center origin-top will-change-[font-size] transition-[font-size]">
          {currentContent.title}
        </h3>

        <div ref={fixedBgRef} className="w-full fixed left-0 top-0 h-75 z-11 bg-background opacity-0"></div>

        <div ref={articlesContainerRef} className="w-full text-foreground z-10 sticky top-75 mt-25 pb-50">
          {isLoadingDetails ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
              加载分类文章中...
            </div>
          ) : categorizedArticles.length > 0 ? (
            <div className="space-y-12">
              {categorizedArticles.map(category => (
                <div key={category.id} className="mb-12">
                  <div className="border-b border-gray-700 pb-2 mb-6">
                    <h2 className="text-2xl font-bold font-newyork-large tracking-wider">
                      {category.name}
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {category.articles.map(article => (
                      <div key={article.documentId} className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <h3 className="text-xl font-medium mb-3 font-newyork-large">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-sm text-gray-300 mb-4 opacity-80">{article.excerpt}</p>
                        )}
                        {article.content && (
                          <div 
                            className="prose prose-sm prose-invert max-w-none mb-4"
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }}
                          />
                        )}
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
          ) : (
            <div className="text-center py-12">本期暂无文章或加载失败。</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
