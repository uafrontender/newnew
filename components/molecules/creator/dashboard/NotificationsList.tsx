import React, { useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../../atoms/Text';
import Caption from '../../../atoms/Caption';
import Indicator from '../../../atoms/Indicator';
import UserAvatar from '../../UserAvatar';

import { useAppSelector } from '../../../../redux-store/store';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';

export const NotificationsList = () => {
  const { t } = useTranslation('creator');
  const scrollRef: any = useRef();
  const user = useAppSelector((state) => state.user);

  const collection = useMemo(
    () => ({
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
    }),
    []
  );
  const renderNotificationItem = useCallback(
    (item) => {
      const handleUserClick = () => {};

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
          {!!item.unread && <SNotificationItemIndicator minified />}
        </SNotificationItem>
      );
    },
    [user.userData?.avatarUrl]
  );

  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  return (
    <>
      <SSectionContent ref={scrollRef}>
        <SSectionTitle variant={2} weight={600}>
          {t('dashboard.button.new')}
        </SSectionTitle>
        {collection.new.map(renderNotificationItem)}
        <SSectionTitle variant={2} weight={600}>
          {t('dashboard.button.earlier')}
        </SSectionTitle>
        {collection.earlier.map(renderNotificationItem)}
      </SSectionContent>
      <SGradientMaskTop active={showTopGradient} />
      <SGradientMaskBottom active={showBottomGradient} />
    </>
  );
};

export default NotificationsList;

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
  border: 3px solid
    ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.button.background.secondary};
  padding: 5px;
`;

const SSectionTitle = styled(Text)`
  padding: 16px 0 8px 0;
`;

interface ISGradientMask {
  active: boolean;
}

const SGradientMaskTop = styled.div<ISGradientMask>`
  top: 76px;
  left: 0;
  right: 0;
  height: ${(props) => (props.active ? '40px' : 0)};
  z-index: 1;
  position: absolute;
  transition: height ease 0.5s;
  background: ${(props) => props.theme.gradients.listTop};
  pointer-events: none;

  ${(props) => props.theme.media.tablet} {
    height: ${(props) => (props.active ? '60px' : 0)};
  }

  ${(props) => props.theme.media.laptopL} {
    height: ${(props) => (props.active ? '80px' : 0)};
  }
`;

const SGradientMaskBottom = styled.div<ISGradientMask>`
  left: 0;
  right: 0;
  bottom: 20px;
  height: ${(props) => (props.active ? '40px' : 0)};
  z-index: 1;
  position: absolute;
  transition: height ease 0.5s;
  background: ${(props) => props.theme.gradients.listBottom};
  pointer-events: none;

  ${(props) => props.theme.media.tablet} {
    height: ${(props) => (props.active ? '60px' : 0)};
  }

  ${(props) => props.theme.media.laptopL} {
    height: ${(props) => (props.active ? '80px' : 0)};
  }
`;
