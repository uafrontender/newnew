import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { isString } from 'lodash';
import dynamic from 'next/dynamic';

import Button from '../../../atoms/Button';
import { Tab } from '../../Tabs';
import AnimatedPresence, { TAnimation } from '../../../atoms/AnimatedPresence';
import useOnClickEsc from '../../../../utils/hooks/useOnClickEsc';
import { setOverlay } from '../../../../redux-store/slices/uiStateSlice';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';

import chatIcon from '../../../../public/images/svg/icons/filled/Chat.svg';
import searchIcon from '../../../../public/images/svg/icons/outlined/Search.svg';
import NewMessageIcon from '../../../../public/images/svg/icons/filled/NewMessage.svg';
import notificationsIcon from '../../../../public/images/svg/icons/filled/Notifications.svg';
import { useGetChats } from '../../../../contexts/chatContext';
import { useNotifications } from '../../../../contexts/notificationsContext';
import { useGetSubscriptions } from '../../../../contexts/subscriptionsContext';

const NewMessageModal = dynamic(() => import('./NewMessageModal'));
const NotificationsList = dynamic(() => import('./NotificationsList'));
const ChatList = dynamic(() => import('./ChatList'));
const Chat = dynamic(() => import('./Chat'));
const InlineSVG = dynamic(() => import('../../../atoms/InlineSVG'));
const Indicator = dynamic(() => import('../../../atoms/Indicator'));
const Tabs = dynamic(() => import('../../Tabs'));

export const DynamicSection = () => {
  const theme = useTheme();
  const { t } = useTranslation('page-Creator');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const containerRef: any = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [animation, setAnimation] = useState('o-12');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const { unreadCountForCreator } = useGetChats();
  const { unreadNotificationCount } = useNotifications();
  const [markReadNotifications, setMarkReadNotifications] = useState(false);
  const { mySubscribersTotal } = useGetSubscriptions();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet', 'laptop', 'laptopM'].includes(resizeMode);

  const [showNewMessageModal, setShowNewMessageModal] =
    useState<boolean>(false);

  const closeNewMsgModal = () => {
    setShowNewMessageModal(false);
  };

  const isDesktop = !isMobile && !isTablet;
  const {
    query: { tab = isDesktop ? 'notifications' : '' },
  } = router;
  const tabs: Tab[] = useMemo(
    () => [
      {
        url: '/creator/dashboard?tab=notifications',
        counter: unreadNotificationCount,
        nameToken: 'notifications',
      },
      {
        url: '/creator/dashboard?tab=chat',
        counter: unreadCountForCreator,
        nameToken: 'chat',
      },
    ],
    [unreadCountForCreator, unreadNotificationCount]
  );

  const tabNotification: Tab[] = useMemo(
    () => [
      {
        url: '/creator/dashboard?tab=notifications',
        counter: unreadNotificationCount,
        nameToken: 'notifications',
      },
    ],
    [unreadNotificationCount]
  );
  const activeTabIndex = tabs.findIndex((el) => el.nameToken === tab);

  const handleChatClick = useCallback(() => {
    router.push('/creator/dashboard?tab=chat');
  }, [router]);
  const handleNotificationsClick = useCallback(() => {
    router.push('/creator/dashboard?tab=notifications');
  }, [router]);
  const handleMinimizeClick = useCallback(() => {
    router.push('/creator/dashboard');
  }, [router]);
  const handleAnimationEnd = useCallback(() => {
    setAnimate(false);
  }, []);
  const handleMarkAllAsRead = useCallback(() => {
    setMarkReadNotifications(true);
    setTimeout(() => {
      setMarkReadNotifications(false);
    }, 1500);
  }, []);
  const handleSearchClick = useCallback(() => {
    console.log('search');
  }, []);
  const handleBulkMessageClick = useCallback(() => {
    setShowNewMessageModal(true);
  }, []);

  useOnClickEsc(containerRef, () => {
    if (tab && !isDesktop) {
      handleMinimizeClick();
    }
  });
  useOnClickOutside(containerRef, () => {
    if (tab && !isDesktop) {
      handleMinimizeClick();
    }
  });
  useEffect(() => {
    dispatch(setOverlay(isDesktop ? false : !!tab));
    setAnimate(true);
    setAnimation(tab ? 'o-12' : 'o-12-reverse');
  }, [tab, dispatch, isDesktop]);

  return (
    <STopButtons>
      {!isDesktop && (
        <>
          <SButton view='secondary' onClick={handleNotificationsClick}>
            <SIconHolder>
              <SInlineSVG
                svg={notificationsIcon}
                fill={
                  theme.name === 'light'
                    ? theme.colors.black
                    : theme.colors.white
                }
                width='24px'
                height='24px'
              />
              {unreadNotificationCount > 0 && (
                <SIndicatorContainer>
                  <SIndicator minified />
                </SIndicatorContainer>
              )}
            </SIconHolder>
            {t('dashboard.button.notifications')}
          </SButton>
          {user.userData?.options?.isOfferingSubscription && (
            <SButton view='secondary' onClick={handleChatClick}>
              <SIconHolder>
                <SInlineSVG
                  svg={chatIcon}
                  fill={
                    theme.name === 'light'
                      ? theme.colors.black
                      : theme.colors.white
                  }
                  width='24px'
                  height='24px'
                />
                {unreadCountForCreator > 0 && (
                  <SIndicatorContainer>
                    <SIndicator minified />
                  </SIndicatorContainer>
                )}
              </SIconHolder>
              {t('dashboard.button.directMessages')}
            </SButton>
          )}
        </>
      )}
      <AnimatedPresence
        start={animate}
        animation={animation as TAnimation}
        onAnimationEnd={handleAnimationEnd}
        animateWhenInView={false}
      >
        <SAnimatedContainer ref={containerRef}>
          {tab === 'direct-messages' ? (
            <Chat
              roomID={
                router.query.roomID && isString(router.query.roomID)
                  ? router.query.roomID
                  : ''
              }
            />
          ) : (
            <>
              <SSectionTopLine tab={tab as string}>
                <STabsWrapper>
                  {user.userData?.options?.isOfferingSubscription &&
                  mySubscribersTotal > 0 ? (
                    <Tabs
                      t={t}
                      tabs={tabs}
                      draggable={false}
                      activeTabIndex={activeTabIndex}
                    />
                  ) : (
                    <Tabs
                      t={t}
                      tabs={tabNotification}
                      draggable={false}
                      activeTabIndex={0}
                    />
                  )}
                </STabsWrapper>
                <SSectionTopLineButtons>
                  {tab === 'notifications' ||
                  !user.userData?.options?.isOfferingSubscription ? (
                    <>
                      {unreadNotificationCount > 0 && (
                        <STopLineButton
                          view='secondary'
                          onClick={handleMarkAllAsRead}
                        >
                          {t('dashboard.button.markAllAsRead')}
                        </STopLineButton>
                      )}
                      {!isDesktop && (
                        <STopLineButton
                          view='secondary'
                          onClick={handleMinimizeClick}
                        >
                          {t('dashboard.button.minimize')}
                        </STopLineButton>
                      )}
                    </>
                  ) : (
                    <>
                      <SChatButton view='secondary' onClick={handleSearchClick}>
                        <SChatInlineSVG
                          svg={searchIcon}
                          fill={theme.colorsThemed.text.primary}
                          width='20px'
                          height='20px'
                        />
                      </SChatButton>
                      <SChatButton
                        view='secondary'
                        onClick={handleBulkMessageClick}
                      >
                        <SChatInlineSVG
                          svg={NewMessageIcon}
                          fill={theme.colorsThemed.text.primary}
                          width='20px'
                          height='20px'
                        />
                      </SChatButton>
                      <NewMessageModal
                        showModal={showNewMessageModal}
                        closeModal={closeNewMsgModal}
                      />
                    </>
                  )}
                </SSectionTopLineButtons>
              </SSectionTopLine>
              {tab === 'notifications' ? (
                <NotificationsList
                  markReadNotifications={markReadNotifications}
                />
              ) : (
                <ChatList />
              )}
            </>
          )}
        </SAnimatedContainer>
      </AnimatedPresence>
    </STopButtons>
  );
};

