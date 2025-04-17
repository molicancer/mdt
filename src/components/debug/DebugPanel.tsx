"use client";

import { useState } from "react";
import { useAnimationStore } from "@/store/animationStore";
import { useUIStore } from "@/store/uiStore";
import { motion } from "framer-motion";

export const DebugPanel = () => {
  // 控制面板展开/收起状态
  const [expanded, setExpanded] = useState(true);
  
  // 从动画状态库获取状态和方法
  const {
    isInitialStage,
    isArticleReading,
    setInitialStage,
    setArticleReading,
    updateAnimationValues,
    titleTransform,
    titleOpacity,
    scrollProgress,
    isVisible
  } = useAnimationStore();
  
  // 从UI状态库获取状态和方法
  const {
    activeIssue,
    setActiveIssue
  } = useUIStore();
  
  // 切换调试面板展开/收起
  const togglePanel = () => setExpanded(!expanded);
  
  // 显示当前各种状态值
  const renderStateValues = () => (
    <div className="mb-4 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <div>isInitialStage: <span className="font-bold">{isInitialStage ? "true" : "false"}</span></div>
        <div>isArticleReading: <span className="font-bold">{isArticleReading ? "true" : "false"}</span></div>
        <div>isVisible: <span className="font-bold">{isVisible ? "true" : "false"}</span></div>
        <div>titleTransform: <span className="font-bold">{titleTransform.toFixed(0)}</span></div>
        <div>titleOpacity: <span className="font-bold">{titleOpacity.toFixed(2)}</span></div>
        <div>scrollProgress: <span className="font-bold">{scrollProgress.toFixed(2)}</span></div>
        <div>activeIssue: <span className="font-bold">{activeIssue}</span></div>
      </div>
    </div>
  );
  
  // 按钮样式类
  const buttonClass = "px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors";
  const dangerButtonClass = "px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors";
  const successButtonClass = "px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors";
  
  return (
    <motion.div 
      className="fixed bottom-4 right-4 z-50 shadow-lg rounded-lg overflow-hidden"
      initial={{ opacity: 0.9 }}
      animate={{ 
        width: expanded ? 320 : 40,
        height: expanded ? "auto" : 40
      }}
      transition={{ duration: 0.3 }}
    >
      {/* 展开/收起按钮 */}
      <button 
        onClick={togglePanel}
        className="absolute top-0 left-0 w-10 h-10 bg-gray-900 text-white flex items-center justify-center"
      >
        {expanded ? "×" : "D"}
      </button>
      
      {/* 调试面板内容 */}
      {expanded && (
        <div className="bg-gray-900 bg-opacity-90 text-white p-4 pt-12">
          <h3 className="text-lg font-bold mb-2">调试面板</h3>
          
          {/* 状态值显示 */}
          {renderStateValues()}
          
          {/* 阶段控制 */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">显示控制</h4>
            <div className="flex space-x-2">
              <button 
                className={buttonClass} 
                onClick={() => {
                  setInitialStage(true);
                  setArticleReading(false);
                  updateAnimationValues({
                    scrollProgress: 0,
                    titleTransform: 0, 
                    titleOpacity: 1,
                  });
                  window.scrollTo(0, 0);
                }}
              >
                初始阶段
              </button>
              
              <button 
                className={buttonClass} 
                onClick={() => {
                  setInitialStage(false);
                  setArticleReading(false);
                }}
              >
                预览阶段
              </button>
              
              <button 
                className={buttonClass} 
                onClick={() => {
                  setInitialStage(false);
                  setArticleReading(true);
                }}
              >
                阅读状态
              </button>
            </div>
          </div>
          
          {/* 可见性控制 */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">可见性控制</h4>
            <div className="flex space-x-2">
              <button 
                className={isVisible ? successButtonClass : dangerButtonClass} 
                onClick={() => {
                  useAnimationStore.getState().setVisibility(!isVisible);
                }}
              >
                {isVisible ? "隐藏元素" : "显示元素"}
              </button>
            </div>
          </div>
          
          {/* 期数控制 */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">期数控制</h4>
            <div className="grid grid-cols-5 gap-2">
              {[54, 53, 52, 51, 50, 49, 48, 47, 46, 45].map(issue => (
                <button 
                  key={issue}
                  className={`px-2 py-1 text-xs ${activeIssue === issue ? 'bg-yellow-500' : 'bg-gray-600'} rounded`} 
                  onClick={() => setActiveIssue(issue)}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>
          
          {/* 动画控制 */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">动画值控制</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1">滚动进度</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={scrollProgress}
                  onChange={(e) => updateAnimationValues({ scrollProgress: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1">标题透明度</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={titleOpacity}
                  onChange={(e) => updateAnimationValues({ titleOpacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1">标题位移</label>
                <input 
                  type="range" 
                  min="-200" 
                  max="0" 
                  step="10" 
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1">Vol位移</label>
                <input 
                  type="range" 
                  min="0" 
                  max="300" 
                  step="10" 
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* 重置控制 */}
          <div>
            <button 
              className={dangerButtonClass} 
              onClick={() => {
                setInitialStage(true);
                setArticleReading(false);
                updateAnimationValues({
                  scrollProgress: 0,
                  titleTransform: 0,
                  titleOpacity: 1,
                });
                window.scrollTo(0, 0);
              }}
            >
              重置所有值
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}; 