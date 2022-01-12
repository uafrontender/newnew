import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import InlineSVG from '../../atoms/InlineSVG';
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
  onClose: () => void;
}

const PostShareModal: React.FunctionComponent<IPostShareModal> = ({
  isOpen,
  zIndex,
  onClose,
}) => {
  const { t } = useTranslation('decision');

  const socialButtons = useMemo(() => [
    {
      key: 'twitter',
    },
    {
      key: 'facebook',
    },
    {
      key: 'instagram',
    },
    {
      key: 'tiktok',
    },
    {
      key: 'copy',
    },
  ], []);
  const renderItem = (item: any) => (
    <SItem key={item.key}>
      <SItemButton type={item.key}>
        <InlineSVG
          svg={SOCIAL_ICONS[item.key] as string}
          width="50%"
          height="50%"
        />
      </SItemButton>
      <SItemTitle variant={3} weight={600}>
        {t(`socials.${item.key}`)}
      </SItemTitle>
    </SItem>
  );

  return (
    <Modal
      show={isOpen}
      overlayDim
      additionalZ={zIndex}
      onClose={onClose}
    >
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Headline
            variant={6}
          >
            {t('socials.share-to')}
          </Headline>
          <SSocialsSection>
            <SSocials>
              {socialButtons.map(renderItem)}
            </SSocials>
          </SSocialsSection>
        </SContentContainer>
        <Button
          view="secondary"
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
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
