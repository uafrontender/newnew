import React, {
  useCallback, useContext, useEffect,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import Lottie from '../../atoms/Lottie';
import GoBackButton from '../../molecules/GoBackButton';
import PostVideo from '../../molecules/decision/PostVideo';
import PostTopInfo from '../../molecules/decision/PostTopInfo';

// Assets
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

// Utils
import { TPostStatusStringified } from '../../../utils/switchPostStatus';

interface IPostViewProcessing {
  post: newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice;
  postStatus: TPostStatusStringified;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

const PostViewProcessing: React.FunctionComponent<IPostViewProcessing> = ({
  post,
  postStatus,
  handleGoBack,
  handleUpdatePostStatus,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

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
      <PostTopInfo
        title={post.title}
        postId={post.postUuid}
        postStatus={postStatus}
        creator={post.creator!!}
        hasWinner={false}
        hasResponse={false}
        isFollowingDecisionInitial={post.isFavoritedByMe ?? false}
        startsAtSeconds={post.startsAt?.seconds as number}
      />
      <SActivitesContainer>
        <SAnimationContainer>
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
      </SActivitesContainer>
    </SWrapper>
  );
};

export default PostViewProcessing;

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

const SAnimationContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;
