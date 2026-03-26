import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
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
        'cursor-grab active:cursor-grabbing transition-all duration-200 glass-card p-4 group',
        isDragging && 'opacity-70 scale-105 z-50 glow-border',
        disabled && 'opacity-30 cursor-not-allowed grayscale'
      )}
    >
      <div className="flex items-center justify-between">
        {children}
        {!disabled && (
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        )}
      </div>
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
        'min-h-[72px] rounded-2xl border-2 transition-all duration-300 flex items-center justify-center p-2 relative overflow-hidden',
        !isOccupied ? 'border-dashed border-white/20 hover:border-white/40 bg-white/5 backdrop-blur-sm' : 'border-transparent',
        isOver && !isOccupied && 'border-primary/60 bg-primary/20 scale-[1.02] glow-border',
        isOccupied && 'border-success/50 bg-success/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]',
        className
      )}
    >
      {isOver && !isOccupied && (
        <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
      )}
      {children || (
        <span className="text-white/40 text-sm font-medium tracking-wide font-sans z-10">
          {placeholder}
        </span>
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
    { id: 'email-element', content: 'hello@yourdomain.com', type: 'email' as const, label: 'Email Field' },
    { id: 'button-element', content: 'Secure Sign In', type: 'button' as const, label: 'CTA Button' },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedItem = toolboxItems.find((item) => item.id === active.id);
    if (!draggedItem) return;

    const zoneId = over.id as string;
    
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
        message: 'Perfect placement! Brilliant intuition.',
        principle: draggedItem.type === 'email' ? 'Visual Hierarchy' : 'CTA Prominence',
      });
    } else {
      setFeedback({
        type: 'error',
        message: `The ${draggedItem.label} doesn't quite fit there.`,
        principle: 'Logical Content Structure',
      });
    }

    setTimeout(() => setFeedback(null), 3500);
  };

  const checkCompletion = useCallback(() => {
    const hasName = userName.trim().length > 0;
    const hasEmail = droppedElements['zone-email'] !== null;
    const hasButton = droppedElements['zone-button'] !== null;

    if (hasName && hasEmail && hasButton) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete(userName, 'hello@yourdomain.com');
      }, 2500);
    }
  }, [userName, droppedElements, onComplete]);

  React.useEffect(() => {
    checkCompletion();
  }, [checkCompletion]);

  const usedItems = Object.values(droppedElements).filter(Boolean).map((el) => el!.id);

  return (
    <DndContext 
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full max-w-5xl mx-auto rounded-3xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Toolbox Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel p-6 sticky top-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-[0.2em]">
                  Components UI
                </h3>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="block w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                {toolboxItems.map((item) => {
                  const isUsed = usedItems.includes(item.id);
                  return (
                    <DraggableItem key={item.id} id={item.id} disabled={isUsed}>
                      <div>
                        <div className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1.5 opacity-80">
                          {item.label}
                        </div>
                        <div className="text-base font-semibold text-white/90 truncate">{item.content}</div>
                      </div>
                    </DraggableItem>
                  );
                })}
              </div>
              
              <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
                <p className="text-sm text-white/60 leading-relaxed font-light ml-2">
                  <span className="font-semibold text-white/90">Mission:</span> Assemble the perfect high-converting login interface by dragging components to their optimal structural positions.
                </p>
              </div>
            </div>
          </div>

          {/* Canvas Preview Area */}
          <div className="lg:col-span-8">
            <div className="glass-panel p-8 sm:p-12 min-h-[500px] relative">
              {/* Subtle grid background for the canvas to make it feel like an editor */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 rounded-3xl pointer-events-none" />
              
              <div className="max-w-md mx-auto space-y-8 relative z-10 pt-4">
                
                {/* Heading - Name Input */}
                <div className="space-y-3 relative group">
                  <label className="text-[11px] text-white/40 uppercase font-bold tracking-[0.2em] ml-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Jane Doe"
                      className={cn(
                        'w-full px-5 py-4 bg-background/50 border border-white/10 rounded-2xl',
                        'text-2xl font-bold text-white placeholder:text-white/20',
                        'focus:outline-none focus:border-primary/50 focus:bg-background/80 focus:ring-4 focus:ring-primary/20',
                        'transition-all duration-300 shadow-inner'
                      )}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center pointer-events-none">
                      <span className="text-white/30 text-xs text-center font-bold">Aa</span>
                    </div>
                  </div>
                  <AnimatePresence>
                    {userName && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        className="text-xs text-success font-semibold flex items-center gap-2 ml-1"
                      >
                        <span className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center">✓</span> 
                        Heading established
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email Drop Zone */}
                <div className="space-y-3">
                  <label className="text-[11px] text-white/40 uppercase font-bold tracking-[0.2em] ml-1 flex items-center justify-between">
                    <span>Email Address</span>
                    {droppedElements['zone-email'] && <span className="text-success glow-text">Connected</span>}
                  </label>
                  <DropZone
                    id="zone-email"
                    placeholder="Drop email field component here..."
                    isOccupied={!!droppedElements['zone-email']}
                  >
                    {droppedElements['zone-email'] && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-medium text-lg flex items-center gap-3 backdrop-blur-md"
                      >
                        <span className="text-primary">@</span>
                        {droppedElements['zone-email'].content}
                      </motion.div>
                    )}
                  </DropZone>
                </div>

                {/* Button Drop Zone */}
                <div className="pt-6">
                  <DropZone
                    id="zone-button"
                    placeholder="Drop Call-to-Action button"
                    isOccupied={!!droppedElements['zone-button']}
                    className="min-h-[80px]"
                  >
                    {droppedElements['zone-button'] && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full h-full flex"
                      >
                        <button className="w-full h-full min-h-[64px] rounded-2xl bg-gradient-to-r from-primary via-[#9d4edd] to-accent text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(109,40,217,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-white/20 shadow-xl overflow-hidden relative group">
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                          <span className="relative z-10">{droppedElements['zone-button'].content}</span>
                        </button>
                      </motion.div>
                    )}
                  </DropZone>
                </div>
              </div>

              {/* Spectacular Completion Overlay */}
              <AnimatePresence>
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 bg-background/60 z-50 flex items-center justify-center rounded-3xl"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ type: 'spring', damping: 20, delay: 0.3 }}
                      className="text-center bg-card/80 border border-white/10 p-12 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-sm mx-auto glow-border"
                    >
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.6 }}
                        className="w-24 h-24 bg-gradient-to-tr from-success to-[#4ade80] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                      >
                        <span className="text-5xl text-success-foreground">✓</span>
                      </motion.div>
                      <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-3">
                        Masterpiece!
                      </h3>
                      <p className="text-white/60 font-medium leading-relaxed">
                        You've architected a beautiful, high-converting interface with perfect visual hierarchy.
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Immersive Feedback Toasts */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
            >
              <div className={cn(
                'min-w-[320px] px-6 py-5 rounded-2xl border backdrop-blur-3xl shadow-2xl flex items-start gap-4',
                feedback.type === 'success' && 'bg-success/10 border-success/30',
                feedback.type === 'error' && 'bg-destructive/10 border-destructive/30',
                feedback.type === 'warning' && 'bg-warning/10 border-warning/30'
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner",
                  feedback.type === 'success' ? 'bg-success/20 text-success' : 
                  feedback.type === 'error' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                )}>
                  <span className="text-xl font-bold">
                    {feedback.type === 'success' ? '✓' : feedback.type === 'error' ? '✕' : '⚠'}
                  </span>
                </div>
                <div className="pt-0.5">
                  <h4 className={cn(
                    "font-bold text-base mb-1",
                    feedback.type === 'success' ? 'text-success' : 
                    feedback.type === 'error' ? 'text-destructive' : 'text-warning'
                  )}>
                    {feedback.type === 'success' ? 'Exceptional' : 'Not quite right'}
                  </h4>
                  <p className="text-white/80 font-medium text-sm leading-relaxed">{feedback.message}</p>
                  {feedback.principle && (
                    <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/20 border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Principle Applied</span>
                      <span className="text-xs font-mono text-white/90">{feedback.principle}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gorgeous Drag Overlay */}
      <DragOverlay dropAnimation={{ duration: 400, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeId && (
          <div className="glass-card border-primary p-4 shadow-[0_20px_50px_rgba(109,40,217,0.5)] scale-110 rotate-3 cursor-grabbing cursor-grabbing-important">
            <div className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1.5 opacity-80">
              {toolboxItems.find(i => i.id === activeId)?.label}
            </div>
            <div className="text-base font-semibold text-white truncate">
              {toolboxItems.find(i => i.id === activeId)?.content}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
