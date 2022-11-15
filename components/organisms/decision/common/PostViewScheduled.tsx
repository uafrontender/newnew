/* eslint-disable no-lonely-if */
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

// Utils
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { Mixpanel } from '../../../../utils/mixpanel';
import { markPost } from '../../../../api/endpoints/post';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { toggleMutedMode } from '../../../../redux-store/slices/uiStateSlice';

import PostVideo from '../../../molecules/decision/common/PostVideo';
import PostScheduledSection from '../../../molecules/decision/common/PostScheduledSection';

const GoBackButton = dynamic(() => import('../../../molecules/GoBackButton'));
const PostTopInfo = dynamic(
  () => import('../../../molecules/decision/common/PostTopInfo')
);
const PostTopInfoModeration = dynamic(
  () => import('../../../molecules/decision/moderation/PostTopInfoModeration')
);

interface IPostViewScheduled {
  variant: 'decision' | 'moderation';
}

const PostViewScheduled: React.FunctionComponent<IPostViewScheduled> =
  React.memo(({ variant }) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const { postParsed, typeOfPost, handleGoBackInsidePost } =
      usePostInnerState();
    const post = useMemo(
      () =>
        postParsed as
          | newnewapi.Auction
          | newnewapi.Crowdfunding
          | newnewapi.MultipleChoice,
      [postParsed]
    );
    const postType = useMemo(() => typeOfPost ?? 'ac', [typeOfPost]);

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
        Mixpanel.track('Favorite Post', {
          _stage: 'Post',
          _postUuid: post.postUuid,
        });
        const markAsFavoritePayload = new newnewapi.MarkPostRequest({
          markAs: !isFollowing
            ? newnewapi.MarkPostRequest.Kind.FAVORITE
            : newnewapi.MarkPostRequest.Kind.NOT_FAVORITE,
          postUuid: post.postUuid,
        });

        const res = await markPost(markAsFavoritePayload);

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
              onClick={handleGoBackInsidePost}
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
        {isMobile &&
          (variant === 'decision' ? (
            <PostTopInfo hasWinner={false} />
          ) : (
            <PostTopInfoModeration hasWinner={false} />
          ))}
        <SActivitiesContainer>
          <div
            style={{
              flex: '0 0 auto',
              width: '100%',
            }}
          >
            {!isMobile &&
              (variant === 'decision' ? (
                <PostTopInfo hasWinner={false} />
              ) : (
                <PostTopInfoModeration hasWinner={false} />
              ))}
          </div>
          <PostScheduledSection
            postType={postType}
            timestampSeconds={new Date(
              (post.startsAt?.seconds as number) * 1000
            ).getTime()}
            isFollowing={isFollowing}
            variant={variant}
            handleFollowDecision={handleFollowDecision}
          />
        </SActivitiesContainer>
      </SWrapper>
    );
  });

export default PostViewScheduled;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 648px;
    min-height: 0;
    align-items: flex-start;

    display: flex;
    gap: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    display: flex;
    gap: 32px;
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

const SActivitiesContainer = styled.div`
  ${({ theme }) => theme.media.tablet} {
    align-items: flex-start;

    display: flex;
    flex-direction: column;
    gap: 16px;

    height: 506px;
    max-height: 506px;
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;
    max-height: 728px;
    width: 100%;
  }
`;
