'use client';

import React from 'react';
import { ModeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from 'next/link';
import { useI18n } from '@/i18n';

export const Header = () => {
  const { locale, setLocale, t } = useI18n();
  
  // 切换语言
  const toggleLanguage = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh');
  };

  return (
    <header className="w-full flex justify-between items-center p-12 fixed z-50">
      {/* 左侧Logo */}
      <Link href="/" passHref>
        <div className="w-24 h-10 relative dark:invert">
          <Image src="/logo.svg" alt="MOMO DESIGN TEAM" fill /> 
        </div>
      </Link>
      
      {/* 右侧按钮 */}
      <div className="flex gap-3 justify-end">
        <ModeToggle />
        <Link href="/library" passHref>
          <Button variant="secondary" className="cursor-pointer rounded-full h-10 px-4.5 flex items-center gap-2">
            <Image src="/icon/btn-library.svg" alt="Library" width={20} height={20} className="object-contain dark:invert" />
            {t('header.library')}
          </Button>
        </Link>
        <Button className="cursor-pointer rounded-full h-10 px-4.5">
          {t('header.subscribe')}
        </Button>
        <Button 
          variant="secondary" 
          className="cursor-pointer border-none rounded-full w-10 h-10 p-0 relative"
          onClick={toggleLanguage}
        >
          <Image 
            src={locale === 'zh' ? "/icon/btn-lang-en.svg" : "/icon/btn-lang-cn.svg"} 
            alt="Switch language" 
            width={20}
            height={20}
            className="dark:invert" 
          />
        </Button>
      </div>
    </header>
  );
}; 