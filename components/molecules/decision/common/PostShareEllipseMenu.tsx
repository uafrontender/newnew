/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';

import isBrowser from '../../../../utils/isBrowser';
import { Mixpanel } from '../../../../utils/mixpanel';

import Caption from '../../../atoms/Caption';
import InlineSvg from '../../../atoms/InlineSVG';
import EllipseMenu from '../../../atoms/EllipseMenu';

import copyIcon from '../../../../public/images/svg/icons/outlined/Link.svg';
import tiktokIcon from '../../../../public/images/svg/icons/socials/TikTok.svg';
import twitterIcon from '../../../../public/images/svg/icons/socials/Twitter.svg';
import facebookIcon from '../../../../public/images/svg/icons/socials/Facebook.svg';
import instagramIcon from '../../../../public/images/svg/icons/socials/Instagram.svg';

const SOCIAL_ICONS: any = {
  copy: copyIcon,
  tiktok: tiktokIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
};

interface IPostShareEllipseMenu {
  postUuid: string;
  postShortId: string;
  isVisible: boolean;
  onClose: () => void;
  anchorElement?: HTMLElement;
}

const PostShareEllipseMenu: React.FunctionComponent<IPostShareEllipseMenu> =
  React.memo(({ postUuid, postShortId, isVisible, onClose, anchorElement }) => {
    const { t } = useTranslation('common');

    // const socialButtons = useMemo(
    //   () => [
    //     {
    //       key: 'twitter',
    //     },
    //     {
    //       key: 'facebook',
    //     },
    //     {
    //       key: 'instagram',
    //     },
    //     {
    //       key: 'tiktok',
    //     },
    //   ],
    //   []
    // );
    // const renderItem = (item: any) => (
    //   <SItem key={item.key}>
    //     <SItemButton type={item.key}>
    //       <InlineSvg
    //         svg={SOCIAL_ICONS[item.key] as string}
    //         width='50%'
    //         height='50%'
    //       />
    //     </SItemButton>
    //     <SItemTitle variant={3} weight={600}>
    //       {t(`socials.${item.key}`)}
    //     </SItemTitle>
    //   </SItem>
    // );

    const [isCopiedUrl, setIsCopiedUrl] = useState(false);

    async function copyPostUrlToClipboard(url: string) {
      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(url);
      } else {
        document.execCommand('copy', true, url);
      }
    }

    const handlerCopy = useCallback(() => {
      if (window) {
        const url = `${window.location.origin}/p/${postShortId || postUuid}`;
        Mixpanel.track('Copy Link Post', {
          _stage: 'Post',
          _postUuid: postUuid,
        });
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
    }, [postShortId, postUuid]);

    return (
      <SEllipseMenu
        isOpen={isVisible}
        onClose={onClose}
        anchorElement={anchorElement}
      >
        {/* <SSocials>
            {socialButtons.map(renderItem)}
          </SSocials> */}
        {/* <SSeparator /> */}
        <SItem>
          <SItemButtonWide
            type='copy'
            onClick={(e) => {
              e.stopPropagation();
              handlerCopy();
            }}
          >
            <InlineSvg
              svg={SOCIAL_ICONS.copy as string}
              width='24px'
              height='24px'
            />
            {isCopiedUrl ? t('ellipse.linkCopied') : t('ellipse.copyLink')}
          </SItemButtonWide>
        </SItem>
      </SEllipseMenu>
    );
  });

export default PostShareEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  position: fixed;
  width: 260px;

  ${({ theme }) =>
    theme.name === 'light' &&
    css`
      box-shadow: 0px 0px 35px 0px rgba(0, 0, 0, 0.25);
    `}
`;

const SSocials = styled.div`
  gap: 24px;
  display: flex;
  margin-top: 16px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const SSeparator = styled.div`
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
  margin-top: 16px;
  margin-bottom: 16px;
`;

const SItem = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

interface ISItemButton {
  type: 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'copy';
}

const SItemButton = styled.div<ISItemButton>`
  width: 36px;
  height: 36px;
  display: flex;
  overflow: hidden;
  align-items: center;
  border-radius: 12px;
  justify-content: center;
  background: ${(props) => props.theme.colorsThemed.social[props.type].main};
`;

const SItemTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 6px;
`;

const SItemButtonWide = styled.div<ISItemButton>`
  width: 100%;
  height: 36px;
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 12px;
  background: ${(props) => props.theme.colorsThemed.social[props.type].main};

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;

  color: #ffffff;
  cursor: pointer;
`;
