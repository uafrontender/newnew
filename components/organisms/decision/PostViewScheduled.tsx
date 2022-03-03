/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React, {
  useCallback, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';


import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { markPost } from '../../../api/endpoints/post';

import PostVideo from '../../molecules/decision/PostVideo';
import GoBackButton from '../../molecules/GoBackButton';

// Utils
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import { TPostType } from '../../../utils/switchPostType';
import PostScheduledSection from '../../molecules/decision/PostScheduledSection';
import PostTopInfo from '../../molecules/decision/PostTopInfo';

interface IPostViewScheduled {
  post: newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice;
  postType: TPostType;
  postStatus: TPostStatusStringified;
  handleGoBack: () => void;
}

const PostViewScheduled: React.FunctionComponent<IPostViewScheduled> = ({
  post,
  postType,
  postStatus,
  handleGoBack,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [isFollowing, setIsFollowing] = useState(post.isFavoritedByMe ?? false);

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  const handleFollowDecision = async () => {
    if (!user.loggedIn || user.userData?.userUuid === post.creator?.uuid) return;
    try {
      const markAsViewedPayload = new newnewapi.MarkPostRequest({
        markAs: !isFollowing ? newnewapi.MarkPostRequest.Kind.FAVORITE : newnewapi.MarkPostRequest.Kind.NOT_FAVORITE,
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
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <PostTopInfo
        title={post.title}
        postId={post.postUuid}
        creator={post.creator!!}
        isFollowingDecisionInitial={post.isFavoritedByMe ?? false}
        startsAtSeconds={post.startsAt?.seconds as number}
        handleFollowCreator={() => {}}
        handleReportAnnouncement={() => {}}
      />
      <SActivitesContainer>
        <PostScheduledSection
          timestampSeconds={new Date((post.startsAt?.seconds as number) * 1000).getTime()}
          isFollowing={isFollowing}
          handleFollowDecision={handleFollowDecision}
        />
      </SActivitesContainer>
    </SWrapper>
  );
};

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
    /* grid-template-rows: 46px 64px 40px calc(506px - 46px); */
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
