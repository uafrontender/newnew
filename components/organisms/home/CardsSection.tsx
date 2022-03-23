/* eslint-disable no-nested-ternary */
import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import Tag from '../../atoms/Tag';
import Card from '../../molecules/Card';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import UserAvatar from '../../molecules/UserAvatar';
import ScrollArrow from '../../atoms/ScrollArrow';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import useHoverArrows from '../../../utils/hooks/useHoverArrows';
import { formatString } from '../../../utils/format';
import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_CARDS_SECTIONS } from '../../../constants/timings';
import switchPostType from '../../../utils/switchPostType';
import { CardSkeletonSection } from '../../molecules/CardSkeleton';

const SCROLL_STEP = {
  tablet: 3,
  desktop: 5,
};

interface ICardSection {
  user?: {
    avatarUrl: string;
    username: string;
  };
  type?: 'default' | 'creator';
  title?: string;
  category: string;
  collection: newnewapi.Post[];
  loading?: boolean;
  handlePostClicked: (post: newnewapi.Post) => void;
}

export const CardsSection: React.FC<ICardSection> = ({
  user,
  type,
  title,
  category,
  collection,
  loading,
  handlePostClicked,
}) => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const ref: any = useRef();
  const scrollContainerRef: any = useRef();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [visibleListItem, setVisibleListItem] = useState(0);

  // Dragging state
  const [clientX, setClientX] = useState<number>(0);
  const [scrollX, setScrollX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseIsDown, setMouseIsDown] = useState(false);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);
  const isLaptop = ['laptop'].includes(resizeMode);
  const isDesktop = ['laptopL'].includes(resizeMode);

  let collectionToRender = collection;
  let renderShowMore = false;
  let scrollStep = SCROLL_STEP.desktop;

  if (isMobile && collection?.length > 3) {
    renderShowMore = true;
    collectionToRender = collection.slice(0, 3);
  }

  if (resizeMode === 'tablet') {
    scrollStep = SCROLL_STEP.tablet;
  }

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
    } else if (scrollTo > (collection?.length || 0) - 1) {
      scrollTo = (collection?.length || 0) - 1;
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
    setMouseIsDown(true);
    setClientX(e.clientX);
    setScrollX(scrollContainerRef.current.scrollLeft);
  };
  const mouseMoveHandler = (e: any) => {
    if (!mouseIsDown) {
      return;
    }

    scrollContainerRef.current.scrollLeft = scrollX - e.clientX + clientX;
    setClientX(e.clientX);
    setScrollX(scrollX - e.clientX + clientX);
    setIsDragging(true);
  };
  const mouseUpHandler = () => {
    setMouseIsDown(false);

    if (isDragging) {
      setTimeout(() => {
        setIsDragging(false);
      }, 0);
    }
  };

  const renderItem = (item: any, index: number) => {
    const handleItemClick = () => {
      if (!isDragging) {
        handlePostClicked(item);
      }
    };

    return (
      <SItemWrapper
        key={switchPostType(item)[0].postUuid}
        name={`cards-section-${category}-${index}`}
        onClick={handleItemClick}
      >
        <Card
          item={item}
          index={index + 1}
          width={isMobile ? '100vw' : isTablet ? '200px' : isLaptop ? '215px' : isDesktop ? '15vw' : '13vw'}
          height={isMobile ? '564px' : isTablet ? '300px' : '336px'}
        />
      </SItemWrapper>
    );
  };

  const {
    renderLeftArrow,
    renderRightArrow,
  } = useHoverArrows(ref);
  const handleSeeMoreCLick = () => {
    if (type === 'default') {
      router.push(`/search?category=${category}`);
    } else {
      handleUserClick();
    }
  };

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch(`/search?category=${category}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollContainerRef.current.addEventListener('scroll', () => {
      const currentScrollPosition = scrollContainerRef.current.scrollLeft;
      const childWidth = scrollContainerRef.current.firstChild.getBoundingClientRect().width;

      setVisibleListItem(+(currentScrollPosition / childWidth).toFixed(0));
    });
  }, []);
  useEffect(() => {
    setCanScrollLeft(visibleListItem !== 0);
    setCanScrollRight(visibleListItem <= (collection?.length || 0) - scrollStep);
  }, [visibleListItem, collection, scrollStep]);

  return (
    <SWrapper name={category}>
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
              <UserAvatar
                avatarUrl={user?.avatarUrl!!}
              />
              <SHeadline variant={4}>
                {user?.username!!}
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
            {t(type === 'default' ? 'button-show-more' : 'button-show-more-creator', { name: formatString(user?.username, true) })}
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
          {!loading
            ? collectionToRender?.map(renderItem)
            : (
              <CardSkeletonSection
                count={5}
              />
            )}
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
            {t(type === 'default' || isMobile ? 'button-show-more' : 'button-show-more-creator', { name: formatString(user?.username, true) })}
          </Button>
        </SButtonHolder>
      )}
    </SWrapper>
  );
};

export default CardsSection;

CardsSection.defaultProps = {
  type: 'default',
  user: {
    avatarUrl: '',
    username: '',
  },
  title: '',
  loading: undefined,
};

interface ISWrapper {
  name: string;
}

const SWrapper = styled.div<ISWrapper>`
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

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  ${(props) => props.theme.media.tablet} {
    left: -32px;
    padding: 24px 24px 0 24px;
    flex-direction: row;
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
