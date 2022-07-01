/* eslint-disable consistent-return */ import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import EllipseMenu, { EllipseMenuButton } from '../atoms/EllipseMenu';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';
import { fetchPostByUUID, markPost } from '../../api/endpoints/post';
import switchPostType from '../../utils/switchPostType';
import { useAppSelector } from '../../redux-store/store';

interface IPostCardEllipseMenu {
  postUuid: string;
  postType: string;
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
      handleReportOpen,
      onClose,
      handleRemovePostFromState,
      handleAddPostToState,
      anchorElement,
    }) => {
      const theme = useTheme();
      const router = useRouter();
      const { t } = useTranslation('common');
      const containerRef = useRef<HTMLDivElement>();
      const user = useAppSelector((state) => state.user);

      useOnClickEsc(containerRef, onClose);
      useOnClickOutside(containerRef, onClose);

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

            setIsFollowingDecision(
              !!switchPostType(res.data)[0].isFavoritedByMe
            );
          } catch (err) {
            console.error(err);
          } finally {
            setIsFollowingLoading(false);
          }
        }

        if (user.loggedIn) {
          // setTimeout used to fix the React memory leak warning
          const timer = setTimeout(() => {
            fetchIsFollowing();
          });
          return () => {
            clearTimeout(timer);
          };
        }
      }, [user.loggedIn, postUuid]);

      return (
        <SEllipseMenu
          isOpen={isVisible}
          onClose={onClose}
          anchorElement={anchorElement}
        >
          <EllipseMenuButton variant={3} onClick={() => handleCopyLink()}>
            {isCopiedUrl ? t('ellipse.linkCopied') : t('ellipse.copyLink')}
          </EllipseMenuButton>
          {postCreator.uuid !== user.userData?.userUuid && (
            <>
              {!isFollowingLoading ? (
                <EllipseMenuButton
                  variant={3}
                  onClick={() => handleFollowDecision()}
                >
                  {!isFollowingDecision
                    ? t('ellipse.followDecision', {
                        postType: t(`postType.${postType}`),
                      })
                    : t('ellipse.unFollowDecision', {
                        postType: t(`postType.${postType}`),
                      })}
                </EllipseMenuButton>
              ) : (
                <Skeleton
                  count={1}
                  height='100%'
                  width='100px'
                  highlightColor={theme.colorsThemed.background.primary}
                />
              )}
              <EllipseMenuButton
                variant={3}
                tone='error'
                onClick={() => {
                  handleReportOpen();
                  onClose();
                }}
              >
                {t('ellipse.report')}
              </EllipseMenuButton>
            </>
          )}
        </SEllipseMenu>
      );
    }
  );

export default PostCardEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  gap: 16px;
`;
