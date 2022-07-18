import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Link from 'next/link';

import Text from '../atoms/Text';
import InlineSvg from '../atoms/InlineSVG';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

// import WalletIconFilled from '../../public/images/svg/icons/filled/Wallet.svg';
// import WalletIconOutlined from '../../public/images/svg/icons/outlined/Wallet.svg';
import { useAppSelector } from '../../redux-store/store';
// import { WalletContext } from '../../contexts/walletContext';
// import { formatNumber } from '../../utils/format';
import copyIcon from '../../public/images/svg/icons/outlined/Link.svg';

interface IMoreMenuTablet {
  isVisible: boolean;
  handleClose: () => void;
}

const MoreMenuTablet: React.FC<IMoreMenuTablet> = ({
  isVisible,
  handleClose,
}) => {
  // const theme = useTheme();
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>();

  const user = useAppSelector((state) => state.user);
  // const { walletBalance, isBalanceLoading } = useContext(WalletContext);

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

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
      const url = `${window.location.origin}/${user.userData?.username}`;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <Link
            href={
              user.userData?.options?.isCreator
                ? '/profile/my-posts'
                : '/profile'
            }
          >
            <SLink>
              <SButton>
                <SAvatar>
                  <img
                    src={user?.userData?.avatarUrl ?? ''}
                    alt={user?.userData?.username ?? ''}
                    draggable={false}
                  />
                </SAvatar>
                <Text variant={2}>{t('mobileTopNavigation.profile')}</Text>
              </SButton>
            </SLink>
          </Link>
          {user.userData?.options?.isOfferingSubscription && (
            <SMyLinkButton onClick={handlerCopy}>
              <InlineSvg svg={copyIcon} width='24px' height='24px' />
              {isCopiedUrl ? t('myLink.copied') : t('myLink.copy')}
            </SMyLinkButton>
          )}
          {/* <SButton
            onClick={() =>
              router.route.includes('/profile/settings')
                ? handleClose()
                : handleClick('/profile/settings')
            }
          >
            <InlineSvg
              svg={
                router.route.includes('profile/settings')
                  ? WalletIconFilled
                  : WalletIconOutlined
              }
              fill={
                router.route.includes('profile/settings')
                  ? theme.colorsThemed.accent.blue
                  : theme.colorsThemed.text.tertiary
              }
              width='24px'
              height='24px'
            />
            <Text variant={2}>
              {!isBalanceLoading && walletBalance && walletBalance?.usdCents > 0
                ? t('mobileTopNavigation.myBalance', {
                    value: formatNumber(
                      Math.floor(walletBalance.usdCents / 100),
                      true
                    ),
                  })
                : t('mobileTopNavigation.myBalance')}
            </Text>
          </SButton> */}
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
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.laptop} {
    right: 16px;
  }
`;

const SLink = styled.a`
  width: 100%;
  display: block;
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

const SMyLinkButton = styled.div`
  margin-top: 8px;
  width: 100%;
  height: 36px;
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 12px;
  background: ${(props) => props.theme.colorsThemed.social.copy.main};

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;

  color: #ffffff;
  cursor: pointer;
`;
