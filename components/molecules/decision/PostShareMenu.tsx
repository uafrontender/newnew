import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';

import InlineSvg from '../../atoms/InlineSVG';

import copyIcon from '../../../public/images/svg/icons/outlined/Link.svg';
import tiktokIcon from '../../../public/images/svg/icons/socials/TikTok.svg';
import twitterIcon from '../../../public/images/svg/icons/socials/Twitter.svg';
import facebookIcon from '../../../public/images/svg/icons/socials/Facebook.svg';
import instagramIcon from '../../../public/images/svg/icons/socials/Instagram.svg';
import Caption from '../../atoms/Caption';

const SOCIAL_ICONS: any = {
  copy: copyIcon,
  tiktok: tiktokIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
};

interface IPostShareMenu {
  isVisible: boolean;
  handleClose: () => void;
}

const PostShareMenu: React.FunctionComponent<IPostShareMenu> = ({
  isVisible,
  handleClose,
}) => {
  const { t } = useTranslation('decision');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

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
  ], []);
  const renderItem = (item: any) => (
    <SItem key={item.key}>
      <SItemButton type={item.key}>
        <InlineSvg
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
    <AnimatePresence>
      {isVisible && (
        <SContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SSocials>
            {socialButtons.map(renderItem)}
          </SSocials>
          <SSeparator />
          <SItem>
            <SItemButtonWide type="copy">
              <InlineSvg
                svg={SOCIAL_ICONS.copy as string}
                width="24px"
                height="24px"
              />
              {t('socials.copy')}
            </SItemButtonWide>
          </SItem>
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default PostShareMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: calc(100% - 10px);
  z-index: 10;
  right: 48px;
  max-width: 260px;

  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.laptop} {
    right: 48px;
  }
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
  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  margin-top: 16px;
  margin-bottom: 16px;
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

  color: #FFFFFF;
`;
