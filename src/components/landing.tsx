import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoginBuilderProps {
  onComplete: (name: string, email: string) => void;
}

interface DroppedElement {
  id: string;
  content: string;
  type: 'name' | 'email' | 'button';
}

const DraggableItem: React.FC<{ id: string; children: React.ReactNode; disabled?: boolean }> = ({
  id,
  children,
  disabled,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all duration-200',
        isDragging && 'opacity-50 z-50',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {children}
    </div>
  );
};

const DropZone: React.FC<{
  id: string;
  children?: React.ReactNode;
  placeholder?: string;
  className?: string;
  isOccupied?: boolean;
}> = ({ id, children, placeholder, className, isOccupied }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[48px] rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center',
        isOver && !isOccupied
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : 'border-border',
        isOccupied && 'border-solid border-success/50 bg-success/5',
        className
      )}
    >
      {children || (
        <span className="text-muted-foreground text-sm">{placeholder}</span>
      )}
    </div>
  );
};

export const LoginBuilder: React.FC<LoginBuilderProps> = ({ onComplete }) => {
  const [userName, setUserName] = useState('');
  const [droppedElements, setDroppedElements] = useState<Record<string, DroppedElement | null>>({
    'zone-heading': null,
    'zone-email': null,
    'zone-button': null,
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string; principle?: string } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const toolboxItems = [
    { id: 'email-element', content: 'you@email.com', type: 'email' as const, label: 'Email Field' },
    { id: 'button-element', content: 'Sign In', type: 'button' as const, label: 'CTA Button' },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedItem = toolboxItems.find((item) => item.id === active.id);
    if (!draggedItem) return;

    const zoneId = over.id as string;
    
    // Check if dropping in correct zone
    const correctZones: Record<string, string> = {
      'email-element': 'zone-email',
      'button-element': 'zone-button',
    };

    if (correctZones[draggedItem.id] === zoneId) {
      setDroppedElements((prev) => ({
        ...prev,
        [zoneId]: { id: draggedItem.id, content: draggedItem.content, type: draggedItem.type },
      }));
      setFeedback({
        type: 'success',
        message: 'Correct placement!',
        principle: draggedItem.type === 'email' ? 'Visual Hierarchy' : 'CTA Prominence',
      });
    } else {
      setFeedback({
        type: 'error',
        message: `The ${draggedItem.label} doesn't belong here.`,
        principle: 'Logical Content Structure',
      });
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  const checkCompletion = useCallback(() => {
    const hasName = userName.trim().length > 0;
    const hasEmail = droppedElements['zone-email'] !== null;
    const hasButton = droppedElements['zone-button'] !== null;

    if (hasName && hasEmail && hasButton) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete(userName, 'user@email.com');
      }, 1500);
    }
  }, [userName, droppedElements, onComplete]);

  React.useEffect(() => {
    checkCompletion();
  }, [checkCompletion]);

  const usedItems = Object.values(droppedElements)
    .filter(Boolean)
    .map((el) => el!.id);

  return (
    <DndContext 
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Toolbox */}
          <div className="lg:col-span-1">
            <div className="toolbox sticky top-8">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                Components
              </h3>
              <div className="space-y-3">
                {toolboxItems.map((item) => {
                  const isUsed = usedItems.includes(item.id);
                  return (
                    <DraggableItem key={item.id} id={item.id} disabled={isUsed}>
                      <div
                        className={cn(
                          'tool-item',
                          isUsed && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {item.label}
                        </div>
                        <div className="text-sm font-medium">{item.content}</div>
                      </div>
                    </DraggableItem>
                  );
                })}
              </div>
              <div className="mt-6 p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Drag components to the correct positions on the login form.
                </p>
              </div>
            </div>
          </div>

          {/* Canvas - Login Form Preview */}
          <div className="lg:col-span-2">
            <div className="ui-canvas p-8 min-h-[400px]">
              <div className="max-w-sm mx-auto space-y-6">
                {/* Heading - Name Input */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name..."
                    className={cn(
                      'w-full px-4 py-3 bg-secondary border border-border rounded-lg',
                      'text-2xl font-semibold text-foreground placeholder:text-muted-foreground/50',
                      'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                      'transition-all duration-200'
                    )}
                  />
                  {userName && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-success flex items-center gap-1"
                    >
                      <span>✓</span> Heading established
                    </motion.div>
                  )}
                </div>

                {/* Email Drop Zone */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <DropZone
                    id="zone-email"
                    placeholder="Drop email field here"
                    isOccupied={!!droppedElements['zone-email']}
                  >
                    {droppedElements['zone-email'] && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full px-4 py-3 bg-secondary rounded-lg text-foreground"
                      >
                        {droppedElements['zone-email'].content}
                      </motion.div>
                    )}
                  </DropZone>
                </div>

                {/* Button Drop Zone */}
                <div className="pt-4">
                  <DropZone
                    id="zone-button"
                    placeholder="Drop CTA button here"
                    isOccupied={!!droppedElements['zone-button']}
                    className="min-h-[56px]"
                  >
                    {droppedElements['zone-button'] && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full"
                      >
                        <Button variant="gradient" size="lg" className="w-full">
                          {droppedElements['zone-button'].content}
                        </Button>
                      </motion.div>
                    )}
                  </DropZone>
                </div>
              </div>

              {/* Completion Overlay */}
              <AnimatePresence>
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl"
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-success-foreground">✓</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        Perfect Login Form!
                      </h3>
                      <p className="text-muted-foreground">
                        You've demonstrated understanding of visual hierarchy.
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Feedback Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={cn(
                'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
                'px-6 py-4 rounded-xl border backdrop-blur-xl shadow-2xl',
                feedback.type === 'success' && 'bg-success/10 border-success/30 text-success',
                feedback.type === 'error' && 'bg-destructive/10 border-destructive/30 text-destructive',
                feedback.type === 'warning' && 'bg-warning/10 border-warning/30 text-warning'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {feedback.type === 'success' ? '✓' : feedback.type === 'error' ? '✕' : '⚠'}
                </span>
                <div>
                  <p className="font-medium">{feedback.message}</p>
                  {feedback.principle && (
                    <p className="text-sm opacity-70">
                      Principle: <span className="font-mono">{feedback.principle}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && (
          <div className="tool-item shadow-2xl shadow-primary/30 scale-105">
            {toolboxItems.find((i) => i.id === activeId)?.content}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
