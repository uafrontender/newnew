/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import InlineSVG, { InlineSvg } from '../../atoms/InlineSVG';
import Headline from '../../atoms/Headline';

import copyIcon from '../../../public/images/svg/icons/outlined/Link.svg';
import tiktokIcon from '../../../public/images/svg/icons/socials/TikTok.svg';
import twitterIcon from '../../../public/images/svg/icons/socials/Twitter.svg';
import facebookIcon from '../../../public/images/svg/icons/socials/Facebook.svg';
import instagramIcon from '../../../public/images/svg/icons/socials/Instagram.svg';
import Caption from '../../atoms/Caption';
import Button from '../../atoms/Button';

const SOCIAL_ICONS: any = {
  copy: copyIcon,
  tiktok: tiktokIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
};

interface IPostShareModal {
  isOpen: boolean;
  zIndex: number;
  postId: string;
  onClose: () => void;
}

const PostShareModal: React.FunctionComponent<IPostShareModal> = ({
  isOpen,
  zIndex,
  postId,
  onClose,
}) => {
  const { t } = useTranslation('decision');

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
      const url = `${window.location.origin}/post/${postId}`;

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
  }, [postId, onClose]);

  return (
    <Modal show={isOpen} overlayDim additionalZ={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Headline variant={6}>{t('socials.share-to')}</Headline>
          <SSocialsSection>
            {/* <SSocials>
              {socialButtons.map(renderItem)}
            </SSocials> */}
            <SItem>
              <SItemButtonWide type='copy' onClick={() => handlerCopy()}>
                <InlineSvg
                  svg={SOCIAL_ICONS.copy as string}
                  width='24px'
                  height='24px'
                />
                {isCopiedUrl ? t('socials.copied') : t('socials.copy')}
              </SItemButtonWide>
            </SItem>
          </SSocialsSection>
        </SContentContainer>
        <Button
          view='secondary'
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
          onClick={onClose}
        >
          {t('Cancel')}
        </Button>
      </SWrapper>
    </Modal>
  );
};

export default PostShareModal;

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

  padding: 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SSocialsSection = styled.div`
  padding: 16px;
`;

const SSocials = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
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

const SItemButton = styled.div<ISItemButton>`
  width: 48px;
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
