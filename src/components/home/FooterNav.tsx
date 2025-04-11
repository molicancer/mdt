import Image from "next/image";

export function FooterNav() {
  return (
    <footer className="pb-10 flex flex-col items-center pointer-events-auto">
      <div className="w-6 h-10 mb-2 animate-bounce">
        <Image 
          src="/img/mouse.svg"
          alt="Scroll Down"
          width={24}
          height={40}
          className="object-contain"
        />
      </div>
      <p className="text-sm text-[#545454]">Swipe down to browse weekly news</p>
    </footer>
  );
} 