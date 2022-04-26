import { useEffect, useState } from 'react';

export const useScrollGradients = (ref: any, reverse: boolean = false) => {
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  useEffect(() => {
    if (reverse) {
      setShowTopGradient(ref.current?.scrollHeight > ref.current?.clientHeight);
    } else {
      setShowBottomGradient(ref.current?.scrollHeight > ref.current?.clientHeight);
    }

    const handleScroll = () => {
      const scrollY = ref.current?.scrollTop;
      const scrollHeight = ref.current?.scrollHeight;
      const clientHeight = ref.current?.clientHeight;

      if (reverse) {
        setShowTopGradient(scrollHeight + scrollY !== clientHeight);
        setShowBottomGradient(scrollY !== 0);
      } else {
        setShowTopGradient(scrollY !== 0);
        setShowBottomGradient((scrollHeight - scrollY) - clientHeight > 2);
      }
    };

    ref.current?.addEventListener('scroll', handleScroll);
  }, [ref, reverse]);

  return {
    showTopGradient,
    showBottomGradient,
  };
};

export default useScrollGradients;
