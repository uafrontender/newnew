import React from 'react';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';

import Headline from '../../atoms/Headline';
import PostCard from '../../molecules/PostCard';
import Text from '../../atoms/Text';
import { CardSkeletonSection } from '../../molecules/CardSkeleton';

import { usePostModalState } from '../../../contexts/postModalContext';
import { useAppSelector } from '../../../redux-store/store';
import switchPostType from '../../../utils/switchPostType';

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
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isDesktop = ['laptop', 'laptopM', 'laptopL'].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const renderPosts = (post: newnewapi.Post, index: number) => {
    const handleOpenPostModal = () => {
      openPostModal(post);
    };
    return (
      <SItemWrapper
        key={switchPostType(post)[0].postUuid}
        index={index}
        onClick={handleOpenPostModal}
      >
        <PostCard
          item={post}
          shouldStop={postOverlayOpen}
          index={index}
          width={isDesktop ? '204px' : '100%'}
          maxWidthTablet='100%'
        />
      </SItemWrapper>
    );
  };

  return (
    <SContainer headingPosition={headingPosition}>
      <SHeading>
        <SIconHolder>
          <img src={iconSrc} alt={title} draggable={false} />
        </SIconHolder>
        <SHeadline variant={2}>{title}</SHeadline>
        <SCaption variant={2} weight={600}>
          {caption}
        </SCaption>
      </SHeading>
      {!loading && (
        <SPosts>{posts.map((post, index) => renderPosts(post, index))}</SPosts>
      )}
      {loading && <SCardSkeletonSection count={isMobile ? 1 : 3} />}
    </SContainer>
  );
};

const SContainer = styled.section<{
  headingPosition: 'right' | 'left';
}>`
  display: flex;
  flex-direction: column;
  padding: 20px 0;

  ${(props) => props.theme.media.laptop} {
    padding: 60px 0;
  }

  ${({ theme }) => theme.media.laptopM} {
    margin: 0 auto;
    max-width: 1248px;

    ${({ headingPosition }) =>
      headingPosition === 'right'
        ? css`
            flex-direction: row-reverse;
            ${SHeading} {
              margin-left: auto;
            }
          `
        : css`
            flex-direction: row;
            ${SHeading} {
              margin-right: auto;
            }
          `}
  }
`;

const SHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  max-width: 365px;
  align-self: center;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 40px;
  }

  ${({ theme }) => theme.media.laptopM} {
    align-items: flex-start;
    align-self: unset;
    margin-top: 28px;
    margin-bottom: 0;
    max-width: 425px;
  }
`;

const SIconHolder = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  img {
    height: 160px;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    img {
      height: 120px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    img {
      height: 220px;
    }
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 16px;
  font-size: 36px;
  line-height: 44px;

  ${({ theme }) => theme.media.laptopM} {
    margin-bottom: 24px;
    font-size: 80px;
    line-height: 86px;
  }
`;

const SCaption = styled(Text)`
  padding: 0 8px;
  text-align: center;

  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.laptopM} {
    padding: 0;
    text-align: left;
    font-size: 16px;
    line-height: 24px;
  }
`;

const SPosts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    gap: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    gap: 32px;
  }

  ${(props) => props.theme.media.laptopM} {
    flex-direction: row;
    height: 482px;
  }
`;

const SItemWrapper = styled.div<{ index: number }>`
  ${(props) => props.theme.media.tablet} {
    flex: 1;

    & > div > div:first-child {
      padding: 61% 0px;
    }
  }

  ${(props) => props.theme.media.laptop} {
    & > div {
      max-width: 100%;
      width: 100%;
    }
  }

  ${(props) => props.theme.media.laptopM} {
    transform: ${({ index }) => (index !== 1 ? `translateY(25%)` : 0)};
    height: 386px;

    & > div {
      min-width: 204px;
      max-width: 204px;
      height: 386px;
      background: ${({ theme }) => theme.colorsThemed.background.backgroundDD};
      border-color: ${({ theme }) =>
        theme.name === 'dark'
          ? theme.colorsThemed.background.backgroundDD
          : theme.colorsThemed.background.outlines1};
    }

    & > div > div:first-child {
      padding: 60% 0px;
    }
  }
`;

const SCardSkeletonSection = styled(CardSkeletonSection)`
  &&& {
    & > span {
      left: 0;
      gap: 0;
      width: auto;
    }
    & > span > div {
      min-width: 100%;
    }

    ${({ theme }) => theme.media.tablet} {
      & > span {
        gap: 16px;
        width: auto;
      }

      & > span > div {
        min-width: calc((100% - 16px * 2) / 3);
        max-width: calc((100% - 16px * 2) / 3);
        height: 412px;
      }
    }

    ${({ theme }) => theme.media.laptop} {
      & > span {
        gap: 32px;
      }

      & > span > div {
        min-width: calc((100% - 32px * 2) / 3);
        max-width: calc((100% - 32px * 2) / 3);
        height: 412px;
      }
    }

    ${({ theme }) => theme.media.laptopM} {
      height: 482px;
      width: auto;

      & > span > div {
        min-width: 204px;
        max-width: 204px;
        height: 386px;

        &:not(:nth-child(2)) {
          transform: translateY(25%);
        }
      }
    }
  }
`;

export default PostTypeSection;
