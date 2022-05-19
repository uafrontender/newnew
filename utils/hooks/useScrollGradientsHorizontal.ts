import React, { useEffect, useState } from 'react';

export const useScrollGradientsHorizontal = (
  ref: React.MutableRefObject<HTMLDivElement | undefined>
) => {
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(() => {
    const scrollX = ref.current?.scrollLeft;
    const scrollWidth = ref.current?.scrollWidth;
    const clientWidth = ref.current?.clientWidth;
    return scrollWidth!! - scrollX!! !== clientWidth;
  });

  useEffect(() => {
    setShowRightGradient(
      ref.current?.scrollWidth!! > ref.current?.clientWidth!!
    );

    const handleScroll = () => {
      const scrollX = ref.current?.scrollLeft;
      const scrollWidth = ref.current?.scrollWidth;
      const clientWidth = ref.current?.clientWidth;

      setShowLeftGradient(scrollX !== 0);
      setShowRightGradient(scrollWidth!! - scrollX!! !== clientWidth);
    };

    ref.current?.addEventListener('scroll', handleScroll);
  }, [ref]);

  return {
    showLeftGradient,
    showRightGradient,
  };
};

export default useScrollGradientsHorizontal;
