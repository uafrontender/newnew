import React, { useCallback, useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FacebookShareButton, TwitterShareButton } from 'react-share';

import { Mixpanel } from '../../utils/mixpanel';
import InlineSvg from './InlineSVG';
import Caption from './Caption';

import copyIcon from '../../public/images/svg/icons/outlined/Link.svg';
import tiktokIcon from '../../public/images/svg/icons/socials/TikTok.svg';
import twitterIcon from '../../public/images/svg/icons/socials/Twitter.svg';
import facebookIcon from '../../public/images/svg/icons/socials/Facebook.svg';
import instagramIcon from '../../public/images/svg/icons/socials/Instagram.svg';

const SOCIAL_ICONS = {
  copy: copyIcon,
  tiktok: tiktokIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
};

interface ISharePanel {
  linkToShare: string;
  className?: string;
  iconsSize?: 's' | 'm';
  onCopyLink?: () => void;
}

const SharePanel: React.FunctionComponent<ISharePanel> = ({
  className,
  linkToShare,
  iconsSize,
  onCopyLink,
}) => {
  const { t } = useTranslation('common');

  const [isCopiedUrl, setIsCopiedUrl] = useState(false);
  const onCopyLinkTimerRef = useRef<NodeJS.Timeout | undefined>();

  // Cleanup on unrender
  useEffect(
    () => () => {
      if (onCopyLinkTimerRef.current) {
        clearTimeout(onCopyLinkTimerRef.current);
      }
    },
    []
  );

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handlerCopy = useCallback(() => {
    if (window) {
      Mixpanel.track('Copy Link', {
        _stage: 'SharePanel',
        _sharedUrl: linkToShare,
      });
      copyPostUrlToClipboard(linkToShare)
        .then(() => {
          setIsCopiedUrl(true);
          onCopyLinkTimerRef.current = setTimeout(() => {
            setIsCopiedUrl(false);
            onCopyLink?.();
          }, 1000);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [linkToShare, onCopyLink]);

  const trackShareClicked = useCallback(
    (socialProvider: string) => {
      if (window) {
        Mixpanel.track(`Share to ${socialProvider} Clicked`, {
          _stage: 'SharePanel',
          _sharedUrl: linkToShare,
        });
      }
    },
    [linkToShare]
  );

  return (
    <SWrapper className={className}>
      <SItem key='facebook' itemType='facebook' iconsSize={iconsSize}>
        <FacebookShareButton
          url={linkToShare}
          className='overridenReactShareButton'
          resetButtonStyle={false}
          onClickCapture={() => trackShareClicked('Facebook')}
        >
          <InlineSvg
            svg={SOCIAL_ICONS.facebook as string}
            width='50%'
            height='50%'
          />
        </FacebookShareButton>
        <SItemTitle variant={3} weight={600}>
          {t(`socials.facebook`)}
        </SItemTitle>
      </SItem>
      <SItem key='twitter' iconsSize={iconsSize} itemType='twitter'>
        <TwitterShareButton
          url={linkToShare}
          className='overridenReactShareButton'
          resetButtonStyle={false}
          onClickCapture={() => trackShareClicked('Twitter')}
        >
          <InlineSvg
            svg={SOCIAL_ICONS.twitter as string}
            width='50%'
            height='50%'
          />
        </TwitterShareButton>
        <SItemTitle variant={3} weight={600}>
          {t(`socials.twitter`)}
        </SItemTitle>
      </SItem>
      <SItem key='copy' itemType='copy' iconsSize={iconsSize}>
        <SItemButton type='copy' iconsSize={iconsSize} onClick={handlerCopy}>
          <InlineSvg
            svg={SOCIAL_ICONS.copy as string}
            width='50%'
            height='50%'
          />
        </SItemButton>
        <SItemTitle variant={3} weight={600}>
          {isCopiedUrl ? t(`socials.copied`) : t(`socials.copy`)}
        </SItemTitle>
      </SItem>
    </SWrapper>
  );
};

export default SharePanel;

const SWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const SItem = styled.div<{
  itemType: ISItemButton['type'];
  iconsSize?: 's' | 'm';
}>`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;

  .overridenReactShareButton {
    width: ${({ iconsSize }) => (iconsSize === 's' ? '36px' : '48px')};
    height: ${({ iconsSize }) => (iconsSize === 's' ? '36px' : '48px')};
    display: flex;
    overflow: hidden;
    align-items: center;
    border-radius: ${({ iconsSize }) => (iconsSize === 's' ? '12px' : '16px')};
    border: none;
    justify-content: center;
    background: ${(props) =>
      props.theme.colorsThemed.social[props.itemType].main};

    cursor: pointer;
  }
`;

interface ISItemButton {
  type: 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'copy';
  iconsSize?: 's' | 'm';
}

const SItemButton = styled.div<ISItemButton>`
  width: ${({ iconsSize }) => (iconsSize === 's' ? '36px' : '48px')};
  height: ${({ iconsSize }) => (iconsSize === 's' ? '36px' : '48px')};
  display: flex;
  overflow: hidden;
  align-items: center;
  border-radius: ${({ iconsSize }) => (iconsSize === 's' ? '12px' : '16px')};
  justify-content: center;
  background: ${(props) => props.theme.colorsThemed.social[props.type].main};

  cursor: pointer;
`;

const SItemTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 6px;
  white-space: pre;
  min-width: 56px;
  text-align: center;
`;

// Might be useful if one of the older designs gets re-established
// const SItemButtonWide = styled.div<ISItemButton>`
//   width: 100%;
//   height: 36px;
//   display: flex;
//   overflow: hidden;
//   align-items: center;
//   justify-content: center;
//   gap: 4px;
//   border-radius: 12px;
//   background: ${(props) => props.theme.colorsThemed.social[props.type].main};

//   font-weight: bold;
//   font-size: 14px;
//   line-height: 24px;

//   color: #ffffff;
//   cursor: pointer;
// `;
