'use client';

import React, { useState, useEffect } from 'react';
import { I18nContext, Lang, defaultLocale, locales, getNestedTranslation } from './index';

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  // 从localStorage读取或使用默认语言
  const [locale, setLocaleState] = useState<Lang>(defaultLocale);

  // 初始化时从localStorage获取语言设置
  useEffect(() => {
    const savedLocale = localStorage.getItem('mdt-locale') as Lang | null;
    if (savedLocale && (savedLocale === 'zh' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    }
    // 设置文档根元素的语言属性
    document.documentElement.lang = savedLocale || defaultLocale;
  }, []);

  // 设置新的语言
  const setLocale = (newLocale: Lang) => {
    setLocaleState(newLocale);
    localStorage.setItem('mdt-locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  // 翻译函数
  const t = (key: string): string => {
    return getNestedTranslation(locales[locale], key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}; 