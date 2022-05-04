import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppSelector } from '../../../redux-store/store';

import GoBackButton from '../../molecules/GoBackButton';
import PostTopInfo from '../../molecules/decision/PostTopInfo';

// Utils
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import PostVideoProcessingHolder from '../../molecules/decision/PostVideoProcessingHolder';

interface IPostViewProcessingAnnouncement {
  post: newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice;
  postStatus: TPostStatusStringified;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleReportOpen: () => void;
}

const PostViewProcessingAnnouncement: React.FunctionComponent<IPostViewProcessingAnnouncement> =
  ({
    post,
    postStatus,
    handleGoBack,
    handleUpdatePostStatus,
    handleReportOpen,
  }) => {
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
        <PostTopInfo
          title={post.title}
          postId={post.postUuid}
          postStatus={postStatus}
          creator={post.creator!!}
          hasWinner={false}
          hasResponse={false}
          isFollowingDecisionInitial={post.isFavoritedByMe ?? false}
          startsAtSeconds={post.startsAt?.seconds as number}
          handleReportOpen={handleReportOpen}
        />
        <SActivitesContainer />
      </SWrapper>
    );
  };

export default PostViewProcessingAnnouncement;

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
