import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import moment from 'moment';
// import { scroller } from 'react-scroll';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled, { css, useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import TextArea from '../../atoms/creation/TextArea';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
// import { SCROLL_TO_FIRST_MESSAGE } from '../../../constants/timings';
import { IChatData } from '../../interfaces/ichat';
import { useAppSelector } from '../../../redux-store/store';
import { SUserAlias } from '../../atoms/chat/styles';
import GoBackButton from '../GoBackButton';
import randomID from '../../../utils/randomIdGenerator';
import { sendMessage, getMessages } from '../../../api/endpoints/chat';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';

const ChatEllipseMenu = dynamic(() => import('./ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('./ChatEllipseModal'));
const BlockedUser = dynamic(() => import('./BlockedUser'));
const AccountDeleted = dynamic(() => import('./AccountDeleted'));
const SubscriptionExpired = dynamic(() => import('./SubscriptionExpired'));
const MessagingDisabled = dynamic(() => import('./MessagingDisabled'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));
const ReportUserModal = dynamic(() => import('./ReportUserModal'));

const ChatArea: React.FC<IChatData> = ({ chatRoom, showChatList }) => {
  const [messageText, setMessageText] = useState<string>('');
  const [messages, setMessages] = useState<newnewapi.IChatMessage[]>([]);
  const [localUserData, setLocalUserData] = useState({
    justSubscribed: false,
    blockedUser: false,
    isAnnouncement: false,
    subscriptionExpired: false,
    messagingDisabled: false,
    accountDeleted: false,
  });

  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  const theme = useTheme();
  const { t } = useTranslation('chat');
  const scrollRef: any = useRef();

  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  useEffect(() => {
    async function getChatMessages() {
      try {
        const payload = new newnewapi.GetMessagesRequest({
          roomId: chatRoom?.id,
        });
        const res = await getMessages(payload);
        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        setMessages(res.data.messages);

        if (res.data.messages.length > 0) setLocalUserData({ ...localUserData, justSubscribed: false });
      } catch (err) {
        console.error(err);
      }
    }
    if (chatRoom) {
      setLocalUserData((data) => ({ ...data, ...chatRoom.visavis }));

      if (!chatRoom.lastMessage) setLocalUserData({ ...localUserData, justSubscribed: true });
      getChatMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom]);

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
    setMessageText(value);
  }, []);

  const submitMessage = useCallback(async () => {
    console.log(chatRoom, messageText);

    if (chatRoom && messageText.length > 0) {
      try {
        setSendingMessage(true);
        const payload = new newnewapi.SendMessageRequest({
          roomId: chatRoom.id,
          content: {
            text: messageText,
          },
        });
        const res = await sendMessage(payload);
        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

        setSendingMessage(false);
      } catch (err) {
        console.error(err);
        setSendingMessage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom?.id, messageText]);

  const handleSubmit = useCallback(() => {
    if (!sendingMessage) submitMessage();
    // setMessages({ ...messages, ...message });

    // setMessageText('');
    // setCollection([newItem, ...collection]);
    // }, [message, messages, sendingMessage, submitMessage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageText]);

  const renderMessage = useCallback(
    (item: newnewapi.IChatMessage, index) => {
      const prevElement = messages[index - 1];
      const nextElement = messages[index + 1];

      const isMine = item.sender?.uuid === user.userData?.userUuid;

      const prevSameUser = prevElement?.sender?.uuid === item.sender?.uuid;
      const nextSameUser = prevElement?.sender?.uuid === item.sender?.uuid;

      const content = (
        <SMessage id={index === 0 ? 'first-element' : `message-${index}`} key={randomID()} mine={isMine}>
          {!nextSameUser && (
            <SUserAvatar
              mine={isMine}
              avatarUrl={
                !isMine && chatRoom && chatRoom.visavis?.avatarUrl
                  ? chatRoom.visavis?.avatarUrl
                  : user.userData?.avatarUrl
              }
            />
          )}
          <SMessageContent mine={isMine} prevSameUser={prevSameUser} nextSameUser={nextSameUser}>
            <SMessageText mine={isMine} weight={600} variant={3}>
              {item.content?.text}
            </SMessageText>
          </SMessageContent>
        </SMessage>
      );

      if (
        moment(item.createdAt?.nanos).format('DD.MM.YYYY') !==
        moment(nextElement?.createdAt?.nanos).format('DD.MM.YYYY')
      ) {
        let date = moment(item.createdAt?.nanos).format('MMM DD');

        if (date === moment().format('MMM DD')) {
          date = t('chat.today');
        }

        return (
          <>
            {content}
            <SMessage key={randomID()} type="info">
              <SMessageContent
                type="info"
                prevSameUser={prevElement?.sender?.uuid === item.sender?.uuid}
                nextSameUser={nextElement?.sender?.uuid === item.sender?.uuid}
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
    [chatRoom, t, user.userData?.avatarUrl, user.userData?.userUuid, messages]
  );

  // useEffect(() => {
  //   scroller.scrollTo('first-element', {
  //     smooth: 'easeInOutQuart',
  //     duration: SCROLL_TO_FIRST_MESSAGE,
  //     containerId: 'messagesScrollContainer',
  //   });
  // }, [collection.length]);

  const clickHandler = () => {
    if (showChatList) {
      showChatList();
    }
  };

  return (
    <SContainer>
      {chatRoom && (
        <STopPart>
          {isMobileOrTablet && <GoBackButton onClick={clickHandler} />}
          <SUserData>
            <SUserName>
              {chatRoom.visavis?.nickname}
              {localUserData.isAnnouncement && t('announcement.title')}
            </SUserName>
            <SUserAlias>{!localUserData.isAnnouncement ? `@${chatRoom.visavis?.username}` : `500 members`}</SUserAlias>
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
      {localUserData.isAnnouncement && chatRoom && (
        <SAnnouncementHeader>
          <SAnnouncementText>
            {t('announcement.top-message-start')} <SAnnouncementName>{chatRoom.visavis?.username}</SAnnouncementName>{' '}
            {t('announcement.top-message-end')}
          </SAnnouncementText>
        </SAnnouncementHeader>
      )}
      <SCenterPart id="messagesScrollContainer" ref={scrollRef}>
        {localUserData?.justSubscribed && chatRoom && (
          <WelcomeMessage userAlias={chatRoom.visavis?.username ? chatRoom.visavis?.username : ''} />
        )}
        {messages.length > 0 && messages.map(renderMessage)}
      </SCenterPart>
      <SBottomPart>
        {(localUserData.blockedUser === true || confirmBlockUser) && chatRoom && (
          <BlockedUser
            confirmBlockUser={confirmBlockUser}
            isBlocked={localUserData.blockedUser}
            userName={chatRoom.visavis?.username ? chatRoom.visavis?.username : ''}
            onUserBlock={onUserBlock}
            closeModal={() => setConfirmBlockUser(false)}
            // isAnnouncement={isAnnouncement}
          />
        )}
        {localUserData.subscriptionExpired && chatRoom && chatRoom.visavis?.uuid && (
          <SubscriptionExpired user={chatRoom.visavis} />
        )}
        {localUserData.accountDeleted && <AccountDeleted />}
        {localUserData.messagingDisabled && chatRoom && (
          <MessagingDisabled
            userName={chatRoom.visavis?.username ? chatRoom.visavis?.username : ''}
            userAlias={chatRoom.visavis?.nickname ? chatRoom.visavis?.nickname : ''}
          />
        )}

        {!localUserData.blockedUser &&
          !localUserData.subscriptionExpired &&
          !localUserData.messagingDisabled &&
          !localUserData.accountDeleted &&
          !localUserData.isAnnouncement &&
          chatRoom && (
            <SBottomTextarea>
              <STextArea>
                <TextArea
                  maxlength={500}
                  value={messageText}
                  onChange={handleChange}
                  placeholder={t('chat.placeholder')}
                />
              </STextArea>
              <SButton
                withShadow
                view={messageText ? 'primaryGrad' : 'secondary'}
                onClick={handleSubmit}
                disabled={!messageText}
              >
                <SInlineSVG
                  svg={sendIcon}
                  fill={messageText ? theme.colors.white : theme.colorsThemed.text.primary}
                  width="24px"
                  height="24px"
                />
              </SButton>
            </SBottomTextarea>
          )}

        {confirmReportUser && (
          <ReportUserModal
            confirmReportUser={confirmReportUser}
            userName={chatRoom && chatRoom.visavis?.username ? chatRoom.visavis?.username : ''}
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
  left: 0;

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
            padding-left: 44px;
            justify-content: flex-start;
          }
        `;
      }
      return css`
        ${props.theme.media.tablet} {
          justify-content: flex-end;
        }
      `;
    }
    return css`
      justify-content: center;
    `;
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
