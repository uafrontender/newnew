import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Card from '../../molecules/Card';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import UserAvatar from '../../molecules/UserAvatar';
import ScrollArrow from '../../atoms/ScrollArrow';

import useHoverArrows from '../../../utils/hooks/useHoverArrows';
import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_CARDS_SECTIONS } from '../../../constants/timings';

const SCROLL_STEP = {
  tablet: 3,
  desktop: 5,
};

interface ICardSection {
  url: string,
  user?: any,
  type?: 'default' | 'creator'
  title?: string,
  collection: {}[],
}

export const CardsSection: React.FC<ICardSection> = (props) => {
  const {
    url,
    user,
    type,
    title,
    collection,
  } = props;
  const { t } = useTranslation('home');
  const router = useRouter();
  const ref: any = useRef();
  const scrollContainerRef: any = useRef();
  const [listScroll, setListScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [clientX, setClientX] = useState<number>(0);
  const [scrollX, setScrollX] = useState<number>(0);

  // To check if we're really dragging and avoid clicks on children
  const [wasDragged, setWasDragged] = useState(false);
  const [mouseInitial, setMouseInitial] = useState<number>(0);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

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
    router.push(url);
  };
  const handleLeftClick = () => {
    setListScroll(listScroll - scrollStep);
  };
  const handleRightClick = () => {
    setListScroll(listScroll + scrollStep);
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

    if (mouseInitial < clientX) {
      if (canScrollLeft) {
        handleLeftClick();
      }
    } else if (mouseInitial > clientX) {
      if (canScrollRight) {
        handleRightClick();
      }
    }

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
    <SItemWrapper key={`${url}-${item.id}`} name={`top-section-${url}-${index}`}>
      <Card
        item={item}
        index={index + 1}
        restore={restore}
        preventClick={wasDragged}
        onMouseLeave={handleItemMouseLeave}
        onMouseDownCapture={handleItemMouseDownCapture}
      />
    </SItemWrapper>
  ), [handleItemMouseLeave, handleItemMouseDownCapture, restore, url, wasDragged]);

  const {
    renderLeftArrow,
    renderRightArrow,
  } = useHoverArrows(ref);

  useEffect(() => {
    scroller.scrollTo(`top-section-${url}-${listScroll}`, {
      offset: -32,
      smooth: 'easeInOutQuart',
      duration: SCROLL_CARDS_SECTIONS,
      horizontal: true,
      containerId: `${url}-scrollContainer`,
    });

    setCanScrollLeft(listScroll !== 0);
    setCanScrollRight(listScroll < collection.length - scrollStep);
  }, [url, listScroll, collection, scrollStep]);

  return (
    <SWrapper>
      <STopWrapper>
        {type === 'default' ? (
          <Headline animation="t01" variant={4}>
            {title}
          </Headline>
        ) : (
          <SCreatorHeadline>
            <UserAvatar user={user} withClick onClick={handleUserClick} />
            <SHeadline animation="t01" variant={4}>
              {user.username}
            </SHeadline>
            <SButton view="quaternary" onClick={handleUserClick}>
              {t('button-creator-on-the-rise')}
            </SButton>
          </SCreatorHeadline>
        )}
        {!isMobile && (
          <Link href={url}>
            <a>
              <SCaption>
                {t(type === 'default' ? 'button-show-more' : 'button-show-more-creator')}
              </SCaption>
            </a>
          </Link>
        )}
      </STopWrapper>
      <SListContainer ref={ref}>
        <SListWrapper
          id={`${url}-scrollContainer`}
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
          <Link href={url}>
            <a>
              <Button size="lg" view="secondary">
                {t(type === 'default' || isMobile ? 'button-show-more' : 'button-show-more-creator')}
              </Button>
            </a>
          </Link>
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

const SWrapper = styled.section`
  padding: 0 0 24px 0;

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
  transition: color ease 0.5s;
  
  &:hover {
    color: ${(props) => props.theme.colorsThemed.text.primary};
  }
`;

const SCreatorHeadline = styled.div`
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

const SButton = styled(Button)`
  padding: 12px;
  font-size: 12px;
  line-height: 16px;

  ${(props) => props.theme.media.tablet} {
    padding: 8px 12px;
    font-size: 14px;
    line-height: 24px;
  }
`;
