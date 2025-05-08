"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '@/i18n';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
  id: string;
  title: string;
  element: HTMLElement;
}

interface FloatingNavigationProps {
  articlesContainerRef: React.RefObject<HTMLDivElement>;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({ 
  articlesContainerRef 
}) => {
  const { t } = useI18n();
  const [sections, setSections] = useState<Section[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);  // 控制整个组件的可见性
  const [opacity, setOpacity] = useState(0); // 控制透明度实现渐隐效果
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [leftPosition, setLeftPosition] = useState('-80px');
  const menuRef = useRef<HTMLDivElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scanAttemptsRef = useRef(0);
  const opacityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 扫描文章中的h3标题 - 使用useCallback包装，避免无限循环
  const scanForHeadings = useCallback(() => {
    if (!articlesContainerRef.current) return;

    const h3Elements = articlesContainerRef.current.querySelectorAll('h3');
    
    if (h3Elements.length === 0) {
      // 如果没有找到h3标签，且尝试次数少于20次，等待200ms后再次尝试
      if (scanAttemptsRef.current < 20) {
        scanAttemptsRef.current += 1;
        scanTimeoutRef.current = setTimeout(scanForHeadings, 200);
      }
      return;
    }
    
    scanAttemptsRef.current = 0; // 重置尝试次数
    
    const sectionsData: Section[] = [];
    h3Elements.forEach((element, index) => {
      // 如果没有id，则添加一个
      if (!element.id) {
        element.id = `section-${index}`;
      }

      sectionsData.push({
        id: element.id,
        title: element.textContent || `章节 ${index + 1}`,
        element: element as HTMLElement
      });
    });

    setSections(sectionsData);
  }, [articlesContainerRef]); // 仅当articlesContainerRef变化时重新创建函数

  // 在文章内容变化时，扫描h3标题
  useEffect(() => {
    scanAttemptsRef.current = 0; // 重置尝试计数
    scanForHeadings();

    // 清除任何现有的超时
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [scanForHeadings]);

  // 监听DOM变化，重新扫描标题
  useEffect(() => {
    if (!articlesContainerRef.current) return;

    // 创建一个MutationObserver实例来监听文章容器的变化
    const observer = new MutationObserver(() => {
      // 当DOM发生变化时重新扫描标题
      scanForHeadings();
    });

    // 开始观察配置的DOM节点
    observer.observe(articlesContainerRef.current, {
      childList: true,  // 观察直接子节点的添加或删除
      subtree: true,    // 观察所有后代节点
      characterData: true, // 观察节点内容或节点文本的变化
    });

    // 组件卸载时停止观察
    return () => {
      observer.disconnect();
    };
  }, [articlesContainerRef, scanForHeadings]);

  // 检查文章区域是否可见并控制导航组件的显示
  useEffect(() => {
    const checkVisibility = () => {
      if (articlesContainerRef.current) {
        const currentScrollY = window.scrollY;
        // 计算文章区域的目标滚动位置，与handleSwitchIssue函数中的计算方式保持一致
        const articleTopPosition = articlesContainerRef.current.offsetTop - 120;
        
        // 只有当当前滚动位置大于或等于文章顶部位置时才显示控件
        const shouldBeVisible = currentScrollY >= articleTopPosition - 50; // 添加一点提前量
        
        // 设置可见状态，但不立即改变透明度
        if (shouldBeVisible !== isVisible) {
          setIsVisible(shouldBeVisible);
          
          // 清除之前的透明度计时器
          if (opacityTimeoutRef.current) {
            clearTimeout(opacityTimeoutRef.current);
          }
          
          // 渐变效果：显示时立即开始渐入，隐藏时延迟一点再开始渐出
          if (shouldBeVisible) {
            // 立即开始渐入
            setOpacity(1);
          } else {
            // 延迟开始渐出
            opacityTimeoutRef.current = setTimeout(() => {
              setOpacity(0);
            }, 100);
          }
        }
        
        // 确定当前活动的章节
        if (sections.length > 0 && isVisible) {
          // 找到当前在视口中的section
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const sectionRect = section.element.getBoundingClientRect();
            
            // 如果标题在视口上方一点或在视口中
            if (sectionRect.top <= 120) {
              setActiveSection(section.id);
              break;
            }
          }
        }
      } else {
        setIsVisible(false);
        setOpacity(0);
      }
    };

    // 初始检查
    checkVisibility();
    
    // 添加滚动事件监听器
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      if (opacityTimeoutRef.current) {
        clearTimeout(opacityTimeoutRef.current);
      }
    };
  }, [articlesContainerRef, sections, isVisible]);

