/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import PostCard from '../../molecules/PostCard';

import { useAppSelector } from '../../../redux-store/store';
import switchPostType from '../../../utils/switchPostType';
import CardSkeleton from '../../molecules/CardSkeleton';

interface IListPostPage {
  collection: any;
  loading: boolean;
  skeletonsBgColor?: string;
  skeletonsHighlightColor?: string;
  handlePostClicked: (post: newnewapi.Post) => void;
}

export const ListPostPage: React.FC<IListPostPage> = React.memo(
  ({
    collection,
    loading,
    skeletonsBgColor,
    skeletonsHighlightColor,
    handlePostClicked,
  }) => {
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const renderItem = (item: any, index: number) => (
      <Link
        href={`/p/${switchPostType(item)[0].postUuid}`}
        key={switchPostType(item)[0].postUuid}
      >
        <SItemWrapper key={switchPostType(item)[0].postUuid}>
          <PostCard
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
      width: calc(33% - 16px);
      margin: 0 8px 24px 8px;
    }

    ${(props) => props.theme.media.laptop} {
      width: calc(25% - 32px);
      margin: 0 16px 32px 16px;
    }

    ${(props) => props.theme.media.laptopM} {
      width: calc(20% - 32px);
      margin: 0 16px 32px 16px;
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
    width: calc(30%);
    margin: 0 8px 24px 8px;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(25% - 32px);
    margin: 0 16px 32px 16px;
  }

  ${(props) => props.theme.media.laptopM} {
    width: calc(20% - 32px);
    margin: 0 16px 32px 16px;
  }
`;
