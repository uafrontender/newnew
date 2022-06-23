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
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppSelector((state) => state.ui);

  const handleResizeObserver = useCallback(() => {
    let newResizeMode: string = '';
    _map(sizes, (value: number, key: string) => {
      if (!newResizeMode && ref.current && ref.current.offsetWidth >= value) {
        newResizeMode = key;
      }
    });

    if (resizeMode !== newResizeMode) {
      dispatch(setResizeMode(newResizeMode as TResizeMode));
    }
  }, [dispatch, resizeMode]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResizeObserver);

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResizeObserver]);

  return <SContainer ref={ref}>{children}</SContainer>;
};

export default ResizeMode;

const SContainer = styled.div`
  max-width: 100%;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
`;
