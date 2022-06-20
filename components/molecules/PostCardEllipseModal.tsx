import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import Modal from '../organisms/Modal';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import switchPostType from '../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../api/endpoints/post';
import { useAppSelector } from '../../redux-store/store';

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
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <SButton onClick={() => handleCopyLink()}>
            <Text variant={3}>
              {isCopiedUrl ? t('ellipse.linkCopied') : t('ellipse.copyLink')}
            </Text>
          </SButton>
          <SSeparator />
          {postCreator.uuid !== user.userData?.userUuid && (
            <>
              <SButton onClick={() => handleFollowDecision()}>
                {!isFollowingLoading && (
                  <Text variant={3}>
                    {!isFollowingDecision
                      ? t('ellipse.followDecision', {
                          postType: t(`postType.${postType}`),
                        })
                      : t('ellipse.unFollowDecision', {
                          postType: t(`postType.${postType}`),
                        })}
                  </Text>
                )}
              </SButton>
              <SSeparator />
              <SButton
                onClick={() => {
                  handleReportOpen();
                  onClose();
                }}
              >
                <Text variant={3} tone='error'>
                  {t('ellipse.report')}
                </Text>
              </SButton>
            </>
          )}
        </SContentContainer>
        <Button
          view='secondary'
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
          onClick={() => onClose()}
        >
          {t('ellipse.cancel')}
        </Button>
      </SWrapper>
    </Modal>
  );
};

PostCardEllipseModal.defaultProps = {
  handleAddPostToState: undefined,
  handleRemovePostFromState: undefined,
};

export default PostCardEllipseModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 16px;
`;

const SContentContainer = styled.div`
  width: calc(100% - 32px);
  height: fit-content;

  display: flex;
  flex-direction: column;

  padding: 16px;
  padding-bottom: 30px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;

  text-align: center;

  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const SSeparator = styled.div`
  margin-top: 14px;
  margin-bottom: 14px;
  width: 100%;
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;
