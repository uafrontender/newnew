import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { markPost } from '../../../api/endpoints/post';
import PostVideo from '../../molecules/decision/PostVideo';
import PostScheduledSection from '../../molecules/decision/PostScheduledSection';

// Utils
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import { TPostType } from '../../../utils/switchPostType';

const GoBackButton = dynamic(() => import('../../molecules/GoBackButton'));
const PostTopInfo = dynamic(
  () => import('../../molecules/decision/PostTopInfo')
);
const PostTopInfoModeration = dynamic(
  () => import('../../molecules/decision/PostTopInfoModeration')
);

interface IPostViewScheduled {
  post: newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice;
  postType: string;
  postStatus: TPostStatusStringified;
  variant: 'decision' | 'moderation';
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleRemovePostFromState: () => void;
  handleReportOpen: () => void;
}

const PostViewScheduled: React.FunctionComponent<IPostViewScheduled> =
  React.memo(
    ({
      post,
      postType,
      postStatus,
      variant,
      handleGoBack,
      handleUpdatePostStatus,
      handleReportOpen,
      handleRemovePostFromState,
    }) => {
      const dispatch = useAppDispatch();
      const { user } = useAppSelector((state) => state);
      const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
      const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
        resizeMode
      );

      // Socket
      const socketConnection = useContext(SocketContext);
      const { addChannel, removeChannel } = useContext(ChannelsContext);

      const [isFollowing, setIsFollowing] = useState(
        post.isFavoritedByMe ?? false
      );

      const handleToggleMutedMode = useCallback(() => {
        dispatch(toggleMutedMode(''));
      }, [dispatch]);

      const handleFollowDecision = async () => {
        if (!user.loggedIn || user.userData?.userUuid === post.creator?.uuid)
          return;
        try {
          const markAsViewedPayload = new newnewapi.MarkPostRequest({
            markAs: !isFollowing
              ? newnewapi.MarkPostRequest.Kind.FAVORITE
              : newnewapi.MarkPostRequest.Kind.NOT_FAVORITE,
            postUuid: post.postUuid,
          });

          const res = await markPost(markAsViewedPayload);

          if (!res.error) {
            setIsFollowing(!isFollowing);
          }
        } catch (err) {
          console.error(err);
        }
      };

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
          <PostVideo
            postId={post.postUuid}
            announcement={post.announcement!!}
            response={post.response ?? undefined}
            responseViewed={false}
            handleSetResponseViewed={() => {}}
            isMuted={mutedMode}
            handleToggleMuted={() => handleToggleMutedMode()}
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
            <PostScheduledSection
              postType={postType}
              timestampSeconds={new Date(
                (post.startsAt?.seconds as number) * 1000
              ).getTime()}
              isFollowing={isFollowing}
              variant={variant}
              handleFollowDecision={handleFollowDecision}
            />
          </SActivitesContainer>
        </SWrapper>
      );
    }
  );

export default PostViewScheduled;

const SWrapper = styled.div`
  display: grid;

  grid-template-areas:
    'expires'
    'video'
    'title';

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

  align-self: bottom;

  height: 100%;

  ${({ theme }) => theme.media.tablet} {
    min-height: initial;
    max-height: calc(728px - 46px - 64px - 40px - 72px);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  ${({ theme }) => theme.media.laptop} {
    max-height: calc(728px - 46px - 64px);
  }
`;
