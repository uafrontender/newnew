import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import moment from 'moment';
import { scroller } from 'react-scroll';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import TextArea from '../../atoms/creation/TextArea';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import chevronLeftIcon from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';

import { SCROLL_TO_FIRST_MESSAGE } from '../../../constants/timings';

import { IUser, IMessage, IChatData } from '../../interfaces/ichat';
import { useAppSelector } from '../../../redux-store/store';
import { SUserAlias } from '../../atoms/chat/styles';

const ChatEllipseMenu = dynamic(() => import('./ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('./ChatEllipseModal'));
const BlockedUser = dynamic(() => import('./BlockedUser'));
const AccountDeleted = dynamic(() => import('./AccountDeleted'));
const SubscriptionExpired = dynamic(() => import('./SubscriptionExpired'));
const MessagingDisabled = dynamic(() => import('./MessagingDisabled'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));

const ChatArea: React.FC<IChatData> = ({ userData, messages, showChatList }) => {
  const [message, setMessage] = useState('');
  const [localUserData, setUserData] = useState<IUser>({
    userName: '',
    userAlias: '',
    avatar: '',
  });
  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [collection, setCollection] = useState<IMessage[]>([]);
  useEffect(() => {
    if (userData && messages) {
      setUserData(userData);
      setCollection(messages);
    }
  }, [userData, messages]);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);
  const onUserBlock = () => {
    if (!localUserData.blockedUser) {
      /* eslint-disable no-unused-expressions */
      !confirmBlockUser ? setConfirmBlockUser(true) : setUserData({ ...localUserData, blockedUser: true });
    } else {
      setUserData({ ...localUserData, blockedUser: false });
    }
  };

  const theme = useTheme();
  const { t } = useTranslation('chat');
  const scrollRef: any = useRef();

  const handleChange = useCallback((id, value) => {
    setMessage(value);
  }, []);

  const handleSubmit = useCallback(() => {
    const newItem: IMessage = {
      id: (collection.length + 1).toString(),
      mine: true,
      date: moment(),
      message,
    };
    setMessage('');
    setCollection([newItem, ...collection]);
  }, [message, collection]);
  const renderMessage = useCallback(
    (item, index) => {
      const prevElement = collection[index - 1];
      const nextElement = collection[index + 1];

      const prevSameUser = prevElement?.mine === item.mine;
      const nextSameUser = prevElement?.mine === item.mine;

      const content = (
        <SMessage id={index === 0 ? 'first-element' : `message-${index}`} key={`message-${item.id}`} mine={item.mine}>
          {!nextSameUser && !item.mine && <SUserAvatar avatarUrl={localUserData?.avatar} />}
          {!nextSameUser && item.mine && <SUserAvatar avatarUrl={user.userData?.avatarUrl} />}
          <SMessageContent mine={item.mine} prevSameUser={prevSameUser} nextSameUser={nextSameUser}>
            <SMessageText mine={item.mine} weight={600} variant={3}>
              {item.message}
            </SMessageText>
          </SMessageContent>
        </SMessage>
      );

      if (moment(item.date).format('DD.MM.YYYY') !== moment(nextElement?.date).format('DD.MM.YYYY')) {
        let date = moment(item.date).format('MMM DD');

        if (date === moment().format('MMM DD')) {
          date = t('chat.today');
        }

        return (
          <>
            {content}
            <SMessage key={`message-date-${moment(item.date).format('DD.MM.YYYY')}`} type="info">
              <SMessageContent
                type="info"
                prevSameUser={prevElement?.mine === item.mine}
                nextSameUser={nextElement?.mine === item.mine}
              >
                <SMessageText type="info" weight={600} variant={3}>
                  {date}
                </SMessageText>
              </SMessageContent>
            </SMessage>
          </>
        );
      }

      return content;
    },
    [collection, t, localUserData?.avatar, user.userData?.avatarUrl]
  );

  useEffect(() => {
    scroller.scrollTo('first-element', {
      smooth: 'easeInOutQuart',
      duration: SCROLL_TO_FIRST_MESSAGE,
      containerId: 'messagesScrollContainer',
    });
  }, [collection.length]);

  return (
    <SContainer>
      {localUserData.userName && (
        <STopPart>
          {isMobileOrTablet && (
            <SBackButton
              clickable
              svg={chevronLeftIcon}
              fill={theme.colorsThemed.text.secondary}
              width="24px"
              height="24px"
              onClick={showChatList}
            />
          )}
          <SUserData>
            <SUserName>{localUserData?.userName}</SUserName>
            <SUserAlias>@{localUserData?.userAlias}</SUserAlias>
          </SUserData>
          <SActionsDiv>
            <SMoreButton view="transparent" iconOnly onClick={() => handleOpenEllipseMenu()}>
              <InlineSVG svg={MoreIconFilled} fill={theme.colorsThemed.text.secondary} width="20px" height="20px" />
            </SMoreButton>
            {/* Ellipse menu */}
            {!isMobile && (
              <ChatEllipseMenu
                isVisible={ellipseMenuOpen}
                handleClose={handleCloseEllipseMenu}
                userBlocked={localUserData?.blockedUser}
                onUserBlock={onUserBlock}
              />
            )}
            {isMobile && ellipseMenuOpen ? (
              <ChatEllipseModal
                isOpen={ellipseMenuOpen}
                zIndex={11}
                onClose={handleCloseEllipseMenu}
                userBlocked={localUserData?.blockedUser}
                onUserBlock={onUserBlock}
              />
            ) : null}
          </SActionsDiv>
        </STopPart>
      )}
      <SCenterPart id="messagesScrollContainer" ref={scrollRef}>
        {localUserData?.justSubscribed && <WelcomeMessage userAlias={localUserData.userAlias} />}
        {collection.map(renderMessage)}
      </SCenterPart>
      <SBottomPart>
        {(localUserData.blockedUser === true || confirmBlockUser) && (
          <BlockedUser
            confirmBlockUser={confirmBlockUser}
            isBlocked={localUserData.blockedUser}
            userName={localUserData?.userName}
            onUserBlock={onUserBlock}
            closeModal={() => setConfirmBlockUser(false)}
          />
        )}
        {localUserData.subscriptionExpired && <SubscriptionExpired userName={localUserData.userName} />}
        {localUserData.accountDeleted && <AccountDeleted />}
        {localUserData.messagingDisabled && <MessagingDisabled />}

        {!localUserData.blockedUser &&
          !localUserData.subscriptionExpired &&
          !localUserData.messagingDisabled &&
          !localUserData.accountDeleted &&
          localUserData.userName && (
            <SBottomTextarea>
              <STextArea>
                <TextArea maxlength={500} value={message} onChange={handleChange} placeholder={t('chat.placeholder')} />
              </STextArea>
              <SButton
                withShadow
                view={message ? 'primaryGrad' : 'secondary'}
                onClick={handleSubmit}
                disabled={!message}
              >
                <SInlineSVG
                  svg={sendIcon}
                  fill={message ? theme.colors.white : theme.colorsThemed.text.primary}
                  width="24px"
                  height="24px"
                />
              </SButton>
            </SBottomTextarea>
          )}
      </SBottomPart>
    </SContainer>
  );
};

export default ChatArea;

const SContainer = styled.div`
  height: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
`;

const STopPart = styled.header`
  height: 80px;
  border-bottom: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 24px;
`;

const SUserData = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 600;
  margin-right: auto;
`;

const SUserName = styled.strong`
  font-weight: 600;
  font-size: 16px;
  padding-bottom: 4px;
`;

const SActionsDiv = styled.div`
  position: relative;
`;

const SMoreButton = styled(Button)`
  background: none;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  padding: 8px;
  margin-right: 18px;
  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

const SCenterPart = styled.div`
  gap: 8px;
  flex: 1;
  margin: 0 0 24px;
  display: flex;
  overflow-y: auto;
  flex-direction: column-reverse;
  padding: 0 24px;
  position: relative;
`;

const SBottomPart = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 24px;
`;

const SBottomTextarea = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const STextArea = styled.div`
  flex: 1;
`;

const SUserAvatar = styled(UserAvatar)`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  padding: 0;
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
`;

const SButton = styled(Button)`
  padding: 12px;
  margin-left: 12px;
  &:disabled {
    background: ${(props) =>
      props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.button.background.secondary};
  }
`;

interface ISMessage {
  type?: string;
  mine?: boolean;
}

const SMessage = styled.div<ISMessage>`
  width: 100%;
  position: relative;
  padding-left: ${(props) => {
    if (props.type !== 'info') {
      return '44px';
    }
    return '0px';
  }};
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => {
    if (props.type === 'info') {
      return 'center';
    }
    return 'flex-start';
  }};
