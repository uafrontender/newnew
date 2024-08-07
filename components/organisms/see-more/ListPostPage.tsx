import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import PostCard from '../../molecules/PostCard';

import switchPostType from '../../../utils/switchPostType';
import CardSkeleton from '../../molecules/CardSkeleton';
import { useAppState } from '../../../contexts/appStateContext';
import { Mixpanel } from '../../../utils/mixpanel';

interface IListPostPage {
  collection: any;
  loading: boolean;
  skeletonsBgColor?: string;
  skeletonsHighlightColor?: string;
}

export const ListPostPage: React.FC<IListPostPage> = React.memo(
  ({ collection, loading, skeletonsBgColor, skeletonsHighlightColor }) => {
    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

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
        <SItemWrapper>
          <SPostCard
            item={item}
            index={index + 1}
            width='100%'
            height={isMobile ? '564px' : '336px'}
            maxWidthTablet='none'
          />
        </SItemWrapper>
      </Link>
    );

    return (
      <SListPostPageWrapper
      // style={wrapperStyle && isMobile ? { ...wrapperStyle } : {}}
      >
        {collection?.map(renderItem)}
        {loading &&
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
      </SListPostPageWrapper>
    );
  }
);

ListPostPage.defaultProps = {
  skeletonsBgColor: undefined,
  skeletonsHighlightColor: undefined,
};

export default ListPostPage;

const SListPostPageWrapper = styled.div`
  width: 100%;
  display: flex;
  padding: 8px 0 0 0;
  position: relative;
  flex-wrap: wrap;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    left: -8px;
    width: calc(100% + 26px);
    padding: 24px 0 0 0;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 32px 0 0 0;
  }

  .skeletonsContainer {
    display: block;
    height: 100vh;

    width: 100vw;
    margin: 16px 0;

    ${(props) => props.theme.media.tablet} {
      height: 400px;
      width: calc((100% - 24px * 3) / 3);
      margin: 0 8px 24px 8px;
    }

    ${(props) => props.theme.media.laptopM} {
      width: calc((100% - 32px * 4) / 4);
    }

    ${(props) => props.theme.media.laptopL} {
      width: calc((100% - 32px * 5) / 5);
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

const SPostCard = styled(PostCard)`
  width: 100%;
  max-width: 100%;
  min-width: 100%;
`;

const SItemWrapper = styled.div`
  width: 100%;
  margin: 16px 0;

  ${(props) => props.theme.media.tablet} {
    width: calc((100% - 24px * 3) / 3);
    margin: 0 8px 24px 8px;
  }

  ${(props) => props.theme.media.laptopM} {
    width: calc((100% - 32px * 4) / 4);
    margin: 0 16px 32px 16px;
  }

  ${(props) => props.theme.media.laptopL} {
    width: calc((100% - 32px * 5) / 5);
  }
`;
