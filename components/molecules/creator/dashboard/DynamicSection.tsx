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

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import InlineSVG from '../../../atoms/InlineSVG';
import Indicator from '../../../atoms/Indicator';
import UserAvatar from '../../UserAvatar';
import Tabs, { Tab } from '../../Tabs';
import AnimatedPresence, { TAnimation } from '../../../atoms/AnimatedPresence';

import useOnClickEsc from '../../../../utils/hooks/useOnClickEsc';
import { setOverlay } from '../../../../redux-store/slices/uiStateSlice';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';

import chatIcon from '../../../../public/images/svg/icons/filled/Chat.svg';
import searchIcon from '../../../../public/images/svg/icons/outlined/Search.svg';
import bulkMessageIcon from '../../../../public/images/svg/icons/filled/BulkMessage.svg';
import notificationsIcon from '../../../../public/images/svg/icons/filled/Notifications.svg';

export const DynamicSection = () => {
  const theme = useTheme();
  const { t } = useTranslation('creator');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const containerRef: any = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [animation, setAnimation] = useState('o-12');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet', 'laptop', 'laptopM'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;
  const { query: { tab = isDesktop ? 'notifications' : '' } } = router;
  const tabs: Tab[] = useMemo(() => [
    {
      url: '/creator/dashboard?tab=notifications',
      counter: 12,
      nameToken: 'notifications',
    },
    {
      url: '/creator/dashboard?tab=chat',
      counter: 6,
      nameToken: 'chat',
    },
  ], []);
  const notifications = useMemo(() => ({
    new: [
      {
        id: '1',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: true,
      },
      {
        id: '2',
        text: 'Bugaboo👻😈 subscribed on you.',
        time: '30m ago',
        unread: true,
      },
      {
        id: '3',
        text: 'SandyCandy posted a new comment on  ‘Where to dine tonight’?. ',
        time: '30m ago',
        unread: true,
      },
      {
        id: '4',
        text: 'SugarDaddy subscribed on you.',
        time: '30m ago',
        unread: true,
      },
    ],
    earlier: [
      {
        id: '5',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: false,
      },
      {
        id: '6',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: true,
      },
      {
        id: '7',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: false,
      },
      {
        id: '8',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: true,
      },
      {
        id: '9',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: false,
      },
      {
        id: '10',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: true,
      },
      {
        id: '11',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: false,
      },
      {
        id: '12',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: true,
      },
      {
        id: '13',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: false,
      },
      {
        id: '14',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: true,
      },
      {
        id: '15',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: false,
      },
      {
        id: '16',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: true,
      },
      {
        id: '17',
        text: 'Dark Moon 🌚 posted a new comment on  ‘Where to dine tonight’?.',
        time: '30m ago',
        unread: false,
      },
    ],
  }), []);
  const chats = useMemo(() => [
    {
      id: '1',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: false,
    },
    {
      id: '2',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 10,
    },
    {
      id: '3',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 2,
    },
    {
      id: '4',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: false,
    },
    {
      id: '5',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: false,
    },
    {
      id: '6',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: false,
    },
    {
      id: '7',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 1,
    },
    {
      id: '8',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: false,
    },
    {
      id: '9',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 6,
    },
    {
      id: '10',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 11,
    },
    {
      id: '11',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 15,
    },
    {
      id: '12',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 6,
    },
    {
      id: '13',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 12,
    },
    {
      id: '14',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 14,
    },
    {
      id: '15',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 15,
    },
    {
      id: '16',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 1,
    },
    {
      id: '17',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 16,
    },
    {
      id: '18',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 20,
    },
    {
      id: '19',
      time: '30 min',
      title: 'Dark Moon 🌚',
      lastMessage: 'Yeah, I know🙈 But I think it’s awe…',
      unread: true,
      unreadCount: 100,
    },
  ], []);
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
    console.log('mark all as read');
  }, []);
  const handleSearchClick = useCallback(() => {
    console.log('search');
  }, []);
  const handleBulkMessageClick = useCallback(() => {
    console.log('search');
  }, []);

  const renderChatItem = useCallback((item) => {
    const handleUserClick = () => {
    };

    return (
      <SChatItemContainer key={`chat-item-${item.id}`}>
        <SChatItem>
          <SChatItemAvatar
            withClick
            onClick={handleUserClick}
            avatarUrl={user.userData?.avatarUrl}
          />
          <SChatItemCenter>
            <SChatItemText variant={3} weight={600}>
              {item.title}
            </SChatItemText>
            <SChatItemLastMessage variant={3} weight={600}>
              {item.lastMessage}
            </SChatItemLastMessage>
          </SChatItemCenter>
          <SChatItemRight>
            <SChatItemTime variant={3} weight={600}>
              {item.time}
            </SChatItemTime>
            {!!item.unread && (
              <SChatItemIndicator counter={item.unreadCount} />
            )}
          </SChatItemRight>
        </SChatItem>
        <SChatSeparator />
      </SChatItemContainer>
    );
  }, [user.userData?.avatarUrl]);
  const renderNotificationItem = useCallback((item) => {
    const handleUserClick = () => {
    };

    return (
      <SNotificationItem key={`notification-item-${item.id}`}>
        <SNotificationItemAvatar
          withClick
          onClick={handleUserClick}
          avatarUrl={user.userData?.avatarUrl}
        />
        <SNotificationItemCenter>
          <SNotificationItemText variant={3} weight={600}>
            {item.text}
          </SNotificationItemText>
          <SNotificationItemTime variant={2} weight={600}>
            {item.time}
          </SNotificationItemTime>
        </SNotificationItemCenter>
        {!!item.unread && (
          <SNotificationItemIndicator minified />
        )}
      </SNotificationItem>
    );
  }, [user.userData?.avatarUrl]);

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
          <SButton
            view="secondary"
            onClick={handleNotificationsClick}
          >
            <SIconHolder>
              <SInlineSVG
                svg={notificationsIcon}
                fill={theme.name === 'light' ? theme.colors.black : theme.colors.white}
                width="24px"
                height="24px"
              />
              <SIndicatorContainer>
                <SIndicator minified />
              </SIndicatorContainer>
            </SIconHolder>
            {t('dashboard.button.notifications')}
          </SButton>
          <SButton
            view="secondary"
            onClick={handleChatClick}
          >
            <SIconHolder>
              <SInlineSVG
                svg={chatIcon}
                fill={theme.name === 'light' ? theme.colors.black : theme.colors.white}
                width="24px"
                height="24px"
              />
              <SIndicatorContainer>
                <SIndicator minified />
              </SIndicatorContainer>
            </SIconHolder>
            {t('dashboard.button.dms')}
          </SButton>
        </>
      )}
      <AnimatedPresence
        start={animate}
        animation={animation as TAnimation}
        onAnimationEnd={handleAnimationEnd}
        animateWhenInView={false}
      >
        <SAnimatedContainer ref={containerRef}>
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
                  <STopLineButton
                    view="secondary"
                    onClick={handleMarkAllAsRead}
                  >
                    {t('dashboard.button.markAllAsRead')}
                  </STopLineButton>
                  {!isDesktop && (
                    <STopLineButton
                      view="secondary"
                      onClick={handleMinimizeClick}
                    >
                      {t('dashboard.button.minimize')}
                    </STopLineButton>
                  )}
                </>
              ) : (
                <>
                  <SChatButton
                    view="secondary"
                    onClick={handleSearchClick}
                  >
                    <SChatInlineSVG
                      svg={searchIcon}
                      fill={theme.colorsThemed.text.primary}
                      width="20px"
                      height="20px"
                    />
                  </SChatButton>
                  <SChatButton
                    view="secondary"
                    onClick={handleBulkMessageClick}
                  >
                    <SChatInlineSVG
                      svg={bulkMessageIcon}
                      fill={theme.colorsThemed.text.primary}
                      width="20px"
                      height="20px"
                    />
                  </SChatButton>
                </>
              )}
            </SSectionTopLineButtons>
          </SSectionTopLine>
          <SSectionContent>
            {tab === 'notifications' && (
              <SSectionTitle variant={2} weight={600}>
                {t('dashboard.button.new')}
              </SSectionTitle>
            )}
            {tab === 'notifications' ? notifications.new.map(renderNotificationItem) : chats.map(renderChatItem)}
            {tab === 'notifications' && (
              <SSectionTitle variant={2} weight={600}>
                {t('dashboard.button.earlier')}
              </SSectionTitle>
            )}
            {tab === 'notifications' && notifications.earlier.map(renderNotificationItem)}
          </SSectionContent>
          <GradientMask />
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
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary)};
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
  border: 3px solid ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary)};
