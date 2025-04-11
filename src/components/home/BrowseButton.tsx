interface BrowseButtonProps {
  scrollProgress: number;
}

export function BrowseButton({ scrollProgress }: BrowseButtonProps) {
  // 计算按钮的向上移动变换
  const buttonTransform = Math.max(50 - scrollProgress * 150, 0);
  
  return (
    <div 
      className="w-full flex justify-center transition-all duration-700 will-change-transform"
      style={{ 
        transform: `translateY(${buttonTransform}px)`,
        opacity: Math.min(scrollProgress * 2 - 0.6, 1)
      }}
    >
      <button className="bg-black text-white px-10 py-3 rounded-full hover:bg-gray-800 transition-colors">
        browse this vol
      </button>
    </div>
  );
} 