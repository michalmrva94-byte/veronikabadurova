import { ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
}

const THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullDistance = useMotionValue(0);

  const opacity = useTransform(pullDistance, [0, THRESHOLD], [0, 1]);
  const scale = useTransform(pullDistance, [0, THRESHOLD], [0.5, 1]);
  const rotate = useTransform(pullDistance, [0, THRESHOLD, MAX_PULL], [0, 180, 360]);

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isAtTop() && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [isAtTop, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && isAtTop()) {
      // Dampen the pull effect
      const dampened = Math.min(diff * 0.5, MAX_PULL);
      pullDistance.set(dampened);
      
      if (dampened > 10) {
        e.preventDefault();
      }
    } else {
      pullDistance.set(0);
    }
  }, [isAtTop, isRefreshing, pullDistance]);

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;

    const currentPull = pullDistance.get();
    
    if (currentPull >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      pullDistance.set(60);
      
      // Small delay for visual feedback, then reload
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } else {
      pullDistance.set(0);
    }
  }, [pullDistance, isRefreshing]);

  useEffect(() => {
    const options: AddEventListenerOptions = { passive: false };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <>
      {/* Pull indicator */}
      <motion.div
        style={{ opacity, scale, y: useTransform(pullDistance, [0, MAX_PULL], [-40, 20]) }}
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center pointer-events-none safe-top"
      >
        <div className="mt-16 flex items-center justify-center w-10 h-10 rounded-full bg-background shadow-lg border border-border">
          <motion.div style={{ rotate }}>
            <RefreshCw 
              className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </motion.div>
        </div>
      </motion.div>
      {children}
    </>
  );
}
