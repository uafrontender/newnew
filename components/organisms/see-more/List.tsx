/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import Card from '../../molecules/Card';
import Lottie from '../../atoms/Lottie';
import CardSkeleton from '../../molecules/CardSkeleton';

import { useAppSelector } from '../../../redux-store/store';
import switchPostType from '../../../utils/switchPostType';

import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

interface IList {
  category: string;
  collection: any;
  loading: boolean;
  wrapperStyle?: React.CSSProperties;
  skeletonsBgColor?: string;
  skeletonsHighlightColor?: string;
  handlePostClicked: (post: newnewapi.Post) => void;
}

export const List: React.FC<IList> = ({
  category,
  collection,
  loading,
  wrapperStyle,
  skeletonsBgColor,
  skeletonsHighlightColor,
  handlePostClicked,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const renderItem = (item: any, index: number) => {
    const handleItemClick = () => {
      handlePostClicked(item);
    };

    return (
      <SItemWrapper
        key={switchPostType(item)[0].postUuid}
        onClick={handleItemClick}
      >
        <Card
          item={item}
          index={index + 1}
          width='100%'
          height={isMobile ? '564px' : '336px'}
        />
      </SItemWrapper>
    );
  };

  return (
    <SListWrapper
    // style={wrapperStyle && isMobile ? { ...wrapperStyle } : {}}
    >
      {collection?.map(renderItem)}
      {collection.length > 0 &&
        loading &&
        Array(5)
          .fill('_')
          .map((_, i) => (
            <CardSkeleton
              key={i}
              count={1}
              cardWidth='100%'
              cardHeight='100%'
              bgColor={skeletonsBgColor}
              highlightColor={skeletonsHighlightColor}
            />
          ))}
      {collection.length === 0 && loading && (
        <SAnimationContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        </SAnimationContainer>
      )}
    </SListWrapper>
  );
};

List.defaultProps = {
  wrapperStyle: {},
  skeletonsBgColor: undefined,
  skeletonsHighlightColor: undefined,
};

export default List;

const SListWrapper = styled.div`
  width: 100%;
  cursor: grab;
  display: flex;
  padding: 8px 0 0 0;
  padding-left: 16px !important;
  padding-right: 16px !important;
  position: relative;
  flex-wrap: wrap;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    left: 16px;
    width: calc(100% + 26px);
    padding: 24px 0 0 0;

    margin: 0 auto !important;
    max-width: 768px;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 32px 0 0 0;

    max-width: 1248px;
  }

  ${(props) => props.theme.media.laptopL} {
    max-width: 1248px;
  }

  .skeletonsContainer {
    display: block;
    height: 400px;

    width: 100vw;
    margin: 16px 0;

    ${(props) => props.theme.media.tablet} {
      width: calc(33% - 16px);
      margin: 0 8px 24px 8px;
    }

    ${(props) => props.theme.media.laptop} {
      width: calc(25% - 32px);
      margin: 0 16px 32px 16px;
    }

    ${(props) => props.theme.media.laptopL} {
      width: calc(20% - 32px);
    }

    ${(props) => props.theme.media.desktop} {
      width: calc(16.65% - 32px);
    }

    div {
      .skeletonSpan {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
  }
`;

const SItemWrapper = styled.div`
  width: 100%;
  margin: 16px 0;

  ${(props) => props.theme.media.tablet} {
    width: calc(33% - 16px);
    margin: 0 8px 24px 8px;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(25% - 32px);
    margin: 0 16px 32px 16px;
  }

  ${(props) => props.theme.media.laptopL} {
    width: calc(20% - 32px);
  }

  ${(props) => props.theme.media.desktop} {
    width: calc(16.65% - 32px);
  }
`;

const SAnimationContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;
