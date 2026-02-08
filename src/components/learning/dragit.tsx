import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable, useDroppable, DndContext, DragEndEvent } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DraggableElementProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  id,
  children,
  className,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-shadow',
        isDragging && 'z-50 shadow-2xl shadow-primary/20',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};

interface DroppableZoneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  acceptedIds?: string[];
  onValidDrop?: () => void;
  onInvalidDrop?: () => void;
}

export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  children,
  className,
  acceptedIds = [],
  onValidDrop,
  onInvalidDrop,
}) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
  });

  const isValidTarget = active && acceptedIds.includes(active.id as string);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'drop-zone min-h-[60px] flex items-center justify-center',
        isOver && isValidTarget && 'drop-zone-valid',
        isOver && !isValidTarget && active && 'drop-zone-invalid',
        isOver && !active && 'drop-zone-active',
        className
      )}
    >
      {children}
    </div>
  );
};

interface FeedbackToastProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  principle?: string;
  visible: boolean;
  onClose: () => void;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({
  message,
  type,
  principle,
  visible,
  onClose,
}) => {
  const variants = {
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
    info: 'bg-primary/10 border-primary/30 text-primary',
  };

  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'px-6 py-4 rounded-xl border backdrop-blur-xl',
            'max-w-md shadow-2xl',
            variants[type]
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{icons[type]}</span>
            <div className="flex-1">
              <p className="font-medium">{message}</p>
              {principle && (
                <p className="mt-1 text-sm opacity-80">
                  Principle: <span className="font-mono">{principle}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
