/* eslint-disable no-unused-expressions */
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';

import Text from '../atoms/Text';
import InlineSvg from '../atoms/InlineSVG';
import Indicator from '../atoms/Indicator';

import { useGetChats } from '../../contexts/chatContext';
import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import ChatIconFilled from '../../public/images/svg/icons/filled/Chat.svg';
import ShareIcon from '../../public/images/svg/icons/filled/Share.svg';
import notificationsIconFilled from '../../public/images/svg/icons/filled/Notifications.svg';
import ShareMenu from './ShareMenu';
import { useAppSelector } from '../../redux-store/store';
import { useBundles } from '../../contexts/bundlesContext';

interface IMoreMenuMobile {
  isVisible: boolean;
  handleClose: () => void;
}

const MoreMenuMobile: React.FC<IMoreMenuMobile> = ({
  isVisible,
  handleClose,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('common');
  const user = useAppSelector((state) => state.user);
  const containerRef = useRef<HTMLDivElement>();
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const { bundles, directMessagesAvailable } = useBundles();

  const handleShareMenuClick = () => setShareMenuOpen(!shareMenuOpen);
  const { unreadCount } = useGetChats();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const handleClick = (url: string) => {
    router.push(`/${url}`);
  };

  const handleCloseShareMenu = () => {
    setShareMenuOpen(false);
    handleClose();
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
          {!shareMenuOpen ? (
            <>
              {(user.userData?.options?.isCreator ||
                (bundles && bundles?.length > 0)) && (
                <SButton
                  onClick={() =>
                    router.route.includes('direct-messages')
                      ? handleClose()
                      : handleClick('direct-messages')
                  }
                >
                  {unreadCount && unreadCount > 0 ? (
                    <Indicator counter={unreadCount} animate={false} />
                  ) : null}
                  <SText
                    variant={2}
                    active={router.route.includes('direct-messages')}
                  >
                    {t('mobileBottomNavigation.dms')}
                  </SText>
                  <InlineSvg
                    svg={ChatIconFilled}
                    fill={
                      router.route.includes('direct-messages')
                        ? theme.colorsThemed.accent.blue
                        : theme.colorsThemed.text.tertiary
                    }
                    width='24px'
                    height='24px'
                  />
                </SButton>
              )}
              <SButton onClick={handleShareMenuClick}>
                <SText variant={2} active={router.route.includes('share')}>
                  {t('mobileBottomNavigation.share')}
                </SText>
                <InlineSvg
                  svg={ShareIcon}
                  fill={
                    router.route.includes('share')
                      ? theme.colorsThemed.accent.blue
                      : theme.colorsThemed.text.tertiary
                  }
                  width='24px'
                  height='24px'
                />
              </SButton>
              {/* If there are bundles, notifications are moved to more menu */}
              {/* TODO: Refactor the menu to make it work with the collection, auto split navigation items */}
              {directMessagesAvailable && (
                <SButton
                  onClick={() =>
                    router.route.includes('direct-messages')
                      ? handleClose()
                      : handleClick('notifications')
                  }
                >
                  <SText
                    variant={2}
                    active={router.route.includes('notifications')}
                  >
                    {t('mobileBottomNavigation.notifications')}
                  </SText>
                  <InlineSvg
                    svg={notificationsIconFilled}
                    fill={
                      router.route.includes('notifications')
                        ? theme.colorsThemed.accent.blue
                        : theme.colorsThemed.text.tertiary
                    }
                    width='24px'
                    height='24px'
                  />
                </SButton>
              )}
            </>
          ) : (
            <ShareMenu
              isVisible={shareMenuOpen}
              handleClose={handleCloseShareMenu}
            />
          )}
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default MoreMenuMobile;

const SContainer = styled(motion.div)`
  position: absolute;
  bottom: calc(100% + 10px);
  z-index: 10;
  right: 16px;
  min-width: 114px;
  box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.25);

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.primary};

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
  justify-content: flex-end;
  align-items: center;
  gap: 8px;

  &:focus {
    outline: none;
  }
  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
`;

const SText = styled(Text)<{
  active: boolean;
}>`
  color: ${({ theme, active }) =>
    active
      ? theme.colorsThemed.text.primary
      : theme.colorsThemed.text.tertiary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
