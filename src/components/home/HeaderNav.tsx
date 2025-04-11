import { ModeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { Button } from "../ui/button";

export function HeaderNav() {
  return (
    <header className="w-full grid grid-cols-3 items-center p-12 fixed z-50">
      {/* 左侧空白区域 */}
      <div></div>
      
      {/* 中间Logo */}
      <div className="w-24 h-10 relative mx-auto">
        <Image src="/img/logo.svg" alt="MOMO DESIGN TEAM" fill /> 
      </div>
      
      {/* 右侧按钮 */}
      <div className="flex gap-3 justify-end">
        <ModeToggle />
        <Button className="cursor-pointer rounded-full h-10 px-4.5">
          Subscribe
        </Button>
        <Button variant="secondary" className="cursor-pointer border-none rounded-full w-10 h-10 p-0 relative">
          <Image src="/img/lang_cn.svg" alt="Switch language" fill />
        </Button>
      </div>
    </header>
  );
} 