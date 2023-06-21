import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import PostCard from '../../molecules/PostCard';
import Lottie from '../../atoms/Lottie';
import CardSkeleton from '../../molecules/CardSkeleton';

import switchPostType from '../../../utils/switchPostType';

import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import { useAppState } from '../../../contexts/appStateContext';
import { Mixpanel } from '../../../utils/mixpanel';

interface IList {
  className?: string;
  collection: any;
  loading: boolean;
  skeletonsBgColor?: string;
  skeletonsHighlightColor?: string;
}

export const PostList: React.FC<IList> = ({
  className,
  collection,
  loading,
  skeletonsBgColor,
  skeletonsHighlightColor,
}) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isTablet = ['tablet'].includes(resizeMode);

  const isSmallDesktops = ['laptop', 'laptopM'].includes(resizeMode);

  const skeletonNumber =
    (isMobile && 1) || (isTablet && 3) || (isSmallDesktops && 4) || 5; // calculations how menu skeletons to display

  const renderItem = (item: any, index: number) => (
    <Link
      href={`/p/${
        switchPostType(item)[0].postShortId
          ? switchPostType(item)[0].postShortId
          : switchPostType(item)[0].postUuid
      }`}
      key={switchPostType(item)[0].postUuid}
      onClickCapture={() => {
        Mixpanel.track('Open Post', {
          _stage: 'Post Card',
          _postUuid: switchPostType(item)[0].postUuid,
          _target: `${process.env.NEXT_PUBLIC_APP_URL}/p/${
            switchPostType(item)[0].postShortId ||
            switchPostType(item)[0].postUuid
          }`,
        });
      }}
    >
      <a>
        <SItemWrapper>
          <PostCard
            item={item}
            index={index + 1}
            width='100%'
            height={isMobile ? '564px' : '336px'}
          />
        </SItemWrapper>
      </a>
    </Link>
  );

  return (
    <>
      <SListWrapper className={className}>
        {collection?.map(renderItem)}
        {collection.length === 0 &&
          loading &&
          Array(skeletonNumber)
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
      </SListWrapper>
      {collection.length > 0 && loading && (
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
    </>
  );
};

PostList.defaultProps = {
  skeletonsBgColor: undefined,
  skeletonsHighlightColor: undefined,
};

export default PostList;

const SListWrapper = styled.div`
  width: 100%;
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

  ${(props) => props.theme.media.laptopM} {
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

  & > div {
    max-width: 100%;
  }

  ${(props) => props.theme.media.tablet} {
    width: calc(33% - 16px);
    margin: 0 8px 24px 8px;
  }

  ${(props) => props.theme.media.laptopM} {
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
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;
`;
