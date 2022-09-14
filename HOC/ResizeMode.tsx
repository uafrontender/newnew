import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react';
import _map from 'lodash/map';
import styled from 'styled-components';
import ResizeObserver from 'resize-observer-polyfill';

import { sizes } from '../styles/media';
import { setResizeMode, TResizeMode } from '../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux-store/store';

interface IResizeMode {
  children: React.ReactNode;
}

export const ResizeMode: React.FC<IResizeMode> = (props) => {
  const { children } = props;
  const ref: MutableRefObject<any> = useRef();
  const resizeObserver = useRef<ResizeObserver | undefined>();
  // TODO: these two cause handleResizeObserver and thus the whole logic to restart. Change it
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const handleResizeObserver = useCallback(() => {
    let newResizeMode: string = '';
    _map(sizes, (value: number, key: string) => {
      const element = ref.current;
      if (!newResizeMode && element && element.offsetWidth >= value) {
        newResizeMode = key;
      }
    });

    if (resizeMode !== newResizeMode) {
      dispatch(setResizeMode(newResizeMode as TResizeMode));
    }
  }, [dispatch, resizeMode]);

  const start = useCallback(() => {
    if (resizeObserver.current) {
      return;
    }

    const newResizeObserver = new ResizeObserver(handleResizeObserver);
    newResizeObserver.observe(ref.current);
    resizeObserver.current = newResizeObserver;
  }, [handleResizeObserver]);

  const stop = useCallback(() => {
    if (!resizeObserver.current) {
      return;
    }

    resizeObserver.current.disconnect();
    resizeObserver.current = undefined;
  }, []);

  useEffect(() => {
    start();

    return () => {
      stop();
    };
  }, [start, stop]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        start();
      } else {
        stop();
      }
    }

    window.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [start, stop]);

  return <SContainer ref={ref}>{children}</SContainer>;
};

export default ResizeMode;

const SContainer = styled.div`
  max-width: 100%;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
`;
