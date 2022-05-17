import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppSelector } from '../../../redux-store/store';
import PostTopInfo from '../../molecules/decision/PostTopInfo';

// Utils
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import PostVideoProcessingHolder from '../../molecules/decision/PostVideoProcessingHolder';
import PostTopInfoModeration from '../../molecules/decision/PostTopInfoModeration';
import { TPostType } from '../../../utils/switchPostType';
import assets from '../../../constants/assets';
import Text from '../../atoms/Text';

const GoBackButton = dynamic(() => import('../../molecules/GoBackButton'));

const IMAGES = {
  ac: assets.creation.AcStatic,
  mc: assets.creation.McStatic,
  cf: assets.decision.votes,
};

interface IPostViewProcessingAnnouncement {
  post: newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice;
  postStatus: TPostStatusStringified;
  postType: string;
  variant: 'decision' | 'moderation';
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleRemovePostFromState: () => void;
  handleReportOpen: () => void;
}

// TODO: memorize
const PostViewProcessingAnnouncement: React.FunctionComponent<IPostViewProcessingAnnouncement> =
  ({
    post,
    postStatus,
    postType,
    variant,
    handleGoBack,
    handleUpdatePostStatus,
    handleRemovePostFromState,
    handleReportOpen,
  }) => {
    const { t } = useTranslation('decision');
    const { user } = useAppSelector((state) => state);
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    // Socket
    const socketConnection = useContext(SocketContext);
    const { addChannel, removeChannel } = useContext(ChannelsContext);

    // Increment channel subs after mounting
    // Decrement when unmounting
    useEffect(() => {
      addChannel(post.postUuid, {
        postUpdates: {
          postUuid: post.postUuid,
        },
      });

      return () => {
        removeChannel(post.postUuid);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const socketHandlerPostStatus = (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostStatusUpdated.decode(arr);

        if (!decoded) return;
        if (decoded.postUuid === post.postUuid) {
          if (decoded.auction) {
            handleUpdatePostStatus(decoded.auction!!);
          } else if (decoded.multipleChoice) {
            handleUpdatePostStatus(decoded.multipleChoice!!);
          } else {
            handleUpdatePostStatus(decoded.crowdfunding!!);
          }
        }
      };

      if (socketConnection) {
        socketConnection.on('PostStatusUpdated', socketHandlerPostStatus);
      }

      return () => {
        if (socketConnection && socketConnection.connected) {
          socketConnection.off('PostStatusUpdated', socketHandlerPostStatus);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketConnection, post, user.userData?.userUuid]);

    return (
      <SWrapper>
        <SExpiresSection>
          {isMobile && (
            <GoBackButton
              style={{
                gridArea: 'closeBtnMobile',
              }}
              onClick={handleGoBack}
            />
          )}
        </SExpiresSection>
        <PostVideoProcessingHolder
          holderText={
            user.loggedIn && user.userData?.userUuid === post.postUuid
              ? 'moderation'
              : 'decision'
          }
        />
        {variant === 'decision' ? (
          <PostTopInfo
            title={post.title}
            postId={post.postUuid}
            postStatus={postStatus}
            postType={postType as TPostType}
            creator={post.creator!!}
            hasWinner={false}
            isFollowingDecisionInitial={post.isFavoritedByMe ?? false}
            handleReportOpen={handleReportOpen}
          />
        ) : (
          <PostTopInfoModeration
            title={post.title}
            postId={post.postUuid}
            postStatus={postStatus}
            postType={postType as TPostType}
            hasWinner={false}
            hasResponse={false}
            handleUpdatePostStatus={handleUpdatePostStatus}
            handleRemovePostFromState={handleRemovePostFromState}
          />
        )}
        <SActivitesContainer>
          {/* @ts-ignore */}
          <SDecisionImage src={IMAGES[postType]} />
          <SText variant={2} weight={600}>
            {t(`PostViewProcessingAnnouncement.stayTuned.${postType}`)}
          </SText>
        </SActivitesContainer>
      </SWrapper>
    );
  };

export default PostViewProcessingAnnouncement;

const SWrapper = styled.div`
  display: grid;

  grid-template-areas:
    'expires'
    'video'
    'title'
    'activities';

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'title title'
      'video activities';
    grid-template-columns: 284px 1fr;
    grid-template-rows: min-content 1fr;
    grid-column-gap: 16px;

    align-items: flex-start;
  }

  ${({ theme }) => theme.media.laptop} {
    grid-template-areas:
      'video title'
      'video activities'
      'video activities';
    grid-template-columns: 410px 538px;
  }
`;

const SExpiresSection = styled.div`
  grid-area: expires;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: 'closeBtnMobile timer closeBtnDesktop';

  width: 100%;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    display: none;
    grid-area: unset;
  }
`;

const SActivitesContainer = styled.div`
  grid-area: activities;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  align-self: bottom;

  height: 100%;
  min-height: 300px;

  ${({ theme }) => theme.media.tablet} {
    min-height: initial;
    max-height: calc(728px - 46px - 64px - 40px - 72px);

    display: flex;
    align-items: center;
    justify-content: center;

    padding-bottom: 88px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-height: calc(728px - 46px - 64px);
  }
`;

const SDecisionImage = styled.img`
  width: 140px;
`;

const SText = styled(Text)`
  margin-top: 8px;

  text-align: center;
  white-space: pre;
`;
