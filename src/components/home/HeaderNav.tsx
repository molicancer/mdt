import { ModeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export function HeaderNav() {
  return (
    <header 
      className="w-full grid grid-cols-3 items-center px-8 py-12 pointer-events-auto fixed top-0 left-0 right-0" 
      style={{ zIndex: 999 }}
    >
      {/* 左侧空白区域 */}
      <div></div>
      
      {/* 中间Logo */}
      <div className="w-24 h-10 relative mx-auto">
        <div className="w-full h-full flex items-center justify-center">
          <Image 
            src="/img/logo.svg" 
            alt="MOMO DESIGN TEAM" 
            fill 
            className="object-contain" 
          /> 
        </div>
      </div>
      
      {/* 右侧按钮 */}
      <div className="flex items-center gap-4 justify-end pointer-events-auto" style={{ zIndex: 1000 }}>
        <div className="relative z-[1001] pointer-events-auto">
          <ModeToggle />
        </div>
        <Link href="/subscribe">
          <button className="bg-primary text-primary-foreground border border-border rounded-full px-6 py-2 font-medium hover:bg-background hover:text-foreground transition-colors duration-300">
            Subscribe
          </button>
        </Link>
        <Link href="/language" className="text-xl font-light">汉</Link>
      </div>
    </header>
  );
} 