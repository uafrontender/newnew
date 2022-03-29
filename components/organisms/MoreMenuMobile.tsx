import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';

import Text from '../atoms/Text';
import InlineSvg from '../atoms/InlineSVG';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import ChatIconFilled from '../../public/images/svg/icons/filled/Chat.svg';
import ChatIconOutlined from '../../public/images/svg/icons/outlined/Comments.svg';

interface IMoreMenuMobile {
  isVisible: boolean;
  handleClose: () => void;
}

const MoreMenuMobile: React.FC<IMoreMenuMobile> = ({
  isVisible,
  handleClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>();
  const router = useRouter();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const handleClick = (url: string) => {
    router.push(`/${url}`);
  };

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
          <SButton onClick={() => router.route.includes('direct-messages') ? handleClose() : handleClick('/direct-messages')}>
            <InlineSvg
              svg={router.route.includes('direct-messages') ? ChatIconFilled : ChatIconOutlined}
              fill={router.route.includes('direct-messages') ? theme.colorsThemed.accent.blue : theme.colorsThemed.text.tertiary}
              width="24px"
              height="24px"
            />
            <Text variant={2}>{t('mobile-bottom-navigation-dms')}</Text>
          </SButton>
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default MoreMenuMobile;

const SContainer = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  z-index: 10;
  right: 0px;
  width: 164px;
  box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.25);

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.tertiary};

  ${({ theme }) => theme.media.laptop} {
    right: 16px;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;
  text-align: left;
  width: 100%;
  cursor: pointer;
  padding: 8px;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;

  &:focus {
    outline: none;
  }
  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
`;
