/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

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
  const { t } = useTranslation('creation');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { post, videoProcessing, fileProcessing, postData } = useAppSelector(
    (state) => state.creation
  );

  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  const preventCLick = (e: any) => {
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

  async function copyPostUrlToClipboard(url: string) {
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

            router.push(url);

            dispatch(clearCreation({}));
          }
        }
      }
    },
    [postData, router, dispatch]
  );

  const renderItem = (item: any) => (
    <SItem key={item.key}>
      <SItemButton type={item.key} onClick={socialBtnClickHandler}>
        <InlineSVG
          svg={SOCIAL_ICONS[item.key] as string}
          width='25px'
          height='25px'
        />
      </SItemButton>
      <SItemTitle variant={3} weight={600}>
        {item.key === 'copy' && isCopiedUrl
          ? t(`published.socials.copied`)
          : t(`published.socials.${item.key}`)}
      </SItemTitle>
    </SItem>
  );

  return (
    <Modal show={open} onClose={handleClose}>
      <SMobileContainer onClick={preventCLick}>
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
                />
              ) : (
                <SText variant={2}>{t('video-being-processed-caption')}</SText>
              )
            ) : null}
          </SPlayerWrapper>
          <SUserBlock>
            <SUserAvatar avatarUrl={user.userData?.avatarUrl} />
            <SUserTitle variant={3} weight={600}>
              {user.userData?.nickname}
            </SUserTitle>
            <SPostTitleText variant={3} weight={600}>
              {post?.title}
            </SPostTitleText>
          </SUserBlock>
          <STitle variant={6}>
            {t(
              `published.texts.title-${
                post.startsAt.type === 'right-away' ? 'published' : 'scheduled'
              }`
            )}
          </STitle>
          <SSocials>{socialButtons.map(renderItem)}</SSocials>
          <SButtonWrapper onClick={handleViewMyPost}>
            <SButtonTitle>
              {t(
                `published.button.submit-${
                  post.startsAt.type === 'right-away'
                    ? 'published'
                    : 'scheduled'
                }`,
                {
                  value: postData!!.auction
                    ? 'Event'
                    : postData!!.crowdfunding
                    ? 'Goal'
                    : 'Superpoll',
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

const SItem = styled.div`
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

const SItemTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 6px;
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
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
`;

const SUserAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
`;

const SUserTitle = styled(Text)`
  width: 188px;
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
  width: 100%;
`;