`;

const SAnimatedContainer = styled.div`
  top: 144px;
  left: 212px;
  right: 32px;
  bottom: 34px;
  z-index: 5;
  padding: 24px 0;
  position: fixed;
  box-shadow: ${(props) => props.theme.shadows.dashboardNotifications};
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary)};
  border-radius: 24px;

  ${(props) => props.theme.media.laptop} {
    left: unset;
    width: 500px;
    height: 800px;
    bottom: unset;
  }

  ${(props) => props.theme.media.laptopL} {
    top: 120px;
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
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary)};
  margin-left: 12px;
`;

const SChatButton = styled(Button)`
  padding: 12px;
  margin-left: 12px;
`;

const SSectionContent = styled.div`
  height: calc(100% - 48px);
  padding: 0 24px;
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
`;

const SNotificationItem = styled.div`
  cursor: pointer;
  display: flex;
  padding: 8px 0;
`;

const SNotificationItemAvatar = styled(UserAvatar)``;

const SNotificationItemCenter = styled.div`
  width: 100%;
  display: flex;
  padding: 0 12px;
  flex-direction: column;
`;

const SNotificationItemText = styled(Text)`
  margin-bottom: 4px;
`;

const SNotificationItemTime = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SNotificationItemIndicator = styled(Indicator)`
  border: 3px solid ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary)};
  padding: 5px;
`;

const SChatItem = styled.div`
  cursor: pointer;
  display: flex;
  padding: 8px 0;
`;

const SChatItemAvatar = styled(UserAvatar)``;

const SChatItemCenter = styled.div`
  width: 100%;
  display: flex;
  padding: 2px 12px;
  flex-direction: column;
`;

const SChatItemText = styled(Text)`
  margin-bottom: 4px;
`;

const SChatItemLastMessage = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SChatItemRight = styled.div`
  display: flex;
  padding: 2px 0;
  align-items: flex-end;
  flex-direction: column;
`;

const SChatItemTime = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  white-space: nowrap;
  margin-bottom: 4px;
`;

const SChatItemIndicator = styled(Indicator)``;

const SChatSeparator = styled.div`
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  margin-left: 60px;
  border-radius: 2px;
`;

const SChatItemContainer = styled.div``;

const GradientMask = styled.div`
  left: 0;
  right: 0;
  bottom: 0;
  height: 200px;
  z-index: 1;
  position: absolute;
  background: ${(props) => props.theme.gradients.dashboardNotifications};
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  pointer-events: none;
`;

const SSectionTitle = styled(Text)`
  padding: 16px 0 8px 0;
`;
