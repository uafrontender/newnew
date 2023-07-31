/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import moment from 'moment';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import UserAvatar from '../UserAvatar';

import { useUserData } from '../../../contexts/userDataContext';

import PostTitleContent from '../../atoms/PostTitleContent';
import { Mixpanel } from '../../../utils/mixpanel';
import { usePostCreationState } from '../../../contexts/postCreationContext';
import DisplayName from '../../atoms/DisplayName';
import SharePanel from '../../atoms/SharePanel';
import isBrowser from '../../../utils/isBrowser';

const VideojsPlayer = dynamic(() => import('../../atoms/VideojsPlayer'), {
  ssr: false,
});

interface IPublishedModal {
  open: boolean;
  handleRedirect: (url: string) => void;
  handleClose: () => void;
}

const PublishedModal: React.FC<IPublishedModal> = (props) => {
  const { open, handleRedirect, handleClose } = props;
  const { t } = useTranslation('page-Creation');
  const { userData } = useUserData();
  const { postInCreation } = usePostCreationState();
  const { post, videoProcessing, fileProcessing, postData } = useMemo(
    () => postInCreation,
    [postInCreation]
  );

  const preventClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // No need in translation as these are reserved words
  const postTypeText = useCallback(() => {
    if (postData) {
      if (postData.auction) {
        return 'Bid';
      }
      if (postData.crowdfunding) {
        return 'Goal';
      }
      return 'Superpoll';
    }

    return 'Bid';
  }, [postData]);

  const handleViewMyPost = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (postData) {
        Mixpanel.track('See My Post Click');
        let url;
        if (isBrowser()) {
          url = `${window.location.origin}/p/`;
          if (url) {
            if (postData.auction) {
              url += postData.auction.postShortId
                ? postData.auction.postShortId
                : postData.auction.postUuid;
            }
            if (postData.crowdfunding) {
              url += postData.crowdfunding.postShortId
                ? postData.crowdfunding.postShortId
                : postData.crowdfunding.postUuid;
            }
            if (postData.multipleChoice) {
              url += postData.multipleChoice.postShortId
                ? postData.multipleChoice.postShortId
                : postData.multipleChoice.postUuid;
            }

            handleRedirect(url);
          }
        }
      }
    },
    [postData, handleRedirect]
  );

  const formatExpiresAtNoStartsAt = useCallback(() => {
    const dateValue = moment();

    if (post.expiresAt === '1-hour') {
      dateValue.add(1, 'h');
    } else if (post.expiresAt === '3-hours') {
      dateValue.add(3, 'h');
    } else if (post.expiresAt === '6-hours') {
      dateValue.add(6, 'h');
    } else if (post.expiresAt === '12-hours') {
      dateValue.add(12, 'h');
    } else if (post.expiresAt === '1-day') {
      dateValue.add(1, 'd');
    } else if (post.expiresAt === '3-days') {
      dateValue.add(3, 'd');
    } else if (post.expiresAt === '5-days') {
      dateValue.add(5, 'd');
    } else if (post.expiresAt === '7-days') {
      dateValue.add(7, 'd');
    } else if (post.expiresAt === '2-minutes') {
      dateValue.add(2, 'm');
    } else if (post.expiresAt === '5-minutes') {
      dateValue.add(5, 'm');
    } else if (post.expiresAt === '10-minutes') {
      dateValue.add(10, 'm');
    }

    return dateValue;
  }, [post.expiresAt]);

  const linkToShare = useMemo(() => {
    if (!isBrowser()) {
      return '';
    }

    let url = `${window.location.origin}/p/`;
    if (url && postData) {
      if (postData.auction) {
        url += postData.auction.postShortId
          ? postData.auction.postShortId
          : postData.auction.postUuid;
      }
      if (postData.crowdfunding) {
        url += postData.crowdfunding.postShortId
          ? postData.crowdfunding.postShortId
          : postData.crowdfunding.postUuid;
      }
      if (postData.multipleChoice) {
        url += postData.multipleChoice.postShortId
          ? postData.multipleChoice.postShortId
          : postData.multipleChoice.postUuid;
      }
    }
    return url;
  }, [postData]);

  return (
    <Modal show={open} onClose={handleClose}>
      <SMobileContainer onClick={preventClick}>
        <SContent>
          <SPlayerWrapper>
            {open ? (
              fileProcessing.progress === 100 ? (
                <VideojsPlayer
                  id='published-modal'
                  muted
                  resources={videoProcessing?.targetUrls}
                  borderRadius='16px'
                  showPlayButton
                  withMuteControl
                />
              ) : (
                <SText variant={2}>{t('videoBeingProcessedCaption')}</SText>
              )
            ) : null}
          </SPlayerWrapper>
          <SUserBlock>
            <SUserAvatar avatarUrl={userData?.avatarUrl} />
            <SUserTitleContainer>
              <SUserTitle variant={3} weight={600}>
                <DisplayName user={userData} />
              </SUserTitle>
            </SUserTitleContainer>
            <SCaption variant={2} weight={700}>
              {post.startsAt.type === 'right-away'
                ? t('secondStep.card.left', {
                    time: formatExpiresAtNoStartsAt().fromNow(true),
                  })
                : t('secondStep.card.soon')}
            </SCaption>
          </SUserBlock>
          <SPostTitleText variant={3} weight={600}>
            {/* Navigation here only works when done through the router */}
            <PostTitleContent target='router'>{post.title}</PostTitleContent>
          </SPostTitleText>
          <STitle variant={6}>
            {t(
              `published.texts.title-${
                post.startsAt.type === 'right-away' ? 'published' : 'scheduled'
              }`
            )}
          </STitle>
          <SCaptionItsLive variant={2}>
            {postData?.auction
              ? t('published.texts.shareCaptionBid')
              : t('published.texts.shareCaptionSuperpoll')}
          </SCaptionItsLive>
          <SSharePanel linkToShare={linkToShare} />
          <SButtonWrapper id='see-post' onClick={handleViewMyPost}>
            <SButtonTitle>
              {t(
                `published.button.submit-${
                  post.startsAt.type === 'right-away'
                    ? 'published'
                    : 'scheduled'
                }`,
                {
                  value: postTypeText(),
                }
              )}
            </SButtonTitle>
          </SButtonWrapper>
        </SContent>
      </SMobileContainer>
    </Modal>
  );
};

