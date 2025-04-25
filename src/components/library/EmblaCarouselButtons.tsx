"use client";

import React, { PropsWithChildren } from 'react';

interface ButtonPrevNextProps extends PropsWithChildren {
  enabled: boolean;
  onClick: () => void;
}

interface DotButtonProps {
  selected: boolean;
  onClick: () => void;
}

export const PrevButton: React.FC<ButtonPrevNextProps> = ({ 
  enabled, 
  onClick, 
  children 
}) => (
  <button
    onClick={onClick}
    className={`embla__button embla__button--prev ${!enabled ? 'embla__button--disabled' : ''}`}
    disabled={!enabled}
    type="button"
  >
    {children}
  </button>
);

export const NextButton: React.FC<ButtonPrevNextProps> = ({ 
  enabled, 
  onClick, 
  children 
}) => (
  <button
    onClick={onClick}
    className={`embla__button embla__button--next ${!enabled ? 'embla__button--disabled' : ''}`}
    disabled={!enabled}
    type="button"
  >
    {children}
  </button>
);

export const DotButton: React.FC<DotButtonProps> = ({ 
  selected, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className="relative transition-all duration-300 focus:outline-none"
    type="button"
  >
    <span 
      className={`block h-2 w-2 rounded-full transition-all duration-300 ${
        selected 
          ? 'bg-black dark:bg-white scale-125' 
          : 'bg-gray-300 dark:bg-gray-700'
      }`} 
    />
  </button>
); 