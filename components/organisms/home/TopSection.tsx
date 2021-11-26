import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [visibleListItem, setVisibleListItem] = useState(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [clientX, setClientX] = useState<number>(0);
  const [scrollX, setScrollX] = useState<number>(0);

  // To check if we're really dragging and avoid clicks on children
  const [wasDragged, setWasDragged] = useState(false);
  const [mouseInitial, setMouseInitial] = useState<number>(0);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const country = 'USA';
  let scrollStep = SCROLL_STEP.desktop;

  if (['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode)) {
    scrollStep = SCROLL_STEP.mobile;
  } else if (resizeMode === 'tablet') {
    scrollStep = SCROLL_STEP.tablet;
  }

  const restore = useCallback(() => setWasDragged(false), []);
  const handleLeftClick = () => {
    scrollListTo(visibleListItem - scrollStep - 1);
  };
  const handleRightClick = () => {
    scrollListTo(visibleListItem + scrollStep);
  };
  const scrollListTo = (to: number) => {
    let scrollTo = to;

    if (to < 0) {
      scrollTo = 0;
    } else if (scrollTo > collection.length - 1) {
      scrollTo = collection.length - 1;
    }

    scroller.scrollTo(`top-section-${scrollTo}`, {
      offset: -32,
      smooth: 'easeInOutQuart',
      duration: SCROLL_TOP_10,
      horizontal: true,
      containerId: 'topScrollContainer',
    });
  };
  const mouseDownHandler = (e: any) => {
    setIsDragging(true);
    setClientX(e.clientX);
    setScrollX(scrollContainerRef.current.scrollLeft);
    setMouseInitial(e.clientX);
  };
  const mouseMoveHandler = (e: any) => {
    if (!isDragging) {
      return;
    }

    scrollContainerRef.current.scrollLeft = scrollX - e.clientX + clientX;
    if (mouseInitial && e.clientX !== mouseInitial) {
      setWasDragged(true);
    }
    setClientX(e.clientX);
    setScrollX(scrollX - e.clientX + clientX);
  };
  const mouseUpHandler = () => {
    if (!isDragging) return;

    // if (mouseInitial < clientX) {
    //   if (canScrollLeft) {
    //     handleLeftClick();
    //   }
    // } else if (mouseInitial > clientX) {
    //   if (canScrollRight) {
    //     handleRightClick();
    //   }
    // }

    setIsDragging(false);
  };

  // Handlers for cards to avoid unncessary clicks
  const handleItemMouseDownCapture = useCallback((e: any) => {
    setMouseInitial(e.clientX);
  }, []);

  const handleItemMouseLeave = useCallback(() => {
    if (wasDragged) {
      setWasDragged(false);
      setMouseInitial(0);
    }
  }, [wasDragged]);

  const renderItem = useCallback((item: any, index: number) => (
    <SItemWrapper key={item.id} name={`top-section-${index}`}>
      <Card
        type="inside"
        item={item}
        index={index + 1}
        restore={restore}
        preventClick={wasDragged}
        onMouseLeave={handleItemMouseLeave}
        onMouseDownCapture={handleItemMouseDownCapture}
      />
    </SItemWrapper>
  ), [handleItemMouseDownCapture, handleItemMouseLeave, restore, wasDragged]);

  const {
    renderLeftArrow,
    renderRightArrow,
  } = useHoverArrows(ref);

  useEffect(() => {
    scrollContainerRef.current.addEventListener('scroll', () => {
      const currentScrollPosition = scrollContainerRef.current.scrollLeft;
      const childWidth = scrollContainerRef.current.firstChild.getBoundingClientRect().width;

      setVisibleListItem(+(currentScrollPosition / childWidth).toFixed(0));
    });
  }, []);
  useEffect(() => {
    setCanScrollLeft(visibleListItem !== 0);
    setCanScrollRight(visibleListItem < collection.length - 1);
  }, [visibleListItem, collection]);

  return (
    <SWrapper
      name="topSection"
      layoutId="topSection"
      transition={{
        ease: 'easeInOut',
        duration: 1,
      }}
    >
      <Headline
        variant={4}
        animation="t-01"
      >
        {t('top-block-title', { country })}
      </Headline>
      <SListContainer ref={ref}>
        <SListWrapper
          id="topScrollContainer"
          ref={scrollContainerRef}
          onMouseUp={mouseUpHandler}
          onMouseDown={mouseDownHandler}
          onMouseMove={mouseMoveHandler}
          onMouseLeave={mouseUpHandler}
        >
          {collection.map(renderItem)}
        </SListWrapper>
        {!isDragging && canScrollLeft && (
          <ScrollArrow
            active={renderLeftArrow}
            position="left"
            handleClick={handleLeftClick}
          />
        )}
        {!isDragging && canScrollRight && (
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

const SWrapper = styled(motion.section)<ISWrapper>`
  padding: 0 0 48px 0;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

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
