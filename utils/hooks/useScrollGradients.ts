import { useEffect, useState } from 'react';

export const useScrollGradients = (
  ref: any,
  loaded?: boolean,
  reverse: boolean = false
) => {
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  useEffect(() => {
    if (reverse) {
      setShowTopGradient(ref.current?.scrollHeight > ref.current?.clientHeight);
    } else {
      setShowBottomGradient(
        ref.current?.scrollHeight > ref.current?.clientHeight
      );
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
        setShowBottomGradient(scrollHeight - scrollY - clientHeight > 2);
      }
    };

    ref.current?.addEventListener('scroll', handleScroll);
  }, [ref, reverse]);

  // Re-calculate after mounting
  useEffect(
    () => {
      setTimeout(() => {
        if (reverse) {
          setShowTopGradient(
            ref.current?.scrollHeight > ref.current?.clientHeight
          );
        } else {
          setShowBottomGradient(
            ref.current?.scrollHeight > ref.current?.clientHeight
          );
        }
      }, 2000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      loaded,
      // ref, - reason unknown
      // reverse, - reason unknown
    ]
  );

  return {
    showTopGradient,
    showBottomGradient,
  };
};

export default useScrollGradients;
