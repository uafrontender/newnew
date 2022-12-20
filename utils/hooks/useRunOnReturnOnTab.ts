import { useRef, useEffect } from 'react';
import usePageVisibility from './usePageVisibility';

const useRunOnReturnOnTab = (callback: () => void) => {
  const isTabVisible = usePageVisibility();
  const previousIsTabVisible = useRef(isTabVisible);

  useEffect(() => {
    if (!previousIsTabVisible.current && isTabVisible) {
      previousIsTabVisible.current = true;
      callback();
    }
  }, [isTabVisible, callback]);

  useEffect(() => {
    if (!isTabVisible) {
      previousIsTabVisible.current = false;
    }
  }, [isTabVisible]);
};

export default useRunOnReturnOnTab;
