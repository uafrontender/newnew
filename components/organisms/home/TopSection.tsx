import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useTranslation } from 'next-i18next';

import Card from '../../molecules/Card';
import Headline from '../../atoms/Headline';
import ScrollArrow from '../../atoms/ScrollArrow';

import useHoverArrows from '../../../utils/hooks/useHoverArrows';
import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_TOP_10 } from '../../../constants/timings';

const SCROLL_STEP = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

interface ITopSection {
  collection: {}[],
}

export const TopSection: React.FC<ITopSection> = (props) => {
  const { collection } = props;
  const { t } = useTranslation('home');
  const ref: any = useRef();
  const scrollContainerRef: any = useRef();
  const [listScroll, setListScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const country = 'USA';
  let scrollStep = SCROLL_STEP.desktop;

  if (['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode)) {
    scrollStep = SCROLL_STEP.mobile;
  } else if (resizeMode === 'tablet') {
    scrollStep = SCROLL_STEP.tablet;
  }

  const renderItem = (item: any, index: number) => (
    <SItemWrapper key={item.id} name={`top-section-${index}`}>
      <Card type="inside" item={item} index={index + 1} />
    </SItemWrapper>
  );
  const handleLeftClick = () => {
    setListScroll(listScroll - scrollStep);
  };
  const handleRightClick = () => {
    setListScroll(listScroll + scrollStep);
  };
  let pos = {
    x: 0,
    left: 0,
  };
  let timeout: any;

  const mouseDownHandler = (e: any) => {
    timeout = setTimeout(() => {
      scrollContainerRef.current.style.cursor = 'grabbing';
      scrollContainerRef.current.style.userSelect = 'none';
      e.target.style.cursor = 'grabbing';
      e.target.style.userSelect = 'none';
      e.target.addEventListener('click', (event: any) => event.stopImmediatePropagation(), { capture: true, once: true });
    }, 150);

    pos = {
      x: e.clientX,
      left: scrollContainerRef.current.scrollLeft,
    };
  };
  const mouseMoveHandler = (e: any) => {
    if (scrollContainerRef.current.style.cursor === 'grabbing') {
      const dx = e.clientX - pos.x;
      scrollContainerRef.current.scrollLeft = pos.left - dx;
    }
  };
  const mouseUpHandler = (e: any) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (e.clientX > pos.x) {
      if (canScrollLeft) {
        handleLeftClick();
      }
    } else if (e.clientX < pos.x) {
      if (canScrollRight) {
        handleRightClick();
      }
    }

    scrollContainerRef.current.style.cursor = 'grab';
    scrollContainerRef.current.style.removeProperty('user-select');
    e.target.style.cursor = 'pointer';
    e.target.removeEventListener('click', (event: any) => event.stopImmediatePropagation(), { capture: true, once: true });
  };

  const {
    renderLeftArrow,
    renderRightArrow,
  } = useHoverArrows(ref);

  useEffect(() => {
    scroller.scrollTo(`top-section-${listScroll}`, {
      offset: -32,
      smooth: 'easeInOutQuart',
      duration: SCROLL_TOP_10,
      horizontal: true,
      containerId: 'topScrollContainer',
    });

    setCanScrollLeft(listScroll !== 0);
    setCanScrollRight(listScroll < collection.length - scrollStep);
  }, [listScroll, collection, scrollStep]);

  return (
    <SWrapper name="topSection">
      <Headline variant={4}>
        {t('top-block-title', { country })}
      </Headline>
      <SListContainer ref={ref}>
        <SListWrapper
          id="topScrollContainer"
          ref={scrollContainerRef}
          onMouseUp={mouseUpHandler}
          onMouseDown={mouseDownHandler}
          onMouseMove={mouseMoveHandler}
        >
          {collection.map(renderItem)}
        </SListWrapper>
        {canScrollLeft && (
          <ScrollArrow
            active={renderLeftArrow}
            position="left"
            handleClick={handleLeftClick}
          />
        )}
        {canScrollRight && (
          <ScrollArrow
            active={renderRightArrow}
            position="right"
            handleClick={handleRightClick}
          />
        )}
      </SListContainer>
    </SWrapper>
  );
};

export default TopSection;

interface ISWrapper {
  name: string;
}

const SWrapper = styled.section<ISWrapper>`
  padding: 0 0 48px 0;

  ${(props) => props.theme.media.tablet} {
    padding: 32px 0;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 40px 0;
  }
`;

const SListContainer = styled.div`
  position: relative;
`;

const SListWrapper = styled.div`
  left: -16px;
  width: 100vw;
  cursor: grab;
  display: flex;
  padding: 0 8px;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  margin-top: 24px;

  ::-webkit-scrollbar {
    display: none;
  }

  ${(props) => props.theme.media.tablet} {
    left: -32px;
    padding: 0 16px;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 0;
    margin-top: 32px;
  }
`;

const SItemWrapper = styled.div<ISWrapper>`
  margin: 0 8px;

  ${(props) => props.theme.media.tablet} {
    margin: 0 12px;
  }

  ${(props) => props.theme.media.laptop} {
    margin: 0 20px;
  }
`;
