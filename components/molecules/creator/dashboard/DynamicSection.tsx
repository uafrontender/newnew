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
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import _ from 'lodash';

import Button from '../../../atoms/Button';
import { Tab } from '../../Tabs';
import AnimatedPresence, {
  TElementAnimations,
} from '../../../atoms/AnimatedPresence';

import useOnClickEsc from '../../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { useAppSelector } from '../../../../redux-store/store';

import chatIcon from '../../../../public/images/svg/icons/filled/Chat.svg';
import NewMessageIcon from '../../../../public/images/svg/icons/filled/NewMessage.svg';
import notificationsIcon from '../../../../public/images/svg/icons/filled/Notifications.svg';
import { useGetChats } from '../../../../contexts/chatContext';
import { useNotifications } from '../../../../contexts/notificationsContext';
import { useOverlayMode } from '../../../../contexts/overlayModeContext';
import { getRoom } from '../../../../api/endpoints/chat';
import { Mixpanel } from '../../../../utils/mixpanel';
import { useBundles } from '../../../../contexts/bundlesContext';

const SearchInput = dynamic(() => import('./SearchInput'));
const ChatContent = dynamic(
  () => import('../../../organisms/direct-messages/ChatContent')
);
// TODO: Adjust New Message modal for dashboard to get only bundle owners
const NewMessageModal = dynamic(
  () => import('../../direct-messages/NewMessageModal')
);
const NotificationsList = dynamic(() => import('./NotificationsList'));
const ChatList = dynamic(() => import('../../direct-messages/ChatList'));
// const Chat = dynamic(() => import('./Chat'));
const InlineSVG = dynamic(() => import('../../../atoms/InlineSVG'));
const Indicator = dynamic(() => import('../../../atoms/Indicator'));
const Tabs = dynamic(() => import('../../Tabs'));

interface IDynamicSection {
  baseUrl: string;
}

