/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import { Mixpanel } from '../../../../utils/mixpanel';

import Headline from '../../../atoms/Headline';
import { InlineSvg } from '../../../atoms/InlineSVG';
import EllipseModal from '../../../atoms/EllipseModal';

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

interface IPostShareEllipseModal {
  isOpen: boolean;
  zIndex: number;
  postUuid: string;
  postShortId: string;
  onClose: () => void;
}

const PostShareEllipseModal: React.FunctionComponent<IPostShareEllipseModal> =
  React.memo(({ isOpen, zIndex, postUuid, postShortId, onClose }) => {
    const { t } = useTranslation('common');

    // const socialButtons = useMemo(() => [
    //   {
    //     key: 'twitter',
    //   },
    //   {
    //     key: 'facebook',
    //   },
    //   {
    //     key: 'instagram',
    //   },
    //   {
    //     key: 'tiktok',
    //   },
    //   {
    //     key: 'copy',
    //   },
    // ], []);
    // const renderItem = (item: any) => (
    //   <SItem key={item.key}>
    //     <SItemButton type={item.key}>
    //       <InlineSVG
    //         svg={SOCIAL_ICONS[item.key] as string}
    //         width="50%"
    //         height="50%"
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
        const url = `${window.location.origin}/p/${postShortId ?? postUuid}`;
        Mixpanel.track('Copied Link Post', {
          _stage: 'Post',
          _postUuid: postUuid,
        });
        copyPostUrlToClipboard(url)
          .then(() => {
            setIsCopiedUrl(true);
            setTimeout(() => {
              setIsCopiedUrl(false);
              onClose();
            }, 1000);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, [postShortId, postUuid, onClose]);

    return (
      <EllipseModal show={isOpen} zIndex={zIndex} onClose={onClose}>
        <ButtonsSection>
          <Headline variant={6}>{t('shareTo')}</Headline>
          <SSocialsSection>
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
          </SSocialsSection>
        </ButtonsSection>
      </EllipseModal>
    );
  });

export default PostShareEllipseModal;

const ButtonsSection = styled.div`
  padding: 16px;
`;

const SSocialsSection = styled.div`
  padding: 16px;
`;

const SItem = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

interface ISItemButton {
  type: 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'copy';
}

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
