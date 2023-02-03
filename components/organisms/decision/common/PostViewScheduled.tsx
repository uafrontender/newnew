/* eslint-disable no-nested-ternary */
/* eslint-disable no-lonely-if */
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

// Utils
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { Mixpanel } from '../../../../utils/mixpanel';
import { markPost } from '../../../../api/endpoints/post';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { toggleMutedMode } from '../../../../redux-store/slices/uiStateSlice';

import PostVideo from '../../../molecules/decision/common/PostVideo';
import PostScheduledSection from '../../../molecules/decision/common/PostScheduledSection';
// import { SubscriptionToPost } from '../../../molecules/profile/SmsNotificationModal';
import { usePushNotifications } from '../../../../contexts/pushNotificationsContext';
import McOptionsTabModeration from '../../../molecules/decision/moderation/multiple_choice/McOptionsTabModeration';
import useMcOptions from '../../../../utils/hooks/useMcOptions';

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
    const { t } = useTranslation('page-Post');
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const { promptUserWithPushNotificationsPermissionModal } =
      usePushNotifications();

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

    // For Superpoll moderation
    const [openedTab, setOpenedTab] = useState<'options' | 'hourglass'>(
      'hourglass'
    );

    const {
      processedOptions: options,
      hasNextPage: hasNextOptionsPage,
      fetchNextPage: fetchNextOptionsPage,
      removeMcOptionMutation,
    } = useMcOptions(
      {
        postUuid: post.postUuid,
        userUuid: user.userData?.userUuid,
        loggedInUser: user.loggedIn,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

    const handleRemoveOption = useCallback(
      (optionToRemove: newnewapi.MultipleChoice.Option) => {
        Mixpanel.track('Removed Option', {
          _stage: 'Post',
          _postUuid: post.postUuid,
          _component: 'PostViewScheduled',
        });
        removeMcOptionMutation?.mutate(optionToRemove);
      },
      [post.postUuid, removeMcOptionMutation]
    );

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

        if (!isFollowing) {
          promptUserWithPushNotificationsPermissionModal();
        }
      } catch (err) {
        console.error(err);
      }
    };

    /* const subscription: SubscriptionToPost = useMemo(
      () => ({
        type: 'post',
        postUuid: post.postUuid,
        postTitle: post.title,
      }),
      [post]
    ); */

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
          postUuid={post.postUuid}
          announcement={post.announcement!!}
          response={post.response ?? undefined}
          responseViewed={false}
          handleSetResponseViewed={() => {}}
          isMuted={mutedMode}
          handleToggleMuted={() => handleToggleMutedMode()}
        />
        {isMobile &&
          (variant === 'decision' ? (
            <PostTopInfo /* subscription={subscription} */ hasWinner={false} />
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
                <PostTopInfo
                  /* subscription={subscription} */ hasWinner={false}
                />
              ) : (
                <PostTopInfoModeration hasWinner={false} />
              ))}
            {variant === 'moderation' && postType === 'mc' ? (
              <SToggleOptionsButton
                noArrow={openedTab === 'hourglass'}
                onClick={() =>
                  setOpenedTab((curr) =>
                    curr === 'hourglass' ? 'options' : 'hourglass'
                  )
                }
              >
                {openedTab === 'hourglass'
                  ? t('postScheduled.moderation.toggleButton')
                  : t('back')}
              </SToggleOptionsButton>
            ) : null}
          </div>
          {variant === 'moderation' && postType === 'mc' ? (
            openedTab === 'hourglass' ? (
              <PostScheduledSection
                postType={postType}
                timestampSeconds={new Date(
                  (post.startsAt?.seconds as number) * 1000
                ).getTime()}
                isFollowing={isFollowing}
                variant={variant}
                handleFollowDecision={handleFollowDecision}
              />
            ) : (
              <McOptionsTabModeration
                post={postParsed as newnewapi.MultipleChoice}
                options={options}
                hasNextPage={!!hasNextOptionsPage}
                fetchNextPage={fetchNextOptionsPage}
                winningOptionId={undefined}
                handleRemoveOption={handleRemoveOption}
              />
            )
          ) : (
            <PostScheduledSection
              postType={postType}
              timestampSeconds={new Date(
                (post.startsAt?.seconds as number) * 1000
              ).getTime()}
              isFollowing={isFollowing}
              variant={variant}
              handleFollowDecision={handleFollowDecision}
            />
          )}
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
  min-height: 180px;

  ${({ theme }) => theme.media.tablet} {
    align-items: flex-start;

    display: flex;
    flex-direction: column;
    gap: 16px;

    height: 506px;
    max-height: 506px;
    min-height: unset;
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;
    max-height: 728px;
    width: 100%;
  }
`;

const SToggleOptionsButton = styled(GoBackButton)``;
