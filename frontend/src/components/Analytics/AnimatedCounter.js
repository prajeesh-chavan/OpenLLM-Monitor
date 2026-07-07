import { useState, useEffect, useRef } from "react";

export default function useAnimatedCounter(endValue, duration = 2000, startDelay = 0) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef();
  const startTimeRef = useRef();

  const startAnimation = () => {
    if (isAnimating) return;
    setTimeout(() => {
      setIsAnimating(true);
      startTimeRef.current = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCurrentValue(Math.floor(endValue * easeOutQuart));
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, startDelay);
  };

  useEffect(() => {
    if (endValue > 0) startAnimation();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [endValue]);

  return currentValue;
}
