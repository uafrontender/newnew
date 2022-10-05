import React from 'react';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';

import Headline from '../../atoms/Headline';
import PostCard from '../../molecules/PostCard';
import Text from '../../atoms/Text';
import { CardSkeletonSection } from '../../molecules/CardSkeleton';

import { usePostModalState } from '../../../contexts/postModalContext';

interface IPostTypeSectionProps {
  posts: newnewapi.Post[];
  title: string;
  caption: string;
  iconSrc: string;
  headingPosition: 'right' | 'left';
  loading?: boolean;
  openPostModal: (post: newnewapi.Post) => void;
}

const PostTypeSection = ({
  posts,
  title,
  caption,
  iconSrc,
  headingPosition,
  loading,
  openPostModal,
}: IPostTypeSectionProps) => {
  const { postOverlayOpen } = usePostModalState();

  const renderPosts = (post: newnewapi.Post, index: number) => {
    const handleOpenPostModal = () => {
      openPostModal(post);
    };
    return (
      <SItemWrapper index={index} onClick={handleOpenPostModal}>
        <PostCard
          item={post}
          shouldStop={postOverlayOpen}
          index={index}
          width='204px'
          height='244px'
        />
      </SItemWrapper>
    );
  };

  return (
    <SContainer headingPosition={headingPosition}>
      {!loading && (
        <SPosts>{posts.map((post, index) => renderPosts(post, index))}</SPosts>
      )}
      {loading && <SCardSkeletonSection count={3} />}
      <SHeading>
        <SIconHolder>
          <img src={iconSrc} alt={title} draggable={false} />
        </SIconHolder>
        <SHeadline>{title}</SHeadline>
        <SCaption variant={2} weight={600}>
          {caption}
        </SCaption>
      </SHeading>
    </SContainer>
  );
};

const SContainer = styled.section<{
  headingPosition: 'right' | 'left';
}>`
  display: flex;
  padding: 75px 0;

  ${({ headingPosition }) =>
    headingPosition === 'right'
      ? css`
          ${SHeading} {
            margin-left: 148px;
          }
        `
      : css`
          flex-direction: row-reverse;
          ${SHeading} {
            margin-right: 148px;
          }
        `}

  ${({ theme }) => theme.media.laptopM} {
    margin: 0 auto;
    max-width: 1248px;
  }
`;

const SHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 425px;
  margin-top: 28px;
`;

const SIconHolder = styled.div`
  display: flex;
  justify-content: center;

  img {
    height: 180px;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    img {
      height: 160px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 24px;

    img {
      height: 220px;
    }
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 24px;
  font-size: 80px;
  line-height: 86px;
`;

const SCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SPosts = styled.div`
  display: flex;
  gap: 32px;
`;

const SItemWrapper = styled.div<{ index: number }>`
  height: 386px;

  & > div {
    height: 386px;
    background: ${({ theme }) => theme.colorsThemed.background.backgroundDD};
    border-color: ${({ theme }) => theme.colorsThemed.background.backgroundDD};
  }

  & > div > div:first-child {
    padding: 58% 0px;
  }

  ${(props) => props.theme.media.laptop} {
    transform: ${({ index }) => (index !== 1 ? `translateY(25%)` : 0)};
  }
`;

const SCardSkeletonSection = styled(CardSkeletonSection)`
  height: 483px;

  & > span {
    left: 0 !important;
  }
  & > span > div {
    width: 204px;
    height: 386px;

    &:not(:nth-child(2)) {
      transform: translateY(25%);
    }
  }
`;

export default PostTypeSection;
