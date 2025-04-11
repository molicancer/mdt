interface InfoTextProps {
  textOpacity: number;
  scrollProgress: number;
}

export function InfoText({ textOpacity, scrollProgress }: InfoTextProps) {
  return (
    <>
      {/* "Select the issue number"提示 - 滚动时显示 */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-opacity"
          style={{ opacity: scrollProgress > 0.5 ? 1 : 0 }}>
        <span className="text-sm text-gray-600">Select the issue number</span>
        <div className="w-6 h-6">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 7L21 10L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* 固定在中心下方的标题下方说明文字 */}
      <div className="flex items-center justify-center mb-20">
        <div className="max-w-4xl">
          <div 
            className="text-sm text-[#545454] text-center transition-opacity will-change-opacity"
            style={{ opacity: textOpacity }}
          >
            <p>
              Share the latest design and artificial intelligence consulting <span className="font-medium text-black dark:text-white">「 weekly news 」</span><br />Updated once a Monday morning
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 