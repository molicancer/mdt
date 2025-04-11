interface SelectIssueHintProps {
  scrollProgress: number;
}

export function SelectIssueHint({ scrollProgress }: SelectIssueHintProps) {
  return (
    <div 
      className="flex items-center gap-2 transition-opacity duration-300"
      // 当滚动开始时显示
      style={{ opacity: scrollProgress > 0.1 ? 1 : 0 }}
    >
      <span className="text-sm text-gray-600">Select the issue number</span>
      <div className="w-6 h-6">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18 7L21 10L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
} 