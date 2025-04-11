import { FunctionComponent } from "react";

interface BrowseButtonProps {
  scrollProgress: number;
  activeIssue?: number;
}

export const BrowseButton: FunctionComponent<BrowseButtonProps> = ({ 
  scrollProgress,
  activeIssue = 54
}) => {
  // 获取按钮可见度 (滚动到第二阶段后才显示)
  const buttonOpacity = Math.min(Math.max((scrollProgress - 0.3) * 5, 0), 1);
  
  if (buttonOpacity <= 0) return null;
  
  return (
    <div className="w-full flex justify-center">
      <button 
        className="text-white bg-black hover:bg-gray-800 transition-all duration-300 rounded-full px-12 py-4 font-medium"
        style={{ opacity: buttonOpacity }}
      >
        浏览 Vol {activeIssue}
      </button>
    </div>
  );
}; 