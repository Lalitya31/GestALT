import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UIPreviewCardProps {
  id: string;
  isFlawed: boolean;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

export const UIPreviewCard: React.FC<UIPreviewCardProps> = ({
  id,
  isFlawed,
  isSelected,
  isCorrect,
  showResult,
  children,
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
        'bg-card hover:bg-card-elevated',
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20'
          : 'border-border hover:border-primary/50',
        showResult && isCorrect && 'border-success shadow-success/20',
        showResult && !isCorrect && isSelected && 'border-destructive shadow-destructive/20'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center',
            'text-white font-bold text-sm',
            isCorrect ? 'bg-success' : 'bg-destructive'
          )}
        >
          {isCorrect ? '✓' : '✕'}
        </motion.div>
      )}
    </motion.div>
  );
};

interface FlawedUIExampleProps {
  type: 'contrast' | 'spacing' | 'alignment' | 'hierarchy' | 'correct';
  children?: React.ReactNode;
}

export const FlawedUIExample: React.FC<FlawedUIExampleProps> = ({ type }) => {
  const examples = {
    contrast: (
      <div className="space-y-2 p-3">
        <div className="text-xs text-muted-foreground/30">Low Contrast Text</div>
        <div className="h-8 w-full bg-secondary/30 rounded flex items-center justify-center">
          <span className="text-secondary/50 text-xs">Hard to read</span>
        </div>
        <button className="w-full py-1.5 text-xs bg-secondary/20 text-secondary/40 rounded">
          Submit
        </button>
      </div>
    ),
    spacing: (
      <div className="p-1">
        <div className="text-xs font-medium">Title</div>
        <div className="text-xs text-muted-foreground">Subtitle here</div>
        <div className="h-6 w-full bg-secondary rounded mt-0.5"></div>
        <div className="h-6 w-full bg-secondary rounded mt-0.5"></div>
        <button className="w-full py-1 text-xs bg-primary text-primary-foreground rounded mt-0.5">
          Action
        </button>
      </div>
    ),
    alignment: (
      <div className="space-y-2 p-3">
        <div className="text-xs font-medium text-left">Left Title</div>
        <div className="text-xs text-muted-foreground text-right">Right subtitle</div>
        <div className="h-6 w-3/4 bg-secondary rounded mx-auto"></div>
        <button className="py-1 text-xs bg-primary text-primary-foreground rounded px-4 ml-2">
          Button
        </button>
      </div>
    ),
    hierarchy: (
      <div className="space-y-2 p-3">
        <div className="text-xs text-muted-foreground">Small Header</div>
        <div className="text-sm font-bold">BIG SUBTEXT</div>
        <button className="w-full py-2 text-base bg-primary text-primary-foreground rounded font-bold">
          MASSIVE CTA
        </button>
        <div className="text-xs">tiny footer note</div>
      </div>
    ),
    correct: (
      <div className="space-y-3 p-3">
        <div className="text-sm font-semibold">Clear Heading</div>
        <div className="text-xs text-muted-foreground">Supporting description text</div>
        <div className="h-6 w-full bg-secondary rounded"></div>
        <button className="w-full py-1.5 text-xs bg-primary text-primary-foreground rounded">
          Action
        </button>
      </div>
    ),
  };

  return examples[type];
};
