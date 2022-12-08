import { useState, useEffect, useRef } from 'react';

function useDraggableScroll<T extends HTMLElement>() {
  const scrollContainerRef = useRef<T>(null);
  const [clientX, setClientX] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = isDragging
        ? 'grabbing'
        : 'grab';
    }
  }, [isDragging, scrollContainerRef]);

  const onMouseDown = (e: any) => {
    if (!scrollContainerRef.current) {
      return;
    }

    setIsDragging(true);
    setClientX(e.clientX);
    setScrollX(scrollContainerRef.current.scrollLeft);
  };

  const onMouseMove = (e: any) => {
    if (!scrollContainerRef.current) {
      return;
    }

    if (isDragging) {
      scrollContainerRef.current.scrollLeft = scrollX - e.clientX + clientX;
      setScrollX((scrollXValue) => scrollXValue - e.clientX + clientX);
      setClientX(e.clientX);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  return {
    scrollContainerRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}

export default useDraggableScroll;