export default DynamicSection;

const STopButtons = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
`;

const SButton = styled(Button)`
  padding: 8px 12px;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.button.background.secondary};
  margin-left: 12px;
  border-radius: 12px;

  span {
    display: flex;
    flex-direction: row;
  }
`;

const SIconHolder = styled.div`
  position: relative;
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
  margin-right: 12px;
`;

const SChatInlineSVG = styled(InlineSVG)`
  min-width: 20px;
  min-height: 20px;
`;

const SIndicatorContainer = styled.div`
  top: -4px;
  right: 10px;
  position: absolute;
`;

const SIndicator = styled(Indicator)`
  border: 3px solid
    ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.button.background.secondary};
`;

const SAnimatedContainer = styled.div`
  top: -20px;

  z-index: 5;
  padding: 24px 0;
  position: absolute;
  box-shadow: ${(props) => props.theme.shadows.dashboardNotifications};
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  border-radius: 24px;
  width: 500px;
  right: -16px;
  height: 800px;

  ${(props) => props.theme.media.laptop} {
    left: unset;
    width: 500px;
    bottom: unset;
  }

  ${(props) => props.theme.media.laptopL} {
    top: -36px;
    width: 432px;
  }
`;

const STabsWrapper = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  justify-content: flex-start;
`;

interface ISSectionTopLine {
  tab: string;
}

const SSectionTopLine = styled.div<ISSectionTopLine>`
  display: flex;
  padding: 0 24px ${(props) => (props.tab === 'transactions' ? 0 : '8px')} 24px;
  align-items: center;
  justify-content: space-between;
`;

const SSectionTopLineButtons = styled.div`
  display: flex;
  align-items: center;
`;

const STopLineButton = styled(Button)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  padding: 10px 12px;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.button.background.secondary};
  margin-left: 12px;
`;

const SChatButton = styled(Button)`
  padding: 12px;
  margin-left: 12px;
`;
