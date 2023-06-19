import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { InfiniteData, useQueryClient } from 'react-query';

import Button from '../../../atoms/Button';
import { Tab } from '../../Tabs';
import AnimatedPresence, {
  TElementAnimations,
} from '../../../atoms/AnimatedPresence';

import useOnClickEsc from '../../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

import chatIcon from '../../../../public/images/svg/icons/filled/Chat.svg';
import NewMessageIcon from '../../../../public/images/svg/icons/filled/NewMessage.svg';
import notificationsIcon from '../../../../public/images/svg/icons/filled/Notifications.svg';
import { useNotifications } from '../../../../contexts/notificationsContext';
import { useOverlayMode } from '../../../../contexts/overlayModeContext';
import { getRoom } from '../../../../api/endpoints/chat';
import { Mixpanel } from '../../../../utils/mixpanel';
import { useBundles } from '../../../../contexts/bundlesContext';
import { useAppState } from '../../../../contexts/appStateContext';
import Loader from '../../../atoms/Loader';
import { useChatsUnreadMessages } from '../../../../contexts/chatsUnreadMessagesContext';

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
const InlineSVG = dynamic(() => import('../../../atoms/InlineSVG'));
const Indicator = dynamic(() => import('../../../atoms/Indicator'));
const Tabs = dynamic(() => import('../../Tabs'));

interface IDynamicSection {
  baseUrl: string;
}

// TODO: Refactoring
export const DynamicSection: React.FC<IDynamicSection> = ({ baseUrl }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('page-Creator');
  const { directMessagesAvailable, isBundleDataLoaded } = useBundles();
  const { unreadCountForCreator } = useChatsUnreadMessages();
  const { unreadNotificationCount } = useNotifications();
  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();
  const queryClient = useQueryClient();

  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isSmallDesktop = ['laptop', 'laptopM'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet && !isSmallDesktop;

  const containerRef: any = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [animation, setAnimation] = useState<TElementAnimations>('o-12');
  const [isLoading, setIsLoading] = useState(false);
  const [markReadNotifications, setMarkReadNotifications] = useState(false);
  const [activeChatRoom, setActiveChatRoom] =
    useState<newnewapi.IChatRoom | null>(null);

  const {
    query: { tab = isDesktop ? 'notifications' : '' },
  } = router;

  const [showNewMessageModal, setShowNewMessageModal] =
    useState<boolean>(false);

  const selectedChatRoomId = useMemo(() => {
    if (!router.query.roomID || Array.isArray(router.query.roomID)) {
      return undefined;
    }

    return parseInt(router.query.roomID);
  }, [router.query.roomID]);

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

  const activeTabIndex = useMemo(
    () => tabs.findIndex((el) => el.nameToken === tab),
    [tabs, tab]
  );

  const closeNewMsgModal = useCallback(() => {
    setShowNewMessageModal(false);
  }, []);

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

  const handleClickOutside = useCallback(() => {
    if (tab && !isDesktop && !showNewMessageModal) {
      handleMinimizeClick();
    }
  }, [tab, isDesktop, showNewMessageModal, handleMinimizeClick]);
  useOnClickOutside(containerRef, handleClickOutside);

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

  // TODO: rework this part lead to bugs
  useEffect(() => {
    const findChatRoom = async () => {
      try {
        setIsLoading(true);

        // find room in already requested witch react-query chatRooms for ChatList
        const query = queryClient.getQueriesData<
          InfiniteData<{ chatrooms: newnewapi.IChatRoom[] }>
        >(['private', 'getMyRooms', { myRole: 2, searchQuery: '' }]);

        const queryData = query[0] ? query[0][1] : null;

        const chatRooms = queryData
          ? queryData.pages.map((page) => page.chatrooms).flat()
          : [];

        const foundedActiveChatRoom = chatRooms.find(
          (chatroom: newnewapi.IChatRoom) =>
            selectedChatRoomId && chatroom.id === selectedChatRoomId
        );

        if (foundedActiveChatRoom) {
          setActiveChatRoom(foundedActiveChatRoom);
          return;
        }

        const payload = new newnewapi.GetRoomRequest({
          roomId: selectedChatRoomId,
        });

        const res = await getRoom(payload);

        if (!res?.data || res.error) {
          throw new Error('Request failed');
        }

        setActiveChatRoom(res.data);
      } catch (err) {
        console.error(err);
        router.push(`${baseUrl}?tab=chat`);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedChatRoomId && selectedChatRoomId !== activeChatRoom?.id) {
      findChatRoom();
    }
  }, [
    selectedChatRoomId,
    queryClient,
    activeChatRoom?.id,
    router,
    setActiveChatRoom,
    baseUrl,
  ]);

  const handleChatRoomSelect = useCallback(
    async (chatRoom: newnewapi.IChatRoom) => {
      await router.replace(
        `?tab=direct-messages&roomID=${chatRoom.id}`,
        undefined,
        {
          shallow: true,
        }
      );
    },
    [router]
  );

  useEffect(() => {
    if (
      isBundleDataLoaded &&
      !directMessagesAvailable &&
      (tab === 'chat' || tab === 'direct-messages')
    ) {
      router.replace(`${baseUrl}?tab=notifications`);
    }
  }, [isBundleDataLoaded, directMessagesAvailable, tab, baseUrl, router]);

  const handleCloseChatRoom = useCallback(async () => {
    await router.replace(`${baseUrl}?tab=chat`, undefined, {
      shallow: true,
    });
    setActiveChatRoom(null);
  }, [router, baseUrl]);

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
          {directMessagesAvailable && (
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
          <SContent hidden={tab !== 'direct-messages'}>
            {activeChatRoom && (
              <ChatContent
                chatRoom={activeChatRoom}
                isBackButton
                onBackButtonClick={handleCloseChatRoom}
                withHeaderAvatar
                variant='secondary'
              />
            )}

            {!activeChatRoom && isLoading && <Loader size='md' isStatic />}
          </SContent>

          <SContent hidden={tab === 'direct-messages'}>
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
                      onNewMessageSelect={handleChatRoomSelect}
                    />
                  </>
                )}
              </SSectionTopLineButtons>
            </SSectionTopLine>
            <SSectionContent isSmallPadding={tab === 'chat'}>
              {tab === 'notifications' && (
                <NotificationsList
                  markReadNotifications={markReadNotifications}
                />
              )}
              {(tab === 'chat' || tab === 'direct-messages') && (
                <ChatList
                  myRole={newnewapi.ChatRoom.MyRole.CREATOR}
                  onChatRoomSelect={handleChatRoomSelect}
                />
              )}
            </SSectionContent>
          </SContent>
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

const SSectionContent = styled.div<{ isSmallPadding: boolean }>`
  height: calc(100% - 52px);
  padding: ${({ isSmallPadding }) => (isSmallPadding ? '0 12px' : '0 24px')};
  display: flex;
  position: relative;
  overflow-y: scroll;
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
    margin-bottom: 16px;
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

const SContent = styled.div<{
  hidden: boolean;
}>`
  height: 100%;

  ${({ hidden }) => {
    if (hidden) {
      return css`
        display: none;
      `;
    }
    return css``;
  }}
`;
