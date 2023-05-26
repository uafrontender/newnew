import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import router from 'next/router';
import dynamic from 'next/dynamic';
import Lottie from '../../atoms/Lottie';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import CreatorCard from '../../molecules/search/CreatorCard';
import { useAppSelector } from '../../../redux-store/store';

const CardSkeleton = dynamic(() => import('../../molecules/CardSkeleton'));

interface IList {
  className?: string;
  collection: newnewapi.IUser[];
  loading: boolean;
  skeletonsBgColor?: string;
  skeletonsHighlightColor?: string;
  withEllipseMenu?: boolean;
  onBuyBundleClicked?: (creator: newnewapi.IUser) => void;
}

export const CreatorsList: React.FC<IList> = ({
  className,
  collection,
  loading,
  skeletonsBgColor,
  skeletonsHighlightColor,
  withEllipseMenu = false,
  onBuyBundleClicked,
}) => {
  const user = useAppSelector((state) => state.user);

  const renderItem = (creator: newnewapi.IUser) => {
    const handleItemClick = () => {
      if (creator) {
        if (creator.uuid === user.userData?.userUuid) {
          router.push('/profile');
        } else {
          router.push(`/${creator.username}`);
        }
      }
    };

    const isCardWithEllipseMenu =
      creator.uuid !== user.userData?.userUuid ? withEllipseMenu : false;

    return (
      <SItemWrapper key={creator.uuid} onClick={handleItemClick}>
        <CreatorCard
          creator={creator}
          withEllipseMenu={isCardWithEllipseMenu}
          onBundleClicked={onBuyBundleClicked}
        />
      </SItemWrapper>
    );
  };

  return (
    <SListWrapper className={className}>
      {collection?.map(renderItem)}
      {collection.length > 0 &&
        loading &&
        Array(5)
          .fill('_')
          .map((_, i) => (
            <CardSkeleton
              // eslint-disable-next-line react/no-array-index-key
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
  onBuyBundleClicked: undefined,
};

export default CreatorsList;

const SListWrapper = styled.div`
  width: 100%;
  cursor: grab;
  display: flex;
  // Needed for bump up animation
  padding-top: 8px;
  // Not sure these are needed on this level (should come from className)
  padding-left: 16px;
  padding-right: 16px;
  position: relative;
  flex-wrap: wrap;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    margin: 0 -8px;
    padding-left: 0;
    padding-right: 0;
  }

  ${(props) => props.theme.media.laptop} {
    margin: 0 -16px;
  }

  .skeletonsContainer {
    display: block;
    height: 229px;

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
