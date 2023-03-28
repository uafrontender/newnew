/* eslint-disable no-nested-ternary */
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import moment from 'moment';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import LoadingView from '../../../atoms/ScrollRestorationAnimationContainer';
import InlineSVG from '../../../atoms/InlineSVG';
import UserAvatar from '../../../molecules/UserAvatar';

import { I18nNamespaces } from '../../../../@types/i18next';
import { useAppSelector } from '../../../../redux-store/store';

import copyIcon from '../../../../public/images/svg/icons/outlined/Link.svg';
import tiktokIcon from '../../../../public/images/svg/icons/socials/TikTok.svg';
import twitterIcon from '../../../../public/images/svg/icons/socials/Twitter.svg';
import facebookIcon from '../../../../public/images/svg/icons/socials/Facebook.svg';
import instagramIcon from '../../../../public/images/svg/icons/socials/Instagram.svg';
import PostTitleContent from '../../../atoms/PostTitleContent';
import { useAppState } from '../../../../contexts/appStateContext';
import { usePostCreationState } from '../../../../contexts/postCreationContext';
import DisplayName from '../../../atoms/DisplayName';

const SOCIAL_ICONS: any = {
  copy: copyIcon,
  tiktok: tiktokIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
};

const VideojsPlayer = dynamic(() => import('../../../atoms/VideojsPlayer'), {
  ssr: false,
});

interface IPublishedContent {}

export const PublishedContent: React.FC<IPublishedContent> = () => {
  const { t } = useTranslation('page-Creation');
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();
  const { postInCreation, clearCreation } = usePostCreationState();
  const { post, videoProcessing, fileProcessing, postData } = useMemo(
    () => postInCreation,
    [postInCreation]
  );

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

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

  const socialBtnClickHandler = useCallback(
    (buttonType: string) => {
      const val = buttonType;
      if (val === 'copy' && postData) {
        let url;
        if (window) {
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
        let url;
        if (window) {
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

            router.push(url).then(() => {
              clearCreation();
            });
          }
        }
      }
    },
    [postData, router, clearCreation]
  );

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

  const renderItem = (item: any) => (
    <SItem key={item.key} type={item.key}>
      <SItemButton
        buttonType={item.key}
        onClick={() => socialBtnClickHandler(item.key)}
      >
        <InlineSVG
          svg={SOCIAL_ICONS[item.key] as string}
          width='25px'
          height='25px'
          onClick={() => {
            socialBtnClickHandler(item.key);
          }}
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
          : t(
              `published.socials.${
                item.key as keyof I18nNamespaces['page-Creation']['published']['socials']
              }`
            )}
      </SItemTitle>
    </SItem>
  );

  // Redirect if post state is empty
  useEffect(() => {
    if (!post.title) {
      router.push('/profile/my-posts');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!post.title) {
    return <LoadingView />;
  }

  return (
    <>
      <SContent>
        <SPlayerWrapper>
          {/* It seems like the video here is intentionally a 3-seconds one */}
          {fileProcessing.progress === 100 ? (
            <VideojsPlayer
              id='published'
              muted
              resources={videoProcessing?.targetUrls}
              showPlayButton
              withMuteControl
              borderRadius='16px'
            />
          ) : (
            <SText variant={2}>{t('videoBeingProcessedCaption')}</SText>
          )}
        </SPlayerWrapper>
        <SUserBlock>
          <SUserAvatar avatarUrl={user.userData?.avatarUrl} />
          <SUserTitleContainer>
            <SUserTitle variant={3} weight={600}>
              <DisplayName user={user.userData} />
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
          <PostTitleContent>{post.title}</PostTitleContent>
        </SPostTitleText>
        <STitle variant={6}>
          {t(
            `published.texts.title-${
              post.startsAt.type === 'right-away' ? 'published' : 'scheduled'
            }`
          )}
        </STitle>
        <SSocials>{socialButtons.map(renderItem)}</SSocials>
      </SContent>
      {isMobile && (
        <SButtonWrapper>
          <SButtonContent>
            {/* @ts-ignore */}
            <SButton view='primary' onClick={handleViewMyPost}>
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
            </SButton>
          </SButtonContent>
        </SButtonWrapper>
      )}
    </>
  );
};

export default PublishedContent;

const SContent = styled.div`
  display: flex;
  margin-top: 16px;
  flex-direction: column;
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;

  &:disabled {
    cursor: default;
    opacity: 1;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: ${(props) => props.theme.colorsThemed.button.disabled};
    }
  }
`;

const SButtonWrapper = styled.div`
  left: 0;
  width: 100%;
  bottom: 0;
  z-index: 5;
  display: flex;
  padding: 24px 16px;
  position: fixed;
  background: ${(props) => props.theme.gradients.creationSubmit};
`;

const SButtonContent = styled.div`
  width: 100%;
`;

const SPlayerWrapper = styled.div`
  width: 224px;
  height: 320px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  border-radius: 16px;
`;

const STitle = styled(Headline)`
  margin-top: 22px;
  text-align: center;
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
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

interface ISItemButton {
  buttonType: 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'copy';
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
  background: ${(props) =>
    props.theme.colorsThemed.social[props.buttonType].main};

  border: transparent;
  cursor: pointer;

  &:hover:enabled,
  &:focus:enabled {
    outline: none;
  }
`;

const SItemTitle = styled(Caption)<{
  type: string;
}>`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 6px;
  cursor: pointer;
`;

const SText = styled(Text)`
  margin-top: 45%;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  text-align: center;
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
