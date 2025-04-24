'use client';

import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getAllIssues } from "@/lib/api/apiAdapter";
import { useI18n } from "@/i18n";

// 定义props类型，接收跳转函数
interface FooterProps {
  onSwitchIssue?: (issueNumber: number) => void;
  currentIssueNumber?: number;
}

export const Footer = ({ onSwitchIssue, currentIssueNumber }: FooterProps) => {
  const { t } = useI18n();
  const [isFirstIssue, setIsFirstIssue] = useState(false);
  const [isLastIssue, setIsLastIssue] = useState(false);
  const [prevIssueNumber, setPrevIssueNumber] = useState<number | null>(null);
  const [nextIssueNumber, setNextIssueNumber] = useState<number | null>(null);
  
  // 获取所有期刊并确定当前期刊的位置
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const issues = await getAllIssues();
        // 按期号排序
        const issueNumbers = issues.map(issue => issue.number).sort((a, b) => a - b);
        
        if (currentIssueNumber) {
          // 判断是否是第一期
          setIsFirstIssue(issueNumbers[0] === currentIssueNumber);
          // 判断是否是最后一期
          setIsLastIssue(issueNumbers[issueNumbers.length - 1] === currentIssueNumber);
          
          // 确定上一期和下一期
          const currentIndex = issueNumbers.indexOf(currentIssueNumber);
          if (currentIndex > 0) {
            setPrevIssueNumber(issueNumbers[currentIndex - 1]);
          } else {
            setPrevIssueNumber(null);
          }
          
          if (currentIndex < issueNumbers.length - 1) {
            setNextIssueNumber(issueNumbers[currentIndex + 1]);
          } else {
            setNextIssueNumber(null);
          }
        }
      } catch (error) {
        console.error("获取期刊列表失败:", error);
      }
    };
    
    fetchIssues();
  }, [currentIssueNumber]);

  // 处理点击事件
  const handleSwitchIssue = (issueNumber: number) => {
    if (onSwitchIssue) {
      onSwitchIssue(issueNumber);
    }
  };

  return (
    <footer className="max-w-5xl mx-auto relative pt-18 pb-40">
      {/* 顶部版期入口按钮 */}
      <div className="mx-auto flex justify-between">
        {/* 上一期按钮，没有时显示空div保持布局 */}
        <div className="flex-1">
          {!isFirstIssue && prevIssueNumber ? (
            <button 
              className="group relative cursor-pointer"
              onClick={() => handleSwitchIssue(prevIssueNumber)}
            >
              <div className="flex items-center justify-center absolute left-0 w-10 h-10 rounded-full bg-[#FFF8E7] group-hover:bg-[#FFF0D0] transition-colors">
                <Image src="/icon/hand-point-left.svg" alt="Previous" width={20} height={20} />
              </div>
              <span className="flex items-center justify-center rounded-full h-8 px-10 pr-4 my-1 text-sm bg-[#FFF8E7] group-hover:bg-[#FFF0D0] transition-colors">
                {`${t('footer.watchPrevious')}${prevIssueNumber}`}
              </span>
            </button>
          ) : (
            <div className="h-10"></div>
          )}
        </div>
        
        {/* 中间空间 */}
        <div className="flex-1"></div>
        
        {/* 下一期按钮 */}
        <div className="flex-1 flex justify-end">
          {!isLastIssue && nextIssueNumber ? (
            <button 
              className="group relative cursor-pointer"
              onClick={() => handleSwitchIssue(nextIssueNumber)}
            >
              <div className="flex items-center justify-center absolute right-0 w-10 h-10 rounded-full bg-[#FFF8E7] group-hover:bg-[#FFF0D0] transition-colors">
                <Image src="/icon/hand-point-right.svg" alt="Next" width={20} height={20} />
              </div>
              <span className="flex items-center justify-center rounded-full h-8 px-4 pr-10 my-1 text-sm bg-[#FFF8E7] group-hover:bg-[#FFF0D0] transition-colors">
                {`${t('footer.watchNext')}${nextIssueNumber}`}
              </span>
            </button>
          ) : (
            <div className="h-10"></div>
          )}
        </div>
      </div>
      
      <div className="mx-auto flex flex-row justify-between mt-12 pt-12 border-t border-dashed">
        {/* 左侧信息 */}
        <div>
          <div className="text-base mb-16 space-y-3">
            <p>{t('footer.established')}</p>
            <p>{t('footer.forDesigners')}</p>
            <p>{t('footer.accumulation')}</p>
          </div>
          
          {/* MOMO DESIGN TEAM logo */}
          <div className="w-24 h-10 relative dark:invert">
            <Image src="/logo.svg" alt="MOMO DESIGN TEAM" fill /> 
          </div>
        </div>
        
        {/* 右侧订阅和二维码 */}
        <div>
          {/* 订阅按钮 */}
          <Button className="cursor-pointer rounded-full h-10 px-4.5">
            {t('header.subscribe')}
          </Button>
          
          {/* 二维码 */}
          <div className="w-24 h-24 mt-12">
            <Image 
              src="/qrcode.png" 
              alt="Scan to subscribe" 
              width={96} 
              height={96} 
            />
          </div>
        </div>
      </div>
    </footer>
  );
}