/* eslint-disable no-nested-ternary */
import React, {
  useRef,
  useState,
  useEffect,
  ReactElement,
  useMemo,
  useLayoutEffect,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import PostCard, {
  SUserAvatarOutside,
  SBottomStart,
  STextOutside,
  SUsername,
  SButton,
  SButtonFirst,
} from '../../molecules/PostCard';
import Button from '../../atoms/Button';
// import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import UserAvatar from '../../molecules/UserAvatar';
import ScrollArrowPermanent from '../../atoms/ScrollArrowPermanent';
import AnimatedPresence from '../../atoms/AnimatedPresence';

import { formatString } from '../../../utils/format';

import { SCROLL_CARDS_SECTIONS } from '../../../constants/timings';
import switchPostType from '../../../utils/switchPostType';
import { CardSkeletonSection } from '../../molecules/CardSkeleton';
import { Mixpanel } from '../../../utils/mixpanel';
import useComponentScrollRestoration from '../../../utils/hooks/useComponentScrollRestoration';
import { useAppState } from '../../../contexts/appStateContext';

const SCROLL_STEP = {
  tablet: 3,
  desktop: 4,
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

    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isTablet = ['tablet'].includes(resizeMode);
    const isLaptop = ['laptop'].includes(resizeMode);
    // const isDesktop = ['laptopL'].includes(resizeMode);

    const collectionToRender = useMemo(() => {
      if (isMobile && collection?.length > 3) {
        return collection;
        // TODO: temporary all posts are shown
        // return collection.slice(0, 3);
      }

      return collection;
    }, [collection, isMobile]);

    const renderShowMore = useMemo(() => {
      if (isMobile && collection?.length > 3) {
        return false;

        // TODO:temporary see more is hided
        // return true;
      }

      return false;
    }, [isMobile, collection?.length]);

    const scrollStep = useMemo(() => {
      if (resizeMode === 'tablet' || resizeMode === 'laptop') {
        return SCROLL_STEP.tablet;
      }

      return SCROLL_STEP.desktop;
    }, [resizeMode]);

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

    // eslint-disable-next-line arrow-body-style
    const [cardWidth, setCardWidth] = useState(() => {
      return isMobile
        ? '100%'
        : isTablet
        ? '224px'
        : isLaptop
        ? '256px'
        : '288px';
    });

    const getCardWidth = useCallback(() => {
      const containerWidth = ref.current?.getBoundingClientRect().width;

      const tabletItemWidth = (containerWidth - 64 - 16 * 2) / 3;

      const laptopItemWidth = (containerWidth - 32 * 2) / 3;

      const desktopItemWidth = (containerWidth - 32 * 3) / 4;

      if (isMobile) {
        return '100%';
      }

      if (isTablet) {
        return `${tabletItemWidth}px`;
      }

      if (isLaptop) {
        return `${laptopItemWidth}px`;
      }

      return `${desktopItemWidth}px`;
    }, [isMobile, isTablet, isLaptop]);

    useLayoutEffect(() => {
      setCardWidth(getCardWidth());
    }, [getCardWidth]);

    useEffect(() => {
      const resizeHandler = () => setCardWidth(getCardWidth());
      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    }, [getCardWidth]);

    const renderItem = (item: any, index: number) => {
      if (tutorialCard !== undefined && index === 0) {
        return (
          <React.Fragment key={switchPostType(item)[0].postUuid}>
            <SItemWrapper name={`cards-section-${category}-${0}`}>
              {tutorialCard}
            </SItemWrapper>
            <Link
              href={`/p/${
                switchPostType(item)[0].postShortId
                  ? switchPostType(item)[0].postShortId
                  : switchPostType(item)[0].postUuid
              }`}
            >
              <SItemWrapper
                name={`cards-section-${category}-${
                  tutorialCard !== undefined ? index + 1 : index
                }`}
                onClick={(e) => {
                  if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                  } else {
                    Mixpanel.track('Go To Post from Post Card', {
                      _stage: 'Post Card',
                      _postUuid: switchPostType(item)[0].postUuid,
                      _target: `${process.env.NEXT_PUBLIC_APP_URL}/p/${
                        switchPostType(item)[0].postShortId ||
                        switchPostType(item)[0].postUuid
                      }`,
                    });
                  }
                }}
              >
                <PostCard
                  item={item}
                  index={tutorialCard !== undefined ? index + 1 : index}
                  width={
                    isMobile
                      ? '100%'
                      : isTablet
                      ? '224px'
                      : isLaptop
                      ? '256px'
                      : '288px'
                  }
                  height={isMobile ? '564px' : isTablet ? '412px' : '596px'}
                  maxWidthTablet='224px'
                />
              </SItemWrapper>
            </Link>
          </React.Fragment>
        );
      }

      return (
        <Link
          href={`/p/${
            switchPostType(item)[0].postShortId
              ? switchPostType(item)[0].postShortId
              : switchPostType(item)[0].postUuid
          }`}
          key={switchPostType(item)[0].postUuid}
        >
          <SItemWrapper
            name={`cards-section-${category}-${
              tutorialCard !== undefined ? index + 1 : index
            }`}
            onClick={(e) => {
              if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
              } else {
                Mixpanel.track('Go To Post from Post Card', {
                  _stage: 'Post Card',
                  _postUuid: switchPostType(item)[0].postUuid,
                  _target: `${process.env.NEXT_PUBLIC_APP_URL}/p/${
                    switchPostType(item)[0].postShortId ||
                    switchPostType(item)[0].postUuid
                  }`,
                });
              }
            }}
          >
            <PostCard
              item={item}
              index={tutorialCard !== undefined ? index + 1 : index}
              width={cardWidth}
              height={isMobile ? '564px' : isTablet ? '412px' : '596px'}
              maxWidthTablet={`${cardWidth}px`}
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

    useComponentScrollRestoration(
      scrollContainerRef.current ?? undefined,
      `${category}-scrollContainer`
    );

    return (
      <SWrapper name={category} {...restProps}>
        <STopWrapper>
          {type === 'default' ? (
            <SDefaultHeadline variant={3} animation='t-01'>
              {title}
            </SDefaultHeadline>
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
              <SCardSkeletonSection
                count={!isMobile ? (isLaptop || isTablet ? 3 : 4) : 1}
              />
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
    padding: 24px 0px 0 32px;
    left: -8px;

    flex-direction: row;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 16px);
    padding: 32px 0 0 0;
  }

  ${(props) => props.theme.media.laptopL} {
    width: calc(100% + 32px);
  }
`;

const SCardSkeletonSection = styled(CardSkeletonSection)`
  &&& {
    & > span {
      margin: 16px 0;
      gap: 0;
      left: 0;
      width: 100%;
      overflow-x: hidden;

      ${({ theme }) => theme.media.tablet} {
        margin: 0;
        gap: 16px;
        left: 8px;
        width: calc(100% - 16px);
      }

      ${({ theme }) => theme.media.laptop} {
        gap: 32px;
        left: 16px;
        width: calc(100% + 16px);
      }

      ${({ theme }) => theme.media.laptopL} {
        width: 100%;
      }
    }
  }

  & > span > div {
    width: calc(100vw - 32px);
    height: 584px;

    ${({ theme }) => theme.media.tablet} {
      width: calc((100% - 16px * 3) / 3); //224px;
      height: 428px;
    }

    ${({ theme }) => theme.media.laptop} {
      width: calc((100% - 32px * 3) / 3);
      height: 492px;
    }

    ${(props) => props.theme.media.laptopM} {
      width: calc((100% - 32px * 4) / 4);
    }

    ${({ theme }) => theme.media.laptopL} {
      width: calc((100% - 32px * 4) / 4);
      height: 592px;
    }
  }
`;

interface ISItemWrapper {
  name: string;
}

const SItemWrapper = styled.div<ISItemWrapper>`
  margin: 16px 0;

  & > div > div:first-child {
    padding: 73.6% 0px;
  }

  ${(props) => props.theme.media.tablet} {
    margin: 0 8px;

    & > div > div:first-child {
      padding: 61% 0px;
    }
  }

  ${(props) => props.theme.media.laptopL} {
    margin: 0 8px;

    & > div > div:first-child {
      padding: 74% 0px;
    }

    ${SUserAvatarOutside} {
      width: 30px;
      height: 30px;
    }

    ${SBottomStart} {
      height: 30px;
    }

    ${STextOutside} {
      height: 48px;

      font-size: 16px;
      line-height: 24px;
    }

    ${SUsername} {
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
    }

    ${SButton}, ${SButtonFirst} {
      height: 48px;

      border-radius: ${({ theme }) => theme.borderRadius.medium};
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

const SDefaultHeadline = styled(Headline)`
  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 40px;
    line-height: 48px;
  }
`;

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
