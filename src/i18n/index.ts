import { createContext, useContext } from 'react';
import zh from './locales/zh.json';
import en from './locales/en.json';

export type Lang = 'zh' | 'en';

export const defaultLocale: Lang = 'zh';

export const locales = {
  zh,
  en
};

export type Translation = typeof zh;

interface I18nContextProps {
  locale: Lang;
  setLocale: (locale: Lang) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within a I18nProvider');
  }
  return context;
};

// 获取嵌套key的值
export const getNestedTranslation = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any, 
  path: string
): string => {
  const keys = path.split('.');
  return keys.reduce((prev, curr) => {
    return prev?.[curr] ?? path; // 如果找不到翻译，返回原key
  }, obj);
}; 