import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import switchPostType from '../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../api/endpoints/post';
import { useAppSelector } from '../../redux-store/store';
import EllipseModal, { EllipseModalButton } from '../atoms/EllipseModal';

interface IPostCardEllipseModal {
  isOpen: boolean;
  zIndex: number;
  postUuid: string;
  postType: string;
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
  postType,
  handleReportOpen,
  onClose,
  handleRemovePostFromState,
  handleAddPostToState,
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const user = useAppSelector((state) => state.user);

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
      const url = `${window.location.origin}/post/${postUuid}`;

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
  }, [postUuid, onClose]);

  // Following
  const [isFollowingDecision, setIsFollowingDecision] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const handleFollowDecision = useCallback(async () => {
    try {
      if (!user.loggedIn) {
        router.push(
          `/sign-up?reason=follow-decision&redirect=${encodeURIComponent(
            `${process.env.NEXT_PUBLIC_APP_URL}/post/${postUuid}`
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
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    handleAddPostToState,
    handleRemovePostFromState,
    isFollowingDecision,
    postUuid,
    router,
    user.loggedIn,
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

    if (user.loggedIn) {
      fetchIsFollowing();
    }
  }, [user.loggedIn, postUuid]);

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      <EllipseModalButton onClick={handleCopyLink}>
        {isCopiedUrl ? t('ellipse.linkCopied') : t('ellipse.copyLink')}
      </EllipseModalButton>
      {postCreator.uuid !== user.userData?.userUuid && (
        <EllipseModalButton onClick={handleFollowDecision}>
          {
            // eslint-disable-next-line no-nested-ternary
            isFollowingLoading
              ? ''
              : !isFollowingDecision
              ? t('ellipse.followDecision', {
                  postType: t(`postType.${postType}`),
                })
              : t('ellipse.unFollowDecision', {
                  postType: t(`postType.${postType}`),
                })
          }
        </EllipseModalButton>
      )}
      {postCreator.uuid !== user.userData?.userUuid && (
        <EllipseModalButton
          tone='error'
          onClick={() => {
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
