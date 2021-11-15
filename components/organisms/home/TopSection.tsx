import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useTranslation } from 'next-i18next';

import Card from '../../molecules/Card';
import Headline from '../../atoms/Headline';
import ScrollArrow from '../../atoms/ScrollArrow';

import useHoverArrows from '../../../utils/hooks/useHoverArrows';

const SCROLL_STEP = 3;

interface ITopSection {
  collection: {}[],
}

export const TopSection: React.FC<ITopSection> = (props) => {
  const { collection } = props;
  const { t } = useTranslation('home');
  const ref: any = useRef();
  const [listScroll, setListScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const country = 'USA';

  const renderItem = (item: any, index: number) => (
    <SItemWrapper key={item.id} name={`top-section-${index}`}>
      <Card type="inside" item={item} index={index + 1} />
    </SItemWrapper>
  );
  const handleLeftClick = () => {
    setListScroll(listScroll - SCROLL_STEP);
  };
  const handleRightClick = () => {
    setListScroll(listScroll + SCROLL_STEP);
  };

  const {
    renderLeftArrow,
    renderRightArrow,
  } = useHoverArrows(ref);

  useEffect(() => {
    scroller.scrollTo(`top-section-${listScroll}`, {
      offset: -32,
      smooth: true,
      duration: 500,
      horizontal: true,
      containerId: 'topScrollContainer',
    });

    setCanScrollLeft(listScroll !== 0);
    setCanScrollRight(listScroll < collection.length - SCROLL_STEP);
  }, [listScroll, collection]);

  return (
    <SWrapper name="topSection">
      <Headline variant={4}>
        {t('top-block-title', { country })}
      </Headline>
      <SListContainer ref={ref}>
        <SListWrapper id="topScrollContainer">
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
