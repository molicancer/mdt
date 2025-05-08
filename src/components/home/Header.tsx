'use client';

import React from 'react';
import { ModeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { usePathname } from 'next/navigation';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const Header = () => {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const isLibraryPage = pathname === '/library';
  
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
        <Link href={isLibraryPage ? "/" : "/library"} passHref>
          <Button variant="secondary" className="cursor-pointer rounded-full h-10 px-4.5 flex items-center gap-2">
            <Image 
              src={isLibraryPage ? "/icon/btn-back.svg" : "/icon/btn-library.svg"} 
              alt={isLibraryPage ? "Back" : "Library"} 
              width={20} 
              height={20} 
              className="object-contain dark:invert" 
            />
            {isLibraryPage ? t('header.back') : t('header.library')}
          </Button>
        </Link>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button className="cursor-pointer rounded-full h-10 px-4.5">
              {t('header.subscribe')}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent side="bottom" align="center" sideOffset={-40} className="w-50 bg-foreground text-background border-0 rounded-3xl p-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold">{t('subscribe.title')}</h3>
            <div className="bg-white p-0.5 rounded-md my-5 overflow-hidden">
              <Image 
                src="/qrcode-subscribe.png" 
                alt="Subscription QR Code" 
                width={100} 
                height={100} 
              />
            </div>
            <p className="text-center text-xs font-semibold">
              {t('subscribe.scanCode')}<br />
              {t('subscribe.subscribeLatest')}
            </p>
          </HoverCardContent>
        </HoverCard>
        <ModeToggle />
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