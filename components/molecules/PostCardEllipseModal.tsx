import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useTheme } from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import switchPostType, { TPostType } from '../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../api/endpoints/post';
import { useAppSelector } from '../../redux-store/store';
import EllipseModal, { EllipseModalButton } from '../atoms/EllipseModal';
import { Mixpanel } from '../../utils/mixpanel';
import useErrorToasts from '../../utils/hooks/useErrorToasts';
import { usePushNotifications } from '../../contexts/pushNotificationsContext';

interface IPostCardEllipseModal {
  isOpen: boolean;
  zIndex: number;
  postUuid: string;
  postShortId: string;
  postType: TPostType;
  postCreator: newnewapi.User;
  handleReportOpen: () => void;
  onClose: () => void;
  handleRemovePostFromState?: () => void;
  handleAddPostToState?: () => void;
}

const PostCardEllipseModal: React.FunctionComponent<IPostCardEllipseModal> = ({
  isOpen,
  zIndex,
  postCreator,
  postUuid,
  postShortId,
  postType,
  handleReportOpen,
  onClose,
  handleRemovePostFromState,
  handleAddPostToState,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('common');
  const user = useAppSelector((state) => state.user);

  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

  const { showErrorToastPredefined } = useErrorToasts();

  // Share
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handleCopyLink = useCallback(() => {
    if (window) {
      const url = `${window.location.origin}/p/${postShortId || postUuid}`;
      Mixpanel.track('Copied Link Post Modal', {
        _stage: 'Post',
        _postUuid: postUuid,
      });
      copyPostUrlToClipboard(url)
        .then(() => {
          setIsCopiedUrl(true);
          setTimeout(() => {
            onClose();
            setIsCopiedUrl(false);
          }, 1000);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [postShortId, postUuid, onClose]);

  // Following
  const [isFollowingDecision, setIsFollowingDecision] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const handleFollowDecision = useCallback(async () => {
    try {
      Mixpanel.track('Favorite Post', {
        _stage: 'Post',
        _postUuid: postUuid,
      });

      // Redirect only after the persist data is pulled
      if (!user.loggedIn && user._persist?.rehydrated) {
        router.push(
          `/sign-up?reason=follow-decision&redirect=${encodeURIComponent(
            `${process.env.NEXT_PUBLIC_APP_URL}/p/${postShortId || postUuid}`
          )}`
        );
        return;
      }
      const markAsFavoritePayload = new newnewapi.MarkPostRequest({
        markAs: !isFollowingDecision
          ? newnewapi.MarkPostRequest.Kind.FAVORITE
          : newnewapi.MarkPostRequest.Kind.NOT_FAVORITE,
        postUuid,
      });

      const res = await markPost(markAsFavoritePayload);

      if (!res.error) {
        setIsFollowingDecision(!isFollowingDecision);

        if (isFollowingDecision) {
          handleRemovePostFromState?.();
        } else {
          handleAddPostToState?.();
          promptUserWithPushNotificationsPermissionModal();
        }
      }
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    }
  }, [
    postUuid,
    user.loggedIn,
    user._persist?.rehydrated,
    isFollowingDecision,
    router,
    postShortId,
    handleRemovePostFromState,
    handleAddPostToState,
    showErrorToastPredefined,
    promptUserWithPushNotificationsPermissionModal,
  ]);

  useEffect(() => {
    async function fetchIsFollowing() {
      setIsFollowingLoading(true);
      try {
        const payload = new newnewapi.GetPostRequest({
          postUuid,
        });

        const res = await fetchPostByUUID(payload);

        if (!res.data || res.error) throw new Error('Request failed');

        setIsFollowingDecision(!!switchPostType(res.data)[0].isFavoritedByMe);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFollowingLoading(false);
      }
    }

    if (user.loggedIn && isOpen) {
      fetchIsFollowing();
    }
  }, [user.loggedIn, postUuid, isOpen]);

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      <EllipseModalButton onClick={handleCopyLink}>
        {isCopiedUrl ? t('ellipse.linkCopied') : t('ellipse.copyLink')}
      </EllipseModalButton>
      {postCreator.uuid !== user.userData?.userUuid && (
        <EllipseModalButton onClick={handleFollowDecision}>
          {
            // eslint-disable-next-line no-nested-ternary
            isFollowingLoading ? (
              <Skeleton
                highlightColor={theme.colorsThemed.background.primary}
                baseColor={theme.colorsThemed.background.secondary}
              />
            ) : !isFollowingDecision ? (
              t('ellipse.followDecision', {
                postType: t(`postType.${postType}`),
              })
            ) : (
              t('ellipse.unFollowDecision', {
                postType: t(`postType.${postType}`),
              })
            )
          }
        </EllipseModalButton>
      )}
      {postCreator.uuid !== user.userData?.userUuid && (
        <EllipseModalButton
          tone='error'
          onClick={() => {
            Mixpanel.track('Report Open Post Modal', {
              _stage: 'Post',
              _postUuid: postUuid,
            });
            handleReportOpen();
            onClose();
          }}
        >
          {t('ellipse.report')}
        </EllipseModalButton>
      )}
    </EllipseModal>
  );
};

PostCardEllipseModal.defaultProps = {
  handleAddPostToState: undefined,
  handleRemovePostFromState: undefined,
};

export default PostCardEllipseModal;
