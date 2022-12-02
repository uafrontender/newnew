/* eslint-disable no-nested-ternary */
import React, { useRef, useState, useEffect, ReactElement } from 'react';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import PostCard from '../../molecules/PostCard';
import Button from '../../atoms/Button';
// import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import UserAvatar from '../../molecules/UserAvatar';
import ScrollArrowPermanent from '../../atoms/ScrollArrowPermanent';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import { formatString } from '../../../utils/format';
import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_CARDS_SECTIONS } from '../../../constants/timings';
import switchPostType from '../../../utils/switchPostType';
import { CardSkeletonSection } from '../../molecules/CardSkeleton';
import { Mixpanel } from '../../../utils/mixpanel';

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
  collection: newnewapi.IPost[];
  loading?: boolean;
  tutorialCard?: ReactElement;
  seeMoreLink?: string;
  padding?: 'small' | 'large';
  onReachEnd?: () => void;
}

export const CardsSection: React.FC<ICardSection> = React.memo(
  ({
    user,
    type,
    title,
    category,
    collection,
    loading,
    tutorialCard,
    seeMoreLink,
    onReachEnd,
    ...restProps
  }) => {
    const { t } = useTranslation('page-Home');
    const router = useRouter();
    const ref: any = useRef();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [visibleListItem, setVisibleListItem] = useState(0);

    // Dragging state
    const [clientX, setClientX] = useState<number>(0);
    const [scrollX, setScrollX] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [mouseIsDown, setMouseIsDown] = useState(false);

    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isTablet = ['tablet'].includes(resizeMode);
    // const isLaptop = ['laptop'].includes(resizeMode);
    // const isDesktop = ['laptopL'].includes(resizeMode);

    let collectionToRender = collection;
    let renderShowMore = false;
    let scrollStep = SCROLL_STEP.desktop;

    if (isMobile && collection?.length > 3) {
      renderShowMore = true;
      collectionToRender = collection.slice(0, 3);
    }

    if (resizeMode === 'tablet' || resizeMode === 'laptop') {
      scrollStep = SCROLL_STEP.tablet;
    }

    const handleUserClick = (username: string) => {
      router.push(`/${username}`);
    };
    const handleLeftClick = () => {
      scrollListTo(visibleListItem - scrollStep);
    };
    const handleRightClick = () => {
      scrollListTo(visibleListItem + scrollStep);
    };
    const scrollListTo = (to: number) => {
      let scrollTo = to;

      if (to < 0) {
        scrollTo = 0;
      } else if (
        scrollTo >
        (collection?.length || 0 + (tutorialCard !== undefined ? 1 : 0)) - 1
      ) {
        scrollTo =
          (collection?.length || 0 + (tutorialCard !== undefined ? 1 : 0)) - 1;
      }

      scroller.scrollTo(`cards-section-${category}-${scrollTo}`, {
        offset: -16,
        smooth: 'easeOutQuad',
        duration:
          SCROLL_CARDS_SECTIONS +
          ((SCROLL_CARDS_SECTIONS / 10) * collection.length) / 40,
        horizontal: true,
        containerId: `${category}-scrollContainer`,
      });
    };

    const mouseDownHandler = (e: any) => {
      if (!scrollContainerRef.current) {
        return;
      }

      setMouseIsDown(true);
      setClientX(e.clientX);
      setScrollX(scrollContainerRef.current.scrollLeft);
    };

    const mouseMoveHandler = (e: any) => {
      if (!mouseIsDown) {
        return;
      }

      if (!scrollContainerRef.current) {
        return;
      }

      if (
        Math.abs(e.clientX) - Math.abs(clientX) > 15 ||
        Math.abs(clientX) - Math.abs(e.clientX) > 15
      ) {
        scrollContainerRef.current.scrollLeft = scrollX - e.clientX + clientX;
        setClientX(e.clientX);
        setScrollX(scrollX - e.clientX + clientX);
        setIsDragging(true);
      }
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
      if (tutorialCard !== undefined && index === 0) {
        return (
          <React.Fragment key={switchPostType(item)[0].postUuid}>
            <SItemWrapper name={`cards-section-${category}-${0}`}>
              {tutorialCard}
            </SItemWrapper>
            <Link href={`/post/${switchPostType(item)[0].postUuid}`}>
              <SItemWrapper
                name={`cards-section-${category}-${
                  tutorialCard !== undefined ? index + 1 : index
                }`}
                // onClick={handleItemClick}
                onClick={(e) => {
                  if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <PostCard
                  item={item}
                  index={tutorialCard !== undefined ? index + 1 : index}
                  width={isMobile ? '100%' : isTablet ? '224px' : '224px'}
                  height={isMobile ? '564px' : isTablet ? '270px' : '336px'}
                  maxWidthTablet='224px'
                />
              </SItemWrapper>
            </Link>
          </React.Fragment>
        );
      }

      return (
        <Link href={`/post/${switchPostType(item)[0].postUuid}`}>
          <SItemWrapper
            key={switchPostType(item)[0].postUuid}
            name={`cards-section-${category}-${
              tutorialCard !== undefined ? index + 1 : index
            }`}
            onClick={(e) => {
              if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <PostCard
              item={item}
              index={tutorialCard !== undefined ? index + 1 : index}
              width={isMobile ? '100%' : isTablet ? '224px' : '224px'}
              height={isMobile ? '564px' : isTablet ? '270px' : '336px'}
              maxWidthTablet='224px'
            />
          </SItemWrapper>
        </Link>
      );
    };

    const handleSeeMoreClick = () => {
      Mixpanel.track('See More in Category Clicked');
      if (type === 'default' && seeMoreLink) {
        router.push(seeMoreLink);
      }
    };

    // Try to pre-fetch the content
    useEffect(() => {
      if (seeMoreLink) {
        router.prefetch(seeMoreLink);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      function onScroll() {
        if (!scrollContainerRef.current) {
          return;
        }

        const { firstChild } = scrollContainerRef.current;

        if (!firstChild) {
          return;
        }

        // Add margin to the equation
        const childWidth =
          (firstChild as Element).getBoundingClientRect().width + 32;

        const currentScrollPosition =
          scrollContainerRef.current.scrollLeft > childWidth
            ? scrollContainerRef.current.scrollLeft - 16
            : scrollContainerRef.current.scrollLeft;

        // setVisibleListItem(+(currentScrollPosition / childWidth).toFixed(0));
        setVisibleListItem(Math.round(currentScrollPosition / childWidth));
      }

      const scrollContainerElement = scrollContainerRef.current;
      scrollContainerElement?.addEventListener('scroll', onScroll);
      return () => {
        scrollContainerElement?.removeEventListener('scroll', onScroll);
      };
    }, []);

    useEffect(() => {
      setCanScrollLeft(visibleListItem !== 0);

      setCanScrollRight(
        visibleListItem <
          (collection?.length || 0) +
            (tutorialCard !== undefined ? 1 : 0) -
            scrollStep
      );
    }, [visibleListItem, collection, scrollStep, tutorialCard]);

    useEffect(() => {
      if (!canScrollRight && collection?.length > 0 && onReachEnd) {
        onReachEnd();
      }
    }, [canScrollRight, onReachEnd, collection?.length]);

    return (
      <SWrapper name={category} {...restProps}>
        <STopWrapper>
          {type === 'default' ? (
            <Headline variant={4} animation='t-01'>
              {title}
            </Headline>
          ) : (
            <AnimatedPresence animation='t-01'>
              <SHeadline variant={4} animation='t-01'>
                <SHeadlineInner>
                  <div>{t('cardsSection.button.creatorOnTheRise')}</div>
                  <SCreatorsAvatars>
                    {collection
                      .map((post) => switchPostType(post)[0].creator)
                      .filter(
                        (value, index, arr) => arr.indexOf(value) === index
                      )
                      .map((creator, i) => (
                        <SUserAvatar
                          key={creator?.uuid}
                          index={i}
                          avatarUrl={creator?.avatarUrl ?? ''}
                          onClick={() =>
                            handleUserClick(creator?.username as string)
                          }
                        />
                      ))}
                  </SCreatorsAvatars>
                </SHeadlineInner>
              </SHeadline>
            </AnimatedPresence>
          )}
          {/* {!isMobile && type === 'default' && (
            <SCaption weight={700} onClick={handleSeeMoreClick}>
              {t(
                type === 'default'
                  ? 'cardsSection.button.showMore'
                  : 'cardsSection.button.showMoreCreator',
                { name: formatString(user?.username, true) }
              )}
            </SCaption>
          )} */}
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
            {!loading ? (
              collectionToRender?.map(renderItem)
            ) : (
              <SCardSkeletonSection count={!isMobile ? 5 : 1} />
            )}
            {(!loading && collection?.length === 0) || !collection ? (
              <SItemWrapper
                key='tutorial-card'
                name={`cards-section-${category}-${0}`}
              >
                {tutorialCard}
              </SItemWrapper>
            ) : null}
          </SListWrapper>
          {!isMobile && !isTablet && (
            <>
              {!isDragging && canScrollLeft && (
                <ScrollArrowPermanent
                  active
                  position='left'
                  handleClick={handleLeftClick}
                />
              )}
              {!isDragging && canScrollRight && (
                <ScrollArrowPermanent
                  active
                  position='right'
                  handleClick={handleRightClick}
                />
              )}
            </>
          )}
        </SListContainer>
        {renderShowMore && type === 'default' && (
          <SButtonHolder>
            <Button size='lg' view='secondary' onClick={handleSeeMoreClick}>
              {t(
                type === 'default' || isMobile
                  ? 'cardsSection.button.showMore'
                  : 'cardsSection.button.showMoreCreator',
                { name: formatString(user?.username, true) }
              )}
            </Button>
          </SButtonHolder>
        )}
      </SWrapper>
    );
  }
);

export default CardsSection;

CardsSection.defaultProps = {
  type: 'default',
  user: {
    avatarUrl: '',
    username: '',
  },
  title: '',
  loading: undefined,
  tutorialCard: undefined,
};

interface ISWrapper {
  name: string;
  padding?: 'small' | 'large';
}

const SWrapper = styled.section<ISWrapper>`
  padding: 20px 0;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    padding: 52px 0 50px;
    margin: 0 -32px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: ${({ padding }) => (padding === 'small' ? '40px 0' : '60px 0')};
    margin: 0;
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin: 0 auto;
  }
`;

const SListContainer = styled.div`
  position: relative;
`;

const SListWrapper = styled.div`
  width: 100%;
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
    /* padding: 24px 24px 0 24px; */
    /* padding: 32px 56px 0 64px; */
    padding: 24px 32px 0;
    left: -8px;

    flex-direction: row;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 32px 0 0 0;
  }
`;

const SCardSkeletonSection = styled(CardSkeletonSection)`
  &&& {
    & > span {
      gap: 16px;

      ${({ theme }) => theme.media.laptop} {
        gap: 32px;
      }
    }
  }

  & > span > div {
    ${({ theme }) => theme.media.tablet} {
      height: 410px;
      width: 214px;
    }

    /* ${({ theme }) => theme.media.mobileL} {
      width: 224px;
    } */
  }
`;

interface ISItemWrapper {
  name: string;
}

const SItemWrapper = styled.div<ISItemWrapper>`
  margin: 16px 0;

  ${(props) => props.theme.media.tablet} {
    margin: 0 8px;

    & > div > div:first-child {
      padding: 60% 0px;
    }
  }

  ${(props) => props.theme.media.laptop} {
    margin: 0 8px;

    & > div > div:first-child {
      padding: 70% 0px;
    }
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

  ${(props) => props.theme.media.tablet} {
    padding: 0 32px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: initial;
    margin-bottom: initial;
  }
`;

// const SCaption = styled(Caption)`
//   color: ${(props) => props.theme.colorsThemed.text.secondary};
//   cursor: pointer;
//   transition: color ease 0.5s;

//   &:hover {
//     color: ${(props) => props.theme.colorsThemed.text.primary};
//   }
// `;

const SHeadline = styled(Headline)`
  display: flex;
`;

const SCreatorsAvatars = styled.div`
  position: relative;
  top: -2px;

  ${({ theme }) => theme.media.tablet} {
    top: -8px;
  }

  ${({ theme }) => theme.media.laptop} {
    top: -4px;
  }
`;

const SUserAvatar = styled(UserAvatar)<{
  index: number;
}>`
  position: absolute;
  left: ${({ index }) => index * 24}px;

  width: 36px;
  height: 36px;

  border: 4px solid ${({ theme }) => theme.colorsThemed.background.primary};
  background: ${({ theme }) => theme.colorsThemed.background.primary};

  cursor: pointer;

  transition: 0.2s linear;

  ${({ theme }) => theme.media.laptop} {
    width: 48px;
    height: 48px;
    left: ${({ index }) => index * 36}px;
  }

  &:hover {
    z-index: 10;
    transform: translateY(-10px);
  }
`;

const SHeadlineInner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;
