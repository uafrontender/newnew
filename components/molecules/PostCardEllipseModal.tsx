import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import switchPostType, { TPostType } from '../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../api/endpoints/post';
import EllipseModal, { EllipseModalButton } from '../atoms/EllipseModal';
import SharePanel from '../atoms/SharePanel';
import { Mixpanel } from '../../utils/mixpanel';
import useErrorToasts from '../../utils/hooks/useErrorToasts';
import { usePushNotifications } from '../../contexts/pushNotificationsContext';

import InlineSvg from '../atoms/InlineSVG';
import shareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import { useAppState } from '../../contexts/appStateContext';
import { MarkPostAsFavoriteOnSignUp } from '../../contexts/onSignUpWrapper';

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
  const { userUuid, userLoggedIn } = useAppState();

  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

  const { showErrorToastPredefined } = useErrorToasts();

  // Share
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const handleOpenShareMenu = useCallback(() => {
    setIsShareMenuOpen(true);
  }, []);

  const handleCloseShareMenu = useCallback(() => {
    setIsShareMenuOpen(false);
    onClose();
  }, [onClose]);

  // Following
  const [isFollowingDecision, setIsFollowingDecision] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const handleFollowDecision = useCallback(async () => {
    try {
      Mixpanel.track('Favorite Post', {
        _stage: 'Post',
        _postUuid: postUuid,
      });

      if (!userLoggedIn) {
        const onSignUp: MarkPostAsFavoriteOnSignUp = {
          type: 'favorite-post',
          postUuid,
        };

        router.push(
          `/sign-up?reason=follow-decision&redirect=${encodeURIComponent(
            `${process.env.NEXT_PUBLIC_APP_URL}/p/${
              postShortId || postUuid
            }?onSignUp=${JSON.stringify(onSignUp)}`
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
    userLoggedIn,
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

        if (!res?.data || res.error) {
          throw new Error('Request failed');
        }

        setIsFollowingDecision(!!switchPostType(res.data)[0].isFavoritedByMe);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFollowingLoading(false);
      }
    }

    if (userLoggedIn && isOpen) {
      fetchIsFollowing();
    }
  }, [userLoggedIn, postUuid, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsShareMenuOpen(false);
    }
  }, [isOpen]);

  return (
    <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
      {!isShareMenuOpen ? (
        <>
          <EllipseModalButton onClick={() => handleOpenShareMenu()}>
            <span>
              {t('ellipse.share')}
              {` `}
            </span>
            <SInlineSvg
              fill={
                theme.name === 'dark'
                  ? theme.colorsThemed.text.primary
                  : theme.colorsThemed.text.secondary
              }
              svg={shareIconFilled}
              height='16px'
              width='16px'
              wrapperType='span'
            />
          </EllipseModalButton>
          {postCreator.uuid !== userUuid && (
            <EllipseModalButton onClick={handleFollowDecision}>
              {
                // eslint-disable-next-line no-nested-ternary
                isFollowingLoading ? (
                  <Skeleton
                    height='17px'
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
          {postCreator.uuid !== userUuid && (
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
        </>
      ) : (
        <SSharePanel
          linkToShare={`${window.location.origin}/p/${postShortId}`}
          iconsSize='m'
          onCopyLink={handleCloseShareMenu}
        />
      )}
    </EllipseModal>
  );
};

PostCardEllipseModal.defaultProps = {
  handleAddPostToState: undefined,
  handleRemovePostFromState: undefined,
};

export default PostCardEllipseModal;

const SInlineSvg = styled(InlineSvg)`
  display: inline-flex;
  position: relative;
  top: 3px;
`;

const SSharePanel = styled(SharePanel)`
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  gap: 24px;
  display: flex;
  margin-top: 16px;
  margin-bottom: 16px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
`;
