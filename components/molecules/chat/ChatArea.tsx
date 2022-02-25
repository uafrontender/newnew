import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import moment from 'moment';
import { scroller } from 'react-scroll';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import TextArea from '../../atoms/creation/TextArea';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';

import { SCROLL_TO_FIRST_MESSAGE } from '../../../constants/timings';

import { IMessage, IChatData } from '../../interfaces/ichat';
import { useAppSelector } from '../../../redux-store/store';
import { SUserAlias } from '../../atoms/chat/styles';
import GoBackButton from '../GoBackButton';
import randomID from '../../../utils/randomIdGenerator';
import { getMyRooms } from '../../../api/endpoints/chat';

const ChatEllipseMenu = dynamic(() => import('./ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('./ChatEllipseModal'));
const BlockedUser = dynamic(() => import('./BlockedUser'));
const AccountDeleted = dynamic(() => import('./AccountDeleted'));
const SubscriptionExpired = dynamic(() => import('./SubscriptionExpired'));
const MessagingDisabled = dynamic(() => import('./MessagingDisabled'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));
const ReportUserModal = dynamic(() => import('./ReportUserModal'));

const ChatArea: React.FC<IChatData> = ({ chatUser, showChatList }) => {
  const [message, setMessage] = useState('');
  const [localUserData, setLocalUserData] = useState({
    justSubscribed: true,
    blockedUser: false,
    isAnnouncement: false,
    subscriptionExpired: false,
    messagingDisabled: false,
    accountDeleted: false,
  });

  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [collection, setCollection] = useState<IMessage[]>([]);
  const [chatRooms, setChatRooms] = useState<newnewapi.IChatRoom[]>([]);

  const theme = useTheme();
  const { t } = useTranslation('chat');
  const scrollRef: any = useRef();

  useEffect(() => {
    async function fetchMyRooms(name:string) {
      try {
        const payload = new newnewapi.GetMyRoomsRequest({ searchQuery: name });
        const res = await getMyRooms(payload);
        console.log(res);

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        setChatRooms(res.data.rooms);
      } catch (err) {
        console.error(err);
      }
    }

    if (chatUser) {
      setLocalUserData((data) => ({ ...data, ...chatUser }));
      setCollection([
        {
          id: randomID(),
          message: '👋 Hey, thank you for subscribing to my channel, I look forward to talking to you.',
          mine: false,
          date: moment().subtract(3, 'days'),
        },
      ]);
      if (chatUser.username) fetchMyRooms(chatUser.username);
    }
  }, [chatUser]);

  useEffect(() => {
    if (chatRooms.length > 0) {
      console.log(chatRooms);
    }
  }, [chatRooms]);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);
  const onUserBlock = () => {
    if (!localUserData.blockedUser) {
      /* eslint-disable no-unused-expressions */
      !confirmBlockUser ? setConfirmBlockUser(true) : setLocalUserData({ ...localUserData, blockedUser: true });
    } else {
      setLocalUserData({ ...localUserData, blockedUser: false });
    }
  };

  const onUserReport = () => {
    setConfirmReportUser(true);
  };

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

  const renderMessage = useCallback((item, index) => {
    const prevElement = collection[index - 1];
    const nextElement = collection[index + 1];

    const prevSameUser = prevElement?.mine === item.mine;
    const nextSameUser = prevElement?.mine === item.mine;

    const content = (
      <SMessage id={index === 0 ? 'first-element' : `message-${index}`} key={randomID()} mine={item.mine}>
        {!nextSameUser && (
          <SUserAvatar
            mine={item.mine}
            avatarUrl={!item.mine && chatUser && chatUser.avatarUrl ? chatUser.avatarUrl : user.userData?.avatarUrl}
          />
        )}
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
          <SMessage key={randomID()} type="info">
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
  }, [chatUser, collection, t, user.userData?.avatarUrl]);

  useEffect(() => {
    scroller.scrollTo('first-element', {
      smooth: 'easeInOutQuart',
      duration: SCROLL_TO_FIRST_MESSAGE,
      containerId: 'messagesScrollContainer',
    });
  }, [collection.length]);

  const clickHandler = () => {
    if (showChatList) {
      showChatList();
    }
  };

  return (
    <SContainer>
      {chatUser && (
        <STopPart>
          {isMobileOrTablet && <GoBackButton onClick={clickHandler} />}
          <SUserData>
            <SUserName>
              {chatUser.nickname}
              {localUserData.isAnnouncement && t('announcement.title')}
            </SUserName>
            <SUserAlias>{!localUserData.isAnnouncement ? `@${chatUser.username}` : `500 members`}</SUserAlias>
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
                onUserReport={onUserReport}
                isAnnouncement={localUserData.isAnnouncement}
              />
            )}
            {isMobile && ellipseMenuOpen ? (
              <ChatEllipseModal
                isOpen={ellipseMenuOpen}
                zIndex={11}
                onClose={handleCloseEllipseMenu}
                userBlocked={localUserData?.blockedUser}
                onUserBlock={onUserBlock}
                onUserReport={onUserReport}
                isAnnouncement={localUserData.isAnnouncement}
              />
            ) : null}
          </SActionsDiv>
        </STopPart>
      )}
      {localUserData.isAnnouncement && chatUser && (
        <SAnnouncementHeader>
          <SAnnouncementText>
            {t('announcement.top-message-start')} <SAnnouncementName>{chatUser.username}</SAnnouncementName>{' '}
            {t('announcement.top-message-end')}
          </SAnnouncementText>
        </SAnnouncementHeader>
      )}
      <SCenterPart id="messagesScrollContainer" ref={scrollRef}>
        {localUserData?.justSubscribed && chatUser && (
          <WelcomeMessage userAlias={chatUser.username ? chatUser.username : ''} />
        )}
        {collection.map(renderMessage)}
      </SCenterPart>
      <SBottomPart>
        {(localUserData.blockedUser === true || confirmBlockUser) && chatUser && (
          <BlockedUser
            confirmBlockUser={confirmBlockUser}
            isBlocked={localUserData.blockedUser}
            userName={chatUser.username ? chatUser.username : ''}
            onUserBlock={onUserBlock}
            closeModal={() => setConfirmBlockUser(false)}
            // isAnnouncement={isAnnouncement}
          />
        )}
        {localUserData.subscriptionExpired && chatUser && chatUser.uuid && <SubscriptionExpired user={chatUser} />}
        {localUserData.accountDeleted && <AccountDeleted />}
        {localUserData.messagingDisabled && chatUser && (
          <MessagingDisabled
            userName={chatUser.username ? chatUser.username : ''}
            userAlias={chatUser.nickname ? chatUser.nickname : ''}
          />
        )}

        {!localUserData.blockedUser &&
          !localUserData.subscriptionExpired &&
          !localUserData.messagingDisabled &&
          !localUserData.accountDeleted &&
          !localUserData.isAnnouncement &&
          chatUser && (
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

        {confirmReportUser && (
          <ReportUserModal
            confirmReportUser={confirmReportUser}
            userName={chatUser && chatUser.username ? chatUser.username : ''}
            closeModal={() => setConfirmReportUser(false)}
            isAnnouncement={localUserData.isAnnouncement}
          />
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

interface ISUserAvatar {
  mine?: boolean;
}
const SUserAvatar = styled(UserAvatar)<ISUserAvatar>`
  position: absolute;
  bottom: 0;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  padding: 0;
  display: none;

  ${(props) => {
    if (props.mine) {
      return css`
        right: 0;
      `;
    }
    return css`
      left: 0;
    `;
  }}

  ${(props) => props.theme.media.tablet} {
    display: block;
  }
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

  ${(props) => {
    if (props.type !== 'info') {
      if (props.mine) {
        return css`
          ${props.theme.media.tablet} {
            padding-right: 44px;
          }
        `;
      }
      return css`
        ${props.theme.media.tablet} {
          padding-left: 44px;
        }
      `;
    }
    return css``;
  }}
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => {
    if (props.type === 'info') {
      return 'center';
    }
    if (props.mine) {
      return 'flex-end';
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

const SAnnouncementHeader = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const SAnnouncementText = styled.div`
  text-align: center;
  font-size: 14px;
  padding: 12px 24px;
  margin-top: 16px;
  margin-bottom: 16px;
  border-radius: 16px;
  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.tertiary};
`;

const SAnnouncementName = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
