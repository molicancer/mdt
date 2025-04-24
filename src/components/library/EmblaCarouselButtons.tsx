"use client";

import React from 'react';

interface ButtonProps {
  onClick: () => void;
  enabled: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const DotButton: React.FC<{ selected: boolean; onClick: () => void }> = ({ selected, onClick }) => {
  return (
    <button
      className={`embla__dot ${selected ? 'embla__dot--selected' : ''}`}
      type="button"
      onClick={onClick}
    />
  );
};

export const PrevButton: React.FC<ButtonProps> = ({ onClick, enabled, className, children }) => {
  return (
    <button
      className={`absolute top-1/2 left-8 -translate-y-1/2 z-40 p-2 rounded-full bg-background/20 backdrop-blur-md transition-all
        ${!enabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-background/30'} ${className || ''}`}
      onClick={onClick}
      disabled={!enabled}
      aria-label="上一篇"
    >
      {children || (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      )}
    </button>
  );
};

export const NextButton: React.FC<ButtonProps> = ({ onClick, enabled, className, children }) => {
  return (
    <button
      className={`absolute top-1/2 right-8 -translate-y-1/2 z-40 p-2 rounded-full bg-background/20 backdrop-blur-md transition-all
        ${!enabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-background/30'} ${className || ''}`}
      onClick={onClick}
      disabled={!enabled}
      aria-label="下一篇"
    >
      {children || (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}; 