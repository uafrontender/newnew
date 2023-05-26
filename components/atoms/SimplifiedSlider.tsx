import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import isBrowser from '../../utils/isBrowser';

interface ISimplifiedSlider {
  currentSlide: number;
  wrapperRef: React.MutableRefObject<HTMLDivElement | undefined>;
  children: React.ReactElement[];
}

const SimplifiedSlider: React.FunctionComponent<ISimplifiedSlider> = ({
  currentSlide,
  wrapperRef,
  children,
}) => {
  const [initialized, setInitialized] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [width, setWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  // const slideWidth = 410;
  const slideWidth = useMemo(() => wrapperWidth, [wrapperWidth]);

  useEffect(() => {
    function handleResizeAndSetWidth() {
      const rect = wrapperRef?.current?.getBoundingClientRect();

      if (rect?.width) {
        setWrapperWidth(rect.width);
      }
    }

    if (isBrowser()) {
      window.addEventListener('resize', handleResizeAndSetWidth);
      handleResizeAndSetWidth();
    }

    return () => {
      window.removeEventListener('resize', handleResizeAndSetWidth);
    };
  }, [wrapperRef]);

  useEffect(() => {
    setWidth(slideWidth * children.length);
  }, [slideWidth, children]);

  useEffect(() => {
    setTranslateX(-1 * (currentSlide * slideWidth));
  }, [currentSlide, slideWidth]);

  useEffect(() => {
    if (wrapperWidth) {
      setInitialized(true);
    }
  }, [wrapperWidth]);

  if (!initialized) {
    return null;
  }

  return (
    <SSlider>
      <STrack
        style={{
          width: `${width}px`,
          transform: `translateX(${translateX}px)`,
        }}
      >
        <SList>
          {children.map((item, i) => (
            <SSlide
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              style={{
                width: slideWidth,
              }}
              tabIndex={-1}
              className='slide'
            >
              {item}
            </SSlide>
          ))}
        </SList>
      </STrack>
    </SSlider>
  );
};

export default SimplifiedSlider;

const SSlider = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  position: relative;
  display: block;
  box-sizing: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -khtml-user-select: none;
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
`;

const SList = styled.div`
  position: relative;
  display: block;
  overflow: hidden;
  margin: 0;
  padding: 0;
`;

// This one is transformed
const STrack = styled.div`
  position: relative;
  top: 0;
  left: 0;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  height: 100%;
  max-width: 4608px !important;
`;

const SSlide = styled.div`
  display: block;
  float: left;
  min-height: 1px;
  height: 100%;
  min-width: 200px !important;
  max-width: 768px !important;
`;
