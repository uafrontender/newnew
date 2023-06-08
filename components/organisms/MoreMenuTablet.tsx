import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Link from 'next/link';

import Text from '../atoms/Text';
import InlineSvg from '../atoms/InlineSVG';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import { useAppSelector } from '../../redux-store/store';
import copyIcon from '../../public/images/svg/icons/outlined/Link.svg';
import { Mixpanel } from '../../utils/mixpanel';
import { useAppState } from '../../contexts/appStateContext';

interface IMoreMenuTablet {
  isVisible: boolean;
  handleClose: () => void;
}

const MoreMenuTablet: React.FC<IMoreMenuTablet> = ({
  isVisible,
  handleClose,
}) => {
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>();

  const user = useAppSelector((state) => state.user);
  const { userIsCreator } = useAppState();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  const copyPostUrlToClipboard = useCallback(async (url: string) => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }, []);

  const handlerCopy = useCallback(() => {
    if (window) {
      const url = `${window.location.origin}/${user.userData?.username}`;

      Mixpanel.track('Copy My Link', {
        _component: 'MoreMenuTablet',
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
  }, [user.userData?.username, copyPostUrlToClipboard]);

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
          <Link href={userIsCreator ? '/profile/my-posts' : '/profile'}>
            <SLink>
              <SButton
                onClick={() => {
                  Mixpanel.track('My Avatar Clicked', {
                    _component: 'MoreMenuTablet',
                    _target: userIsCreator ? '/profile/my-posts' : '/profile',
                  });
                }}
              >
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
          {user.userData?.options?.isOfferingBundles && (
            <SMyLinkButton onClick={handlerCopy}>
              <InlineSvg svg={copyIcon} width='24px' height='24px' />
              {isCopiedUrl ? t('myLink.copied') : t('myLink.copy')}
            </SMyLinkButton>
          )}
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
