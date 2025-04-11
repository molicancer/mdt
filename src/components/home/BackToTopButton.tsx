interface BackToTopButtonProps {
  scrollProgress: number;
  titleRef: React.RefObject<HTMLDivElement | null>;
}

export function BackToTopButton({ scrollProgress, titleRef }: BackToTopButtonProps) {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 立即显示大标题
    if (titleRef.current) {
      titleRef.current.style.opacity = '1';
      titleRef.current.style.transform = 'translateY(0)';
    }
  };

  return (
    <button 
      onClick={handleBackToTop}
      className={`fixed bottom-10 right-10 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center z-50 transition-all duration-300 pointer-events-auto ${scrollProgress > 0.6 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3L3 10H7V17H13V10H17L10 3Z" fill="currentColor" transform="rotate(180 10 10)"/>
      </svg>
    </button>
  );
} 