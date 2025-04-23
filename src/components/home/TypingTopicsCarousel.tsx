"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Topic } from '@/types/issue';

interface TypingTopicsCarouselProps {
  topics: Topic[];
  typingSpeed?: number;
  pauseDuration?: number;
  erasingSpeed?: number;
}

const TypingTopicsCarousel: React.FC<TypingTopicsCarouselProps> = ({
  topics,
  typingSpeed = 50, // 打字速度 (ms/字符)
  pauseDuration = 2000, // 完成后停留时间 (ms)
  erasingSpeed = 30 // 删除速度 (ms/字符)
}) => {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true); // true=打字中, false=删除中
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 动画逻辑
  useEffect(() => {
    // 如果没有主题，直接返回，不执行动画逻辑
    if (!topics || topics.length === 0) return;
    
    // 清理之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 确保currentTopicIndex在topics数组范围内
    if (currentTopicIndex >= topics.length) {
      setCurrentTopicIndex(0);
      return;
    }

    const currentTopic = topics[currentTopicIndex];
    // 添加安全检查，确保currentTopic存在
    if (!currentTopic) {
      console.error('当前主题不存在:', { currentTopicIndex, topicsLength: topics.length });
      setCurrentTopicIndex(0);
      return;
    }
    
    const currentText = currentTopic.title || '';

    if (isTyping) {
      // 打字过程
      if (displayText.length < currentText.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // 打字完成，暂停
        timeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
      }
    } else {
      // 删除过程
      if (displayText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, erasingSpeed);
      } else {
        // 删除完成，进入下一个主题
        setIsTyping(true);
        setCurrentTopicIndex((prevIndex) => (prevIndex + 1) % topics.length);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentTopicIndex, displayText, isTyping, topics, typingSpeed, pauseDuration, erasingSpeed]);

  // 没有主题时显示默认文本
  if (!topics || topics.length === 0) {
    return <h3 className="w-3xl mx-auto font-newyork-large font-semibold text-[24px] text-center">Welcome to MDT</h3>;
  }

  return (
    <motion.h3 
      className="w-3xl mx-auto font-newyork-large font-semibold text-[24px] sticky top-30 z-30 text-center origin-top will-change-[font-size] transition-[font-size]"
      key={`topic-${currentTopicIndex}`}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block ml-[1px] w-[2px] h-[24px] bg-current align-middle"
      />
    </motion.h3>
  );
};

export default TypingTopicsCarousel; 