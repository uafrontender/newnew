/* eslint-disable consistent-return */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import EllipseMenu, { EllipseMenuButton } from '../atoms/EllipseMenu';
import SharePanel from '../atoms/SharePanel';

import { fetchPostByUUID, markPost } from '../../api/endpoints/post';
import useErrorToasts from '../../utils/hooks/useErrorToasts';
import switchPostType, { TPostType } from '../../utils/switchPostType';
import { Mixpanel } from '../../utils/mixpanel';
import { usePushNotifications } from '../../contexts/pushNotificationsContext';

import InlineSvg from '../atoms/InlineSVG';
import shareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import { useAppState } from '../../contexts/appStateContext';
import { MarkPostAsFavoriteOnSignUp } from '../../contexts/onSignUpWrapper';

interface IPostCardEllipseMenu {
  postUuid: string;
  postShortId: string;
  postType: TPostType;
  isVisible: boolean;
  postCreator: newnewapi.User;
  handleReportOpen: () => void;
  onClose: () => void;
  handleRemovePostFromState?: () => void;
  handleAddPostToState?: () => void;
  anchorElement?: HTMLElement;
}

const PostCardEllipseMenu: React.FunctionComponent<IPostCardEllipseMenu> =
  React.memo(
    ({
      postType,
      isVisible,
      postCreator,
      postUuid,
      postShortId,
      handleReportOpen,
      onClose,
      handleRemovePostFromState,
      handleAddPostToState,
      anchorElement,
    }) => {
      const theme = useTheme();
      const router = useRouter();
      const { t } = useTranslation('common');
      const { userUuid, userLoggedIn } = useAppState();

      const { promptUserWithPushNotificationsPermissionModal } =
        usePushNotifications();

      const { showErrorToastPredefined } = useErrorToasts();
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

            setIsFollowingDecision(
              !!switchPostType(res.data)[0].isFavoritedByMe
            );
          } catch (err) {
            console.error(err);
          } finally {
            setIsFollowingLoading(false);
          }
        }

        if (userLoggedIn && isVisible) {
          // setTimeout used to fix the React memory leak warning
          const timer = setTimeout(() => {
            fetchIsFollowing();
          });
          return () => {
            clearTimeout(timer);
          };
        }
      }, [userLoggedIn, postUuid, isVisible]);

      useEffect(() => {
        if (!isVisible) {
          setIsShareMenuOpen(false);
        }
      }, [isVisible]);

      return (
        <SEllipseMenu
          isOpen={isVisible}
          onClose={onClose}
          anchorElement={anchorElement}
        >
          {!isShareMenuOpen ? (
            <>
              <SEllipseMenuButton
                variant={3}
                onClick={() => handleOpenShareMenu()}
              >
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
              </SEllipseMenuButton>
              {postCreator.uuid !== userUuid && (
                <>
                  {!isFollowingLoading ? (
                    <SEllipseMenuButton
                      variant={3}
                      onClick={handleFollowDecision}
                    >
                      {!isFollowingDecision
                        ? t('ellipse.followDecision', {
                            postType: t(`postType.${postType}`),
                          })
                        : t('ellipse.unFollowDecision', {
                            postType: t(`postType.${postType}`),
                          })}
                    </SEllipseMenuButton>
                  ) : (
                    <Skeleton
                      count={1}
                      height='34px'
                      width='164px'
                      highlightColor={theme.colorsThemed.background.primary}
                    />
                  )}
                  <SEllipseMenuButton
                    variant={3}
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
                  </SEllipseMenuButton>
                </>
              )}
            </>
          ) : (
            <SSharePanel
              linkToShare={`${window.location.origin}/p/${postShortId}`}
              iconsSize='s'
              onCopyLink={handleCloseShareMenu}
            />
          )}
        </SEllipseMenu>
      );
    }
  );

export default PostCardEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  position: fixed;
`;

const SEllipseMenuButton = styled(EllipseMenuButton)`
  text-align: right;
  vertical-align: middle;
`;

const SInlineSvg = styled(InlineSvg)`
  display: inline-flex;
  position: relative;
  top: 3px;
`;

const SSharePanel = styled(SharePanel)`
  width: min-content;
  margin-left: auto;
  margin-right: auto;
  gap: 16px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;

  padding: 8px;
`;
