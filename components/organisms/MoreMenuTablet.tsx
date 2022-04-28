import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';

import Text from '../atoms/Text';
import InlineSvg from '../atoms/InlineSVG';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import WalletIconFilled from '../../public/images/svg/icons/filled/Wallet.svg';
import WalletIconOutlined from '../../public/images/svg/icons/outlined/Wallet.svg';
import { useAppSelector } from '../../redux-store/store';
import { WalletContext } from '../../contexts/walletContext';
import { formatNumber } from '../../utils/format';

interface IMoreMenuTablet {
  isVisible: boolean;
  handleClose: () => void;
}

const MoreMenuTablet: React.FC<IMoreMenuTablet> = ({
  isVisible,
  handleClose,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>();

  const user = useAppSelector((state) => state.user);
  const { walletBalance, isBalanceLoading } = useContext(WalletContext);


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
          <SButton
            onClick={() => router.route === '/profile'
              ? handleClose()
              : handleClick(user.userData?.options?.isCreator ? '/profile/my-posts' : '/profile')
            }
          >
            <SAvatar>
              <img
                src={user?.userData?.avatarUrl!! as string}
                alt={user?.userData?.username!!}
                draggable={false}
              />
            </SAvatar>
            <Text variant={2}>
              {t('mobile-top-navigation-profile')}
            </Text>
          </SButton>
          <SButton onClick={() => router.route.includes('/profile/settings') ? handleClose() : handleClick('/profile/settings')}>
            <InlineSvg
              svg={router.route.includes('profile/settings') ? WalletIconFilled : WalletIconOutlined}
              fill={router.route.includes('profile/settings') ? theme.colorsThemed.accent.blue : theme.colorsThemed.text.tertiary}
              width="24px"
              height="24px"
            />
            <Text variant={2}>
            { !isBalanceLoading && walletBalance && walletBalance?.usdCents > 0
              ? t('mobile-top-navigation-my-balance', { value: formatNumber(Math.floor(walletBalance.usdCents / 100), true) })
              : t('mobile-top-navigation-my-balance')
            }
            </Text>
          </SButton>
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default MoreMenuTablet;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 100%;
  z-index: 10;
  right: 0px;
  width: 216px;
  box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.25);

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary};

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

  div {
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
  }

  &:focus {
    outline: none;
  }
  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  }
`;


const SAvatar = styled.div`
  overflow: hidden;
  border-radius: 50%;
  width: 24px;
  height: 24px;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  img {
    display: block;
    width: 24px;
    height: 24px;
  }
`;
