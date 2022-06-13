/* eslint-disable consistent-return */
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';
import Text from '../atoms/Text';
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
        <AnimatePresence>
          {isVisible && (
            <SContainer
              ref={(el) => {
                containerRef.current = el!!;
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SButton onClick={() => handleCopyLink()}>
                <Text variant={3}>
                  {isCopiedUrl
                    ? t('ellipse.linkCopied')
                    : t('ellipse.copyLink')}
                </Text>
              </SButton>
              {postCreator.uuid !== user.userData?.userUuid && (
                <>
                  {!isFollowingLoading ? (
                    <SButton onClick={() => handleFollowDecision()}>
                      <Text variant={3}>
                        {!isFollowingDecision
                          ? t('ellipse.followDecision', {
                              postType: t(`postType.${postType}`),
                            })
                          : t('ellipse.unFollowDecision', {
                              postType: t(`postType.${postType}`),
                            })}
                      </Text>
                    </SButton>
                  ) : (
                    <Skeleton
                      count={1}
                      height='100%'
                      width='100px'
                      highlightColor={theme.colorsThemed.background.primary}
                    />
                  )}
                  <SButton
                    onClick={() => {
                      handleReportOpen();
                      onClose();
                    }}
                  >
                    <Text variant={3} tone='error'>
                      {t('ellipseMenu.report')}
                    </Text>
                  </SButton>
                </>
              )}
            </SContainer>
          )}
        </AnimatePresence>
      );
    }
  );

export default PostCardEllipseMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 56px;
  z-index: 10;
  right: 16px;
  width: calc(100% - 32px);

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;

  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.tablet} {
    right: 12px;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;

  cursor: pointer;

  text-align: right;

  &:focus {
    outline: none;
  }
`;
