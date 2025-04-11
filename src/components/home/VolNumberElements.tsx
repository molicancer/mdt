import { useState, useEffect } from "react";

interface VolNumberElementsProps {
  volTransform: number;
  numberTransform: number;
  elementsOpacity: number;
  dateCurrentX: number;
  dateOpacity: number;
}

// 期数数据
const ISSUES = [54, 53, 52, 51, 50];

export function VolNumberElements({ 
  volTransform, 
  numberTransform, 
  elementsOpacity, 
  dateCurrentX, 
  dateOpacity 
}: VolNumberElementsProps) {
  // 跟踪当前悬停的期数
  const [hoveredIssue, setHoveredIssue] = useState<number | null>(null);
  // 跟踪各个元素的实际位置状态
  const [issuePositions, setIssuePositions] = useState<{ [key: number]: number }>({});
  
  // 统一的动画参数
  const animationDuration = '0.5s';
  const animationType = 'linear';
  
  // 监听numberTransform的变化，计算每个期数的位置
  useEffect(() => {
    // 创建一个延迟函数
    const updateWithDelay = (issue: number, transform: number, delay: number) => {
      setTimeout(() => {
        setIssuePositions(prev => ({
          ...prev,
          [issue]: transform
        }));
      }, delay * 1000);
    };
    
    // 对每个期数设置不同的延迟时间
    ISSUES.forEach((issue, index) => {
      const distanceFrom54 = Math.abs(54 - issue);
      // 使用递增式延迟：第一级0.02秒，第二级0.05秒，第三级0.09秒，依此类推
      const delay = distanceFrom54 === 0 ? 0 : 0.02 + (distanceFrom54 - 1) * 0.03;
      updateWithDelay(issue, numberTransform, delay);
    });
  }, [numberTransform]);
  
  return (
    <div className="max-w-6xl w-full px-8 relative">
      {/* Vol部分 - 向左侧移动 */}
      <div 
        className="absolute will-change-transform transform-gpu z-40" 
        style={{ 
          transform: `translateX(-${volTransform}px) translateZ(0)`,
          opacity: elementsOpacity,
          transition: `transform ${animationDuration} ${animationType}, opacity ${animationDuration} ${animationType}`
        }}
      >
        <h2 className="text-[150px] font-newyork font-bold leading-none">Vol</h2>
      </div>
      
      {/* 期数列表 - 向右侧移动 */}
      <div 
        className="absolute right-8 will-change-transform transform-gpu z-40" 
        style={{ 
          opacity: elementsOpacity,
          transition: `opacity ${animationDuration} ${animationType}`
        }}
      >
        <div className="relative h-[400px]">
          {/* 垂直虚线指示器 */}
          <div 
            className="absolute left-1/2 h-full w-[1px] bg-gray-200 opacity-30"
            style={{
              transform: 'translateX(-50%)'
            }}
          ></div>
          
          {/* 期数项目 */}
          {ISSUES.map((issue, index) => {
            const isActive = issue === 54;
            const isHovered = issue === hoveredIssue;
            
            // 计算位置：54在中间(0)，上面的是负值，下面的是正值
            const position = index - 2; // 54的索引是0
            const spacing = 100; // 项目之间的间距
            
            // 获取当前期数的实际位置（如果尚未设置，则使用默认值0）
            const currentTransform = issuePositions[issue] !== undefined ? issuePositions[issue] : 0;
            
            return (
              <div 
                key={issue}
                className={`
                  font-newyork font-bold cursor-pointer absolute left-1/2 
                  ${isActive 
                    ? 'text-[150px] opacity-100' 
                    : isHovered 
                      ? 'text-[140px] opacity-70' 
                      : 'text-[130px] opacity-30'
                  }
                `}
                style={{
                  transform: `translate(calc(-50% + ${currentTransform}px), ${position * spacing}px)`,
                  top: '50%',
                  transition: `transform ${animationDuration} ${animationType}, opacity ${animationDuration} ${animationType}, font-size ${animationDuration} ${animationType}`,
                  willChange: 'transform, opacity, font-size'
                }}
                onMouseEnter={() => setHoveredIssue(issue)}
                onMouseLeave={() => setHoveredIssue(null)}
                onClick={() => console.log(`Navigate to issue ${issue}`)}
              >
                {issue}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 日期信息 - 作为独立组件，从屏幕左侧外部移动到Vol下方 */}
      <div 
        className="absolute will-change-transform transform-gpu z-40" 
        style={{ 
          left: '0',
          top: '120px',
          transform: `translateX(${dateCurrentX}px) translateZ(0)`,
          opacity: dateOpacity,
          transition: `transform ${animationDuration} ${animationType}, opacity ${animationDuration} ${animationType}`
        }}
      >
        <div className="text-sm text-gray-600">
          <div>the latest Feb 23 2025</div>
          <div>Monday updated</div>
        </div>
      </div>
    </div>
  );
} 