export const DynamicSection: React.FC<IDynamicSection> = ({ baseUrl }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Creator');
  const router = useRouter();
  const containerRef: any = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [animation, setAnimation] = useState<TElementAnimations>('o-12');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const {
    unreadCountForCreator,
    setActiveTab,
    activeTab,
    activeChatRoom,
    setActiveChatRoom,
  } = useGetChats();
  const { unreadNotificationCount } = useNotifications();
  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();
  const { directMessagesAvailable } = useBundles();
  const [markReadNotifications, setMarkReadNotifications] = useState(false);

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
  const tabs: Tab[] = useMemo(() => {
    if (directMessagesAvailable) {
      return [
        {
          url: `${baseUrl}?tab=notifications`,
          counter: unreadNotificationCount,
          nameToken: 'notifications',
        },
        {
          url: `${baseUrl}?tab=chat`,
          counter: unreadCountForCreator,
          nameToken: 'chat',
        },
      ];
    }

    return [
      {
        url: `${baseUrl}?tab=notifications`,
        counter: unreadNotificationCount,
        nameToken: 'notifications',
      },
    ];
  }, [
    directMessagesAvailable,
    baseUrl,
    unreadCountForCreator,
    unreadNotificationCount,
  ]);

  const activeTabIndex = tabs.findIndex((el) => el.nameToken === tab);

  const handleChatClick = useCallback(() => {
    Mixpanel.track('Navigation Item Clicked', {
      _stage: 'Dashboard',
      _target: `${baseUrl}?tab=chat`,
      _button: 'DMs',
      _component: 'DynamicSection',
    });

    router.push(`${baseUrl}?tab=chat`);
  }, [baseUrl, router]);

  const handleNotificationsClick = useCallback(() => {
    Mixpanel.track('Navigation Item Clicked', {
      _stage: 'Dashboard',
      _target: `${baseUrl}?tab=notifications`,
      _button: 'Notifications',
      _component: 'DynamicSection',
    });
    router.push(`${baseUrl}?tab=notifications`);
  }, [baseUrl, router]);

  const handleMinimizeClick = useCallback(() => {
    Mixpanel.track('Navigation Item Clicked', {
      _stage: 'Dashboard',
      _target: baseUrl,
      _button: 'Minimize',
      _component: 'DynamicSection',
    });
    router.push(baseUrl);
  }, [baseUrl, router]);

  const handleAnimationEnd = useCallback(() => {
    setAnimate(false);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    Mixpanel.track('Mark All As Read Button Clicked', {
      _stage: 'Dashboard',
      _target: baseUrl,
      _button: 'Mark all as read',
      _component: 'DynamicSection',
    });

    setMarkReadNotifications(true);
    setTimeout(() => {
      setMarkReadNotifications(false);
    }, 1500);
  }, [baseUrl]);

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
    if (!isDesktop && tab) {
      enableOverlayMode();
    }
    setAnimate(true);
    setAnimation(tab ? 'o-12' : 'o-12-reverse');

    return () => {
      disableOverlayMode();
    };
  }, [tab, isDesktop, enableOverlayMode, disableOverlayMode]);

  useEffect(() => {
    if (
      router.asPath.includes(`${baseUrl}?tab=direct-messages`) &&
      !activeChatRoom
    ) {
      if (router.query.roomID) {
        (async () => {
          try {
            const payload = new newnewapi.GetRoomRequest({
              roomId: _.toNumber(router.query.roomID),
            });

            const res = await getRoom(payload);
            if (!res.data || res.error) {
              throw new Error(res.error?.message ?? 'Request failed');
            }
            setActiveChatRoom(res.data);
          } catch (err) {
            router.push(`${baseUrl}?tab=chat`);
            console.error(err);
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, router, activeChatRoom]);

  useEffect(() => {
    if (activeTab !== newnewapi.ChatRoom.MyRole.CREATOR) {
      setActiveTab(newnewapi.ChatRoom.MyRole.CREATOR);
    }
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    if (
      !directMessagesAvailable &&
      (tab === 'chat' || tab === 'direct-messages')
    ) {
      router.replace(`${baseUrl}?tab=notifications`);
    }
  }, [directMessagesAvailable, tab, baseUrl, router]);

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
        </>
      )}
      <AnimatedPresence
        start={animate}
        animation={animation}
        onAnimationEnd={handleAnimationEnd}
        animateWhenInView={false}
        delay={0}
        duration={0.2}
      >
        <SAnimatedContainer
          ref={containerRef}
          isDashboardMessages={tab === 'direct-messages'}
        >
          {tab === 'direct-messages' ? (
            activeChatRoom && (
              <>
                <ChatContent chatRoom={activeChatRoom!!} />
                <ChatList hidden />
              </>
            )
          ) : (
            <>
              <SSectionTopLine tab={tab as string}>
                <STabsWrapper>
                  <Tabs
                    t={t}
                    tabs={tabs}
                    draggable={false}
                    activeTabIndex={activeTabIndex}
                  />
                </STabsWrapper>
                <SSectionTopLineButtons>
                  {tab === 'notifications' ? (
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
                      <SearchInput />
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
              <SSectionContent>
                {tab === 'notifications' ? (
                  <NotificationsList
                    markReadNotifications={markReadNotifications}
                  />
                ) : (
                  <ChatList />
                )}
              </SSectionContent>
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

interface ISAnimatedContainer {
  isDashboardMessages?: boolean;
}
const SAnimatedContainer = styled.div<ISAnimatedContainer>`
  top: -20px;

  z-index: 5;
  padding: ${(props) => (!props.isDashboardMessages ? '24px 0 0' : '0')};
  position: absolute;
  box-shadow: ${(props) => props.theme.shadows.dashboardNotifications};
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  border-radius: 24px;
  width: 500px;
  right: -16px;
  height: 80vh;
  max-height: 800px;

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

  ${(props) => props.theme.media.laptop} {
    min-height: 52px;
  }
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

const SSectionContent = styled.div`
  height: calc(100% - 52px);
  padding: 0 24px;
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
  // Scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  scrollbar-width: none;
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
  }

  &:hover {
    scrollbar-width: thin;
    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colorsThemed.background.outlines1};
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colorsThemed.background.outlines2};
    }
  }
`;
