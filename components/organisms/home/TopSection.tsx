/* eslint-disable no-nested-ternary */
import React, { useRef, useState, useEffect } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { scroller } from 'react-scroll';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import PostCard from '../../molecules/PostCard';
import Headline from '../../atoms/Headline';
import ScrollArrow from '../../atoms/ScrollArrow';

import useScrollGradientsHorizontal from '../../../utils/hooks/useScrollGradientsHorizontal';
import useHoverArrows from '../../../utils/hooks/useHoverArrows';

import { SCROLL_TOP_10 } from '../../../constants/timings';
import switchPostType from '../../../utils/switchPostType';
import GradientMaskHorizontal from '../../atoms/GradientMaskHorizontal';
import { useAppState } from '../../../contexts/appStateContext';
import { Mixpanel } from '../../../utils/mixpanel';

const SCROLL_STEP = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

interface ITopSection {
  collection: newnewapi.Post[];
}

export const TopSection: React.FC<ITopSection> = React.memo(
  ({ collection }) => {
    const { t } = useTranslation('common');
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

    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isTablet = ['tablet'].includes(resizeMode);
    const country = 'USA';
    let scrollStep = SCROLL_STEP.desktop;

    if (isMobile) {
      scrollStep = SCROLL_STEP.mobile;
    } else if (isTablet) {
      scrollStep = SCROLL_STEP.tablet;
    }

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

      scroller.scrollTo(`top-section-${scrollTo}`, {
        offset: -32,
        smooth: 'easeOutQuad',
        duration: SCROLL_TOP_10,
        horizontal: true,
        containerId: 'topScrollContainer',
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

    const renderItem = (item: newnewapi.Post, index: number) => (
      <Link
        href={`/p/${
          switchPostType(item)[0].postShortId
            ? switchPostType(item)[0].postShortId
            : switchPostType(item)[0].postUuid
        }`}
        key={switchPostType(item)[0].postUuid}
      >
        <SItemWrapper
          name={`top-section-${index}`}
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
          <PostCard type='inside' item={item} index={index + 1} />
        </SItemWrapper>
      </Link>
    );

    const { renderLeftArrow, renderRightArrow } = useHoverArrows(ref);
    const { showLeftGradient, showRightGradient } =
      useScrollGradientsHorizontal(scrollContainerRef);

    useEffect(() => {
      scrollContainerRef.current.addEventListener('scroll', () => {
        const currentScrollPosition = scrollContainerRef.current.scrollLeft;
        const childWidth =
          scrollContainerRef.current.firstChild.getBoundingClientRect().width;

        setVisibleListItem(+(currentScrollPosition / childWidth).toFixed(0));
      });
    }, []);
    useEffect(() => {
      setCanScrollLeft(visibleListItem !== 0);
      setCanScrollRight(visibleListItem + 1 < (collection?.length || 0) - 1);
    }, [visibleListItem, collection]);

    return (
      <SWrapper
        name='topSection'
        layoutId='topSection'
        transition={{
          ease: 'easeInOut',
          duration: 1,
        }}
      >
        <SHeadline variant={4} animation='t-01'>
          {t('topSectionTitle', { country })}
        </SHeadline>
        <SListContainer ref={ref}>
          <SListWrapper
            id='topScrollContainer'
            ref={scrollContainerRef}
            onMouseUp={mouseUpHandler}
            onMouseDown={mouseDownHandler}
            onMouseMove={mouseMoveHandler}
            onMouseLeave={mouseUpHandler}
          >
            {collection?.map(renderItem)}
          </SListWrapper>
          {!isDragging && canScrollLeft && (
            <ScrollArrow
              active={renderLeftArrow}
              position='left'
              handleClick={handleLeftClick}
            />
          )}
          {!isDragging && canScrollRight && (
            <ScrollArrow
              active={renderRightArrow}
              position='right'
              handleClick={handleRightClick}
            />
          )}
        </SListContainer>
        {!isMobile && !isTablet && (
          <>
            <GradientMaskHorizontal
              gradientType='primary'
              active={showLeftGradient}
              positionLeft='-25px'
              additonalZ={5}
            />
            <GradientMaskHorizontal
              gradientType='primary'
              active={showRightGradient}
              positionRight='-25px'
              additonalZ={5}
            />
          </>
        )}
      </SWrapper>
    );
  }
);

export default TopSection;

interface ISWrapper {
  name: string;
}

const SWrapper = styled(motion.section)<ISWrapper>`
  padding: 0 0 48px 0;

  position: relative;

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

const SHeadline = styled(Headline)`
  ${(props) => props.theme.media.tablet} {
    margin: 0 auto;
    max-width: 696px;
    padding: 0 32px;
  }
  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    padding: initial;
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

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  ${(props) => props.theme.media.tablet} {
    left: -32px;
    padding: 0 16px;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    margin-top: 16px;
    padding-top: 16px;
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
