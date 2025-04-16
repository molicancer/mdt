import { ModeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { Button } from "../ui/button";

export function HeaderNav() {
  return (
    <header className="w-full flex justify-between items-center p-12 fixed z-50">
      {/* 左侧Logo */}
      <div className="w-24 h-10 relative">
        <Image src="/img/logo.svg" alt="MOMO DESIGN TEAM" fill /> 
      </div>
      
      {/* 右侧按钮 */}
      <div className="flex gap-3 justify-end">
        <ModeToggle />
        <Button variant="secondary" className="cursor-pointer rounded-full h-10 px-4.5 flex items-center gap-2">
          <Image src="/icon/btn-library.svg" alt="Library" width={20} height={20} className="object-contain" />
          Library
        </Button>
        <Button className="cursor-pointer rounded-full h-10 px-4.5">
          Subscribe
        </Button>
        <Button variant="secondary" className="cursor-pointer border-none rounded-full w-10 h-10 p-0 relative">
          <Image src="/icon/btn-lang-cn.svg" alt="Switch language" fill />
        </Button>
      </div>
    </header>
  );
} 