`;

interface ISMessageContent {
  type?: string;
  mine?: boolean;
  prevSameUser?: boolean;
  nextSameUser?: boolean;
}

const SMessageContent = styled.div<ISMessageContent>`
  padding: ${(props) => (props.type === 'info' ? 0 : '12px 16px')};
  background: ${(props) => {
    if (props.type === 'info') {
      return 'transparent';
    }
    if (props.mine) {
      return props.theme.colorsThemed.accent.blue;
    }
    if (props.theme.name === 'light') {
      return props.theme.colors.white;
    }

    return props.theme.colorsThemed.background.tertiary;
  }};
  ${(props) => {
    if (props.mine) {
      if (props.prevSameUser) {
        if (props.nextSameUser) {
          if (props.type === 'info') {
            return css`
              margin: 8px 0;
            `;
          }

          return css`
            border-radius: 16px;
          `;
        }

        if (props.type === 'info') {
          return css`
            margin-top: 8px;
          `;
        }

        return css`
          margin-top: 8px;
          border-radius: 16px 16px 8px 16px;
        `;
      }

      if (props.nextSameUser) {
        if (props.type === 'info') {
          return css`
            margin: 8px 0;
          `;
        }

        return css`
          border-radius: 16px 8px 16px 16px;
        `;
      }
    } else {
      if (props.prevSameUser) {
        if (props.nextSameUser) {
          if (props.type === 'info') {
            return css`
              margin: 8px 0;
            `;
          }
          return css`
            border-radius: 16px;
          `;
        }

        if (props.type === 'info') {
          return css`
            margin-top: 8px;
          `;
        }

        return css`
          margin-top: 8px;
          border-radius: 16px 16px 16px 8px;
        `;
      }

      if (props.nextSameUser) {
        if (props.type === 'info') {
          return css`
            margin: 8px 0;
          `;
        }

        return css`
          border-radius: 8px 16px 16px 16px;
        `;
      }
    }

    if (props.type === 'info') {
      return css`
        margin: 8px 0;
      `;
    }

    return css`
      border-radius: 16px;
    `;
  }}
`;

interface ISMessageText {
  type?: string;
  mine?: boolean;
}

const SMessageText = styled(Text)<ISMessageText>`
  line-height: 20px;
  max-width: 412px;
  color: ${(props) => {
    if (props.type === 'info') {
      return props.theme.colorsThemed.text.tertiary;
    }

    if (props.mine && props.theme.name === 'light') {
      return props.theme.colors.white;
    }

    return props.theme.colorsThemed.text.primary;
  }};
`;

const SBackButton = styled(SInlineSVG)`
  margin-right: 20px;
`;
