/* eslint-disable no-nested-ternary */
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Tag from '../../atoms/Tag';
import Card from '../../molecules/Card';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import UserAvatar from '../../molecules/UserAvatar';
import ScrollArrow from '../../atoms/ScrollArrow';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import useHoverArrows from '../../../utils/hooks/useHoverArrows';
import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_CARDS_SECTIONS } from '../../../constants/timings';

const SCROLL_STEP = {
  tablet: 3,
  desktop: 5,
};

interface ICardSection {
  user?: any,
  type?: 'default' | 'creator'
  title?: string,
  category: string,
  collection: {}[],
}

export const CardsSection: React.FC<ICardSection> = (props) => {
  const {
    user,
    type,
    title,
    category,
    collection,
  } = props;
  const { t } = useTranslation('home');
  const router = useRouter();
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
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);

  let collectionToRender = collection;
  let renderShowMore = false;
  let scrollStep = SCROLL_STEP.desktop;

  if (isMobile && collection.length > 3) {
    renderShowMore = true;
    collectionToRender = collection.slice(0, 3);
  }

  if (resizeMode === 'tablet') {
    scrollStep = SCROLL_STEP.tablet;
  }

  const restore = useCallback(() => setWasDragged(false), []);
  const handleUserClick = () => {
    router.push(`/${category}`);
  };
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

    scroller.scrollTo(`cards-section-${category}-${scrollTo}`, {
      offset: -32,
      smooth: 'easeInOutQuart',
      duration: SCROLL_CARDS_SECTIONS,
      horizontal: true,
      containerId: `${category}-scrollContainer`,
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

    if (mouseInitial && e.clientX !== mouseInitial) {
      setWasDragged(true);
    }

    scrollContainerRef.current.scrollLeft = scrollX - e.clientX + clientX;
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
    <SItemWrapper key={`${category}-${item.id}`} name={`cards-section-${category}-${index}`}>
      <Card
        item={item}
        index={index + 1}
        width={isMobile ? '100vw' : isTablet ? '200px' : '224px'}
        height={isMobile ? '564px' : isTablet ? '300px' : '336px'}
        restore={restore}
        preventClick={wasDragged}
        onMouseLeave={handleItemMouseLeave}
        onMouseDownCapture={handleItemMouseDownCapture}
      />
    </SItemWrapper>
  ), [
    restore,
    isTablet,
    category,
    isMobile,
    wasDragged,
    handleItemMouseLeave,
    handleItemMouseDownCapture,
  ]);

  const {
    renderLeftArrow,
    renderRightArrow,
  } = useHoverArrows(ref);
  const handleSeeMoreCLick = () => {
    router.push(`/search?category=${category}`);
  };

  useEffect(() => {
    scrollContainerRef.current.addEventListener('scroll', () => {
      const currentScrollPosition = scrollContainerRef.current.scrollLeft;
      const childWidth = scrollContainerRef.current.firstChild.getBoundingClientRect().width;

      setVisibleListItem(+(currentScrollPosition / childWidth).toFixed(0));
    });
  }, []);
  useEffect(() => {
    setCanScrollLeft(visibleListItem !== 0);
    setCanScrollRight(visibleListItem <= collection.length - scrollStep);
  }, [visibleListItem, collection, scrollStep]);

  return (
    <SWrapper
      name={category}
      layoutId={category}
      transition={{
        ease: 'easeInOut',
        duration: 1,
      }}
    >
      <STopWrapper>
        {type === 'default' ? (
          <Headline
            variant={4}
            animation="t-01"
          >
            {title}
          </Headline>
        ) : (
          <AnimatedPresence
            animation="t-01"
          >
            <SCreatorHeadline onClick={handleUserClick}>
              <UserAvatar user={user} />
              <SHeadline variant={4}>
                {user.username}
              </SHeadline>
              <Tag>
                {t('button-creator-on-the-rise')}
              </Tag>
            </SCreatorHeadline>
          </AnimatedPresence>
        )}
        {!isMobile && (
          <SCaption
            weight={700}
            onClick={handleSeeMoreCLick}
          >
            {t(type === 'default' ? 'button-show-more' : 'button-show-more-creator')}
          </SCaption>
        )}
      </STopWrapper>
      <SListContainer ref={ref}>
        <SListWrapper
          id={`${category}-scrollContainer`}
          ref={scrollContainerRef}
          onMouseUp={mouseUpHandler}
          onMouseDown={mouseDownHandler}
          onMouseMove={mouseMoveHandler}
          onMouseLeave={mouseUpHandler}
        >
          {collectionToRender.map(renderItem)}
        </SListWrapper>
        {!isMobile && (
          <>
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
          </>
        )}
      </SListContainer>
      {renderShowMore && (
        <SButtonHolder>
          <Button
            size="lg"
            view="secondary"
            onClick={handleSeeMoreCLick}
          >
            {t(type === 'default' || isMobile ? 'button-show-more' : 'button-show-more-creator')}
          </Button>
        </SButtonHolder>
      )}
    </SWrapper>
  );
};

export default CardsSection;

CardsSection.defaultProps = {
  type: 'default',
  user: {},
  title: '',
};

interface ISWrapper {
  name: string;
}

const SWrapper = styled(motion.section)<ISWrapper>`
  padding: 24px 0;

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
  padding: 8px 0 0 0;
  position: relative;
  overflow-x: auto;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    left: -32px;
    padding: 24px 24px 0 24px;
    flex-direction: row;

    ::-webkit-scrollbar {
      display: none;
    }
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 32px 0 0 0;
  }
`;

interface ISItemWrapper {
  name: string;
}

const SItemWrapper = styled.div<ISItemWrapper>`
  margin: 16px 0;

  ${(props) => props.theme.media.tablet} {
    margin: 0 8px;
  }

  ${(props) => props.theme.media.laptop} {
    margin: 0 16px;
  }
`;

const SButtonHolder = styled.div`
  display: flex;
  position: relative;
  margin-top: 8px;
  align-items: center;
  justify-content: center;

  button {
    width: 100%;
  }
`;

const STopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SCaption = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  cursor: pointer;
  transition: color ease 0.5s;

  &:hover {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
`;

const SCreatorHeadline = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SHeadline = styled(Headline)`
  margin: 0 8px;

  ${(props) => props.theme.media.tablet} {
    margin: 0 16px;
  }
`;
