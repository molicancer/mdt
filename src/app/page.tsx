"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/home/Header';
import { ScrollDownIndicator } from '@/components/home/ScrollDownIndicator';
import { BlurMasks } from '@/components/home/BlurMasks';
import { BackgroundLayer } from '@/components/home/BackgroundLayer';
import { Footer } from '@/components/home/Footer';
import { 
  getLatestIssue, 
  getIssueWithCategorizedArticles,
  getIssueByNumber
} from '@/lib/api/apiAdapter';
import { IssueContent, CategoryWithArticles } from '@/types/issue';
import AnimatedHeroText from '@/components/home/AnimatedHeroText';
import TypingTopicsCarousel from '@/components/home/TypingTopicsCarousel';
import { markdownToHtml } from '@/lib/utils';
import { useScrollSnapAnimation } from '@/hooks/useScrollSnapAnimation';
import { useI18n } from '@/i18n';

const Home = () => {
  const { t } = useI18n();
  const [currentContent, setCurrentContent] = useState<IssueContent | null>(null);
  const [isInInitialStage, setIsInInitialStage] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [categorizedArticles, setCategorizedArticles] = useState<CategoryWithArticles[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  const blurMasksRef = useRef<HTMLDivElement>(null);

  // 获取最新期刊
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setIsLoading(true);
        const latestIssue = await getLatestIssue();
        setCurrentContent(latestIssue);
      } catch (error) {
        console.error("获取最新期刊失败:", error);
      } finally {
        setIsLoading(false);
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
      backgroundWrapperRef,
      blurMasksRef
    },
    isContentLoaded: !!currentContent,
    setIsInInitialStage
  });

  // 处理切换期刊
  const handleSwitchIssue = async (issueNumber: number) => {
    try {
      // 避免重复加载当前期号
      if (currentContent?.number === issueNumber) return;
      
      // 设置加载状态
      setIsLoading(true);
      setCategorizedArticles([]); // 清空当前文章列表
      
      // 获取指定期刊的内容
      const issueContent = await getIssueByNumber(issueNumber);
      if (!issueContent) {
        console.error("找不到该期刊:", issueNumber);
        setIsLoading(false);
        return;
      }
      
      // 更新当前内容
      setCurrentContent(issueContent);
      
      // 获取分类文章
      const data = await getIssueWithCategorizedArticles(issueContent.documentId);
      setCategorizedArticles(data);
      
      // 滚动到文章区域
      if (articlesContainerRef.current) {
        const scrollPosition = articlesContainerRef.current.offsetTop - 120;
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error("切换期刊失败:", error);
      // 显示错误消息给用户
      alert("加载失败，请稍后重试");
    } finally {
      // 重置加载状态
      setIsLoading(false);
    }
  };

  if (!currentContent) {
    return <div className="min-h-screen flex items-center justify-center">{t('home.loadingText')}</div>;
  }

  return (
    <div className={`relative w-full ${isInInitialStage ? 'is-initial-stage' : 'is-content-stage'}`}>
      <div ref={backgroundWrapperRef} className="fixed inset-0 body-background">
        <BackgroundLayer />
      </div>
      
      <Header />
      <ScrollDownIndicator />
      <div ref={blurMasksRef} className="pointer-events-none">
        <BlurMasks />
      </div>
      
      <div ref={heroRef} className="h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <AnimatedHeroText />
      </div>

      <div ref={contentContainerRef} className="max-w-5xl mx-auto mt-50">
        <div ref={issueHeaderRef} className="flex items-center justify-center sticky top-10 origin-top z-100">
          <div ref={volRef} className="flex-none w-3xs text-[120px] text-right font-newyork-large opacity-0">Vol</div>
          <div ref={coverRef} className="opacity-0 -mx-4">
            <Image 
              src={currentContent.icon || "/test.png"} 
              alt={`封面 Vol.${currentContent.number}`} 
              width={200} 
              height={200} 
              className='dark:invert transition-all duration-300' 
              priority={true}
              quality={85}
              sizes="(max-width: 768px) 150px, 200px"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5jU3rHgAAAABJRU5ErkJggg=="
            />
          </div>
          <div ref={numberRef} className="flex-none w-3xs text-[120px] text-left font-newyork-large opacity-0">{currentContent.number.toString().padStart(2, '0')}</div>
        </div>

        <p ref={subtitleRef} className="font-newyork-large text-base mb-3.5 text-center">
          {t('home.biggestTopic').replace('{issue_number}', currentContent.number.toString().padStart(2, '0'))}
        </p>
        <div ref={titleTextRef}>
          <TypingTopicsCarousel 
            topics={currentContent.topics && currentContent.topics.length > 0 
              ? currentContent.topics 
              : [{ id: 0, documentId: '0', title: currentContent.title || '欢迎访问MDT' }]} 
            typingSpeed={50}
            pauseDuration={2000}
            erasingSpeed={30}
          />
        </div>

        <div ref={fixedBgRef} className="w-full fixed left-0 top-0 h-30 z-11 bg-background opacity-0"></div>

        <div ref={articlesContainerRef} className="w-full text-foreground z-10 relative mt-25 overflow-visible" style={{ willChange: 'transform' }}>
          {isLoading || isLoadingDetails ? (
            <div className="text-center py-36">
              <div className="text-xl font-newyork-large">{t('home.loadingText')}</div>
            </div>
          ) : categorizedArticles.length > 0 ? (
            <div className="space-y-12">
              {categorizedArticles.map(category => (
                <div key={category.id} className="mb-16">
                  <h2 className="text-4xl font-bold font-newyork-large tracking-wider">
                    {category.name}
                  </h2>
                  <div className="space-y-6">
                    {category.articles.map(article => (
                      <div key={article.documentId}>
                        <h3 className="text-xl font-medium font-newyork-large">{article.title}</h3>
                        {article.content && (
                          <div className="text-base leading-[2.2] prose prose-sm prose-invert max-w-none" 
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }} 
                          />
                        )}
                        <div className="flex items-center">
                          {article.link && (
                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-center bg-gray-200/60 hover:bg-gray-200/40 rounded-full h-10 px-4 transition-colors">
                              <Image src="/icon/link.svg" alt={t('home.readOriginal')} width={20} height={20} />
                              <span className="ml-1.5 text-sm text-foreground font-semibold">Lens Ai website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-lg">
              {t('home.noArticles')}
            </div>
          )}
        </div>
      </div>
      
      <Footer 
        onSwitchIssue={handleSwitchIssue} 
        currentIssueNumber={currentContent?.number}
      />
    </div>
  );
};

export default Home;
