/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import moment from 'moment';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import copyIcon from '../../../public/images/svg/icons/outlined/Link.svg';
import tiktokIcon from '../../../public/images/svg/icons/socials/TikTok.svg';
import twitterIcon from '../../../public/images/svg/icons/socials/Twitter.svg';
import facebookIcon from '../../../public/images/svg/icons/socials/Facebook.svg';
import instagramIcon from '../../../public/images/svg/icons/socials/Instagram.svg';
import { clearCreation } from '../../../redux-store/slices/creationStateSlice';
import PostTitleContent from '../../atoms/PostTitleContent';
import { Mixpanel } from '../../../utils/mixpanel';

const SOCIAL_ICONS: any = {
  copy: copyIcon,
  tiktok: tiktokIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
};

const BitmovinPlayer = dynamic(() => import('../../atoms/BitmovinPlayer'), {
  ssr: false,
});

interface IPublishedModal {
  open: boolean;
  handleClose: () => void;
}

const PublishedModal: React.FC<IPublishedModal> = (props) => {
  const { open, handleClose } = props;
  const router = useRouter();
  const { t } = useTranslation('page-Creation');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { post, videoProcessing, fileProcessing, postData } = useAppSelector(
    (state) => state.creation
  );

  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  const preventClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const socialButtons = useMemo(
    () => [
      // {
      //   key: 'twitter',
      // },
      // {
      //   key: 'facebook',
      // },
      // {
      //   key: 'instagram',
      // },
      // {
      //   key: 'tiktok',
      // },
      {
        key: 'copy',
      },
    ],
    []
  );

  const postTypeText = useCallback(() => {
    if (postData) {
      if (postData.auction) return 'Bid';
      if (postData.crowdfunding) return 'Goal';
      return 'Superpoll';
    }
    return 'Bid';
  }, [postData]);

  async function copyPostUrlToClipboard(url: string) {
    Mixpanel.track('Copy Post Url to Clipboard', {
      _stage: 'Creation',
      _url: url,
    });
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  interface IItemButtonAttrs extends NamedNodeMap {
    type?: {
      value: string;
    };
  }

  const socialBtnClickHandler = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const attr: IItemButtonAttrs = (e.target as HTMLDivElement).attributes;
      const val = attr.type?.value;
      if (val === 'copy' && postData) {
        let url;
        if (window) {
          url = `${window.location.origin}/post/`;
          if (url) {
            if (postData.auction) {
              url += postData.auction.postUuid;
            }
            if (postData.crowdfunding) {
              url += postData.crowdfunding.postUuid;
            }
            if (postData.multipleChoice) {
              url += postData.multipleChoice.postUuid;
            }

            copyPostUrlToClipboard(url)
              .then(() => {
                setIsCopiedUrl(true);
                setTimeout(() => {
                  setIsCopiedUrl(false);
                }, 1500);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      }
    },
    [postData]
  );

  const handleViewMyPost = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (postData) {
        Mixpanel.track('See My Post Click');
        let url;
        if (window) {
          url = `${window.location.origin}/post/`;
          if (url) {
            if (postData.auction) {
              url += postData.auction.postUuid;
            }
            if (postData.crowdfunding) {
              url += postData.crowdfunding.postUuid;
            }
            if (postData.multipleChoice) {
              url += postData.multipleChoice.postUuid;
            }

            router.push(url).then(() => {
              dispatch(clearCreation({}));
            });
          }
        }
      }
    },
    [postData, router, dispatch]
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
    }

    return dateValue;
  }, [post.expiresAt]);

  const renderItem = (item: any) => (
    <SItem key={item.key} type={item.key}>
      <SItemButton type={item.key} onClick={socialBtnClickHandler}>
        <InlineSVG
          svg={SOCIAL_ICONS[item.key] as string}
          width='25px'
          height='25px'
        />
      </SItemButton>
      <SItemTitle
        variant={3}
        weight={600}
        type={item.key}
        onClick={socialBtnClickHandler as any}
      >
        {item.key === 'copy' && isCopiedUrl
          ? t(`published.socials.copied`)
          : t(`published.socials.${item.key}`)}
      </SItemTitle>
    </SItem>
  );

  return (
    <Modal show={open} onClose={handleClose}>
      <SMobileContainer onClick={preventClick}>
        <SContent>
          <SPlayerWrapper>
            {open ? (
              fileProcessing.progress === 100 ? (
                <BitmovinPlayer
                  id='published-modal'
                  muted={false}
                  resources={videoProcessing?.targetUrls}
                  thumbnails={post.thumbnailParameters}
                  borderRadius='16px'
                  showPlayButton
                />
              ) : (
                <SText variant={2}>{t('videoBeingProcessedCaption')}</SText>
              )
            ) : null}
          </SPlayerWrapper>
          <SUserBlock>
            <SUserAvatar avatarUrl={user.userData?.avatarUrl} />
            <SUserTitle variant={3} weight={600}>
              {user.userData?.nickname && user.userData?.nickname?.length > 8
                ? `${user.userData?.nickname?.substring(0, 8)}...`
                : user.userData?.nickname}
            </SUserTitle>
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
          <SSocials>{socialButtons.map(renderItem)}</SSocials>
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

const SSocials = styled.div`
  /* gap: 24px; */
  width: 100%;
  display: flex;
  margin-top: 16px;
  /* align-items: center; */
  flex-direction: row;
  justify-content: center;
`;

const SItem = styled.div<{
  type: string;
}>`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

interface ISItemButton {
  type: 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'copy';
}

const SItemButton = styled.div<ISItemButton>`
  cursor: pointer;
  width: 224px;
  height: 48px;
  display: flex;
  overflow: hidden;
  align-items: center;
  border-radius: 16px;
  justify-content: center;
  background: ${(props) => props.theme.colorsThemed.social[props.type].main};
`;

const SItemTitle = styled(Caption)<{
  type: string;
}>`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 6px;
  cursor: pointer;
`;

const SButtonWrapper = styled.div`
  cursor: pointer;
  display: flex;
  padding: 16px 0;
  margin-top: 24px;
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
  margin: 16px auto 0 auto;
  display: grid;
  align-items: center;
  flex-direction: row;

  grid-template-columns: 36px 1fr 1fr;
`;

const SUserAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
`;

const SUserTitle = styled(Text)`
  max-width: 188px;
  display: -webkit-box;
  overflow: hidden;
  position: relative;
  padding-left: 12px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
`;

const SCaption = styled(Caption)`
  margin-left: 4px;
  justify-self: flex-end;
  line-break: strict;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;