export default PublishedModal;

const SMobileContainer = styled.div`
  top: 50%;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  overflow: hidden;
  position: relative;
  max-width: 464px;
  transform: translateY(-50%);
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 16px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 480px;
  }
`;

const SContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SPlayerWrapper = styled.div`
  width: 224px;
  height: 336px;
  margin: 8px auto 0 auto;
`;

const STitle = styled(Headline)`
  margin-top: 24px;
  text-align: center;
`;

const SCaptionItsLive = styled(Caption)`
  text-align: center;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SButtonWrapper = styled.div`
  cursor: pointer;
  display: flex;
  padding: 16px 0;
  align-items: center;
  justify-content: center;
`;

const SButtonTitle = styled.div`
  font-size: 16px;
  line-height: 24px;
  font-weight: bold;
`;

const SUserBlock = styled.div`
  width: 224px;
  margin: 16px auto 16px auto;
  display: grid;
  align-items: center;
  flex-direction: row;

  grid-template-columns: 36px 1fr max-content;
`;

const SUserAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
`;

const SUserTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
`;

const SUserTitle = styled(Text)`
  display: flex;
  flex-direction: row;

  padding-left: 12px;
  margin-right: 2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  text-align: center;
  padding-top: 120px;
`;

const SPostTitleText = styled(Text)`
  width: 224px;
  margin-left: auto;
  margin-right: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SCaption = styled(Caption)`
  margin-left: 4px;
  justify-self: flex-end;
  line-break: strict;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SSharePanel = styled(SharePanel)`
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  gap: 24px;
  display: flex;
  margin-top: 16px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
`;