  // 计算按钮组的水平位置，使其紧贴文章容器的左侧
  useEffect(() => {
    const updatePosition = () => {
      if (articlesContainerRef.current) {
        const containerRect = articlesContainerRef.current.getBoundingClientRect();
        // 按钮组置于内容容器左侧外侧
        const buttonLeftPosition = `${containerRect.left - 80}px`;
        setLeftPosition(buttonLeftPosition);
      }
    };

    // 初始化位置
    updatePosition();
    
    // 监听窗口大小变化重新计算位置
    window.addEventListener('resize', updatePosition);
    
    // 监听滚动，因为某些动态布局可能会改变容器位置
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [articlesContainerRef]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 回到顶部（实际是文章区域顶部）
  const scrollToTop = () => {
    if (articlesContainerRef.current) {
      // 与页面中的其他滚动保持一致，文章区域顶部位置减去120px的偏移
      const scrollPosition = articlesContainerRef.current.offsetTop - 120;
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // 滚动到指定章节
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // 考虑固定头部的高度
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setIsMenuOpen(false);
    }
  };

  // 手动刷新章节列表
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refreshSections = () => {
    scanForHeadings();
    if (sections.length === 0) {
      // 如果仍然没有章节，显示提示信息
      alert(t('home.scanningForChapters') || '正在扫描章节...');
    }
  };

  // 当文章区域不可见时，组件仍然渲染但透明度为0
  const containerStyle = {
    opacity: opacity,
    transition: 'opacity 0.3s ease-in-out',
    visibility: opacity === 0 && !isVisible ? 'hidden' as const : 'visible' as const, // 当完全透明且不可见时隐藏
    left: leftPosition, // 动态设置左侧位置
  };

  return (
    <div 
      ref={menuRef} 
      className="fixed bottom-[40px] flex flex-col items-start z-50"
      style={containerStyle}
    >
      {/* 章节导航菜单 - 放在按钮组上方并向左偏移 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 overflow-y-auto absolute left-1/2 -translate-x-1/2 bottom-full"
          >
            {sections.length > 0 ? (
              <ul className="space-y-3 justify-items-center">
                {sections.map((section, index) => (
                  <motion.li 
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.015 * (sections.length - 1 - index),
                      ease: "easeOut"
                    }}
                  >
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center h-8 px-4 text-xs rounded-full transition-colors cursor-pointer hover:bg-[#F5C386] ${
                        activeSection === section.id ? 'bg-[#F5C386] font-medium' : 'bg-[#f1f1f1]'
                      }`}
                    >
                      <span className="truncate">{section.title}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="px-3 py-2 text-sm text-gray-400"
              >
                {t('home.noChapters') || '暂无章节'}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 按钮组 - 纵向排列 */}
      <div className="flex flex-col space-y-3 items-center">
        {/* 章节菜单按钮 */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-12 h-10 ${isMenuOpen ? 'bg-[#F5C386]' : 'bg-foreground'} border-none rounded-full flex items-center justify-center text-background cursor-pointer`}
          aria-label={t('home.chapterMenu') || '章节菜单'}
        >
          <Image src="/icon/chapter-menu.svg" alt={t('home.chapterMenu') || '章节菜单'} width={20} height={20} className="dark:invert" />
        </button>
        
        {/* 回到顶部按钮 */}
        <button
          onClick={scrollToTop}
          className="w-12 h-10 bg-[#f1f1f1] border-none rounded-full flex items-center justify-center text-foreground dark:invert cursor-pointer"
          aria-label={t('home.backToTop') || '回到顶部'}
        >
          <Image src="/icon/scroll-top.svg" alt={t('home.backToTop') || '回到顶部'} width={20} height={20} />
        </button>
      </div>
    </div>
  );
}; 