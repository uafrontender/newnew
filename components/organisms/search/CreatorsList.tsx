/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import router from 'next/router';
import dynamic from 'next/dynamic';
import Lottie from '../../atoms/Lottie';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import CreatorCard from '../../molecules/search/CreatorCard';

const CardSkeleton = dynamic(() => import('../../molecules/CardSkeleton'));

interface IList {
  collection: newnewapi.ISearchCreatorsResultItem[];
  loading: boolean;
  skeletonsBgColor?: string;
  skeletonsHighlightColor?: string;
  withEllipseMenu?: boolean;
  onBuyPackClicked?: (creator: newnewapi.IUser) => void;
}

export const CreatorsList: React.FC<IList> = ({
  collection,
  loading,
  skeletonsBgColor,
  skeletonsHighlightColor,
  withEllipseMenu = false,
  onBuyPackClicked,
}) => {
  const renderItem = (item: newnewapi.ISearchCreatorsResultItem) => {
    if (!item.creator) {
      return null;
    }

    const handleItemClick = () => {
      if (item.creator) {
        router.push(`/${item.creator.username}`);
      }
    };

    return (
      <SItemWrapper key={item.creator.uuid} onClick={handleItemClick}>
        <CreatorCard
          creator={item.creator}
          withEllipseMenu={withEllipseMenu ?? false}
          onBuyPackClicked={onBuyPackClicked}
        />
      </SItemWrapper>
    );
  };

  return (
    <SListWrapper>
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

CreatorsList.defaultProps = {
  skeletonsBgColor: undefined,
  skeletonsHighlightColor: undefined,
  onBuyPackClicked: undefined,
};

export default CreatorsList;

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
    width: calc(100% + 26px);
    padding: 0;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(100% + 32px);
    padding: 0 !important;
    margin: 0 -16px;
  }

  ${(props) => props.theme.media.laptopL} {
    margin: 0 -16px;
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
`;

const SAnimationContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;
