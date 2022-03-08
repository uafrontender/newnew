import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled, { css, useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { toNumber } from 'lodash';

import { getBlockedUsers } from '../../../contexts/blockedUsersContext';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import TextArea from '../../atoms/chat/TextArea';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import { IChatData } from '../../interfaces/ichat';
import { useAppSelector } from '../../../redux-store/store';
import { SUserAlias } from '../../atoms/chat/styles';
import GoBackButton from '../GoBackButton';
import randomID from '../../../utils/randomIdGenerator';
import { sendMessage, getMessages } from '../../../api/endpoints/chat';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';
import { markUser } from '../../../api/endpoints/user';
import { getSubscriptions } from '../../../contexts/subscriptionsContext';

const ChatEllipseMenu = dynamic(() => import('./ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('./ChatEllipseModal'));
const BlockedUser = dynamic(() => import('./BlockedUser'));
const AccountDeleted = dynamic(() => import('./AccountDeleted'));
const SubscriptionExpired = dynamic(() => import('./SubscriptionExpired'));
const MessagingDisabled = dynamic(() => import('./MessagingDisabled'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));
const ReportUserModal = dynamic(() => import('./ReportUserModal'));

const ChatArea: React.FC<IChatData> = ({ chatRoom, showChatList, newMessage }) => {
  const theme = useTheme();
  const { t } = useTranslation('chat');
  // const scrollRef: any = useRef();

  const { ref: scrollRef, inView } = useInView();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const { usersIBlocked, usersBlockedMe, unblockUser } = getBlockedUsers();
  const { mySubscribers } = getSubscriptions();

  const [messageText, setMessageText] = useState<string>('');
  const [messages, setMessages] = useState<newnewapi.IChatMessage[]>([]);
  const [isVisavisBlocked, setIsVisavisBlocked] = useState<boolean>(false);
  const [isMessagingDisabled, setIsMessagingDisabled] = useState<boolean>(false);
  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);

  const [localUserData, setLocalUserData] = useState({
    justSubscribed: false,
    blockedUser: false,
    isAnnouncement: false,
    subscriptionExpired: false,
    messagingDisabled: false,
    accountDeleted: false,
  });

  const [isAnnouncement, setIsAnnouncement] = useState<boolean>(false);
  const [isMyAnnouncement, setIsMyAnnouncement] = useState<boolean>(false);

  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

  const [messagesNextPageToken, setMessagesNextPageToken] = useState<string | undefined | null>('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  const getChatMessages = useCallback(
    async (pageToken?: string) => {
      if (messagesLoading) return;
      try {
        if (!pageToken) setMessages([]);
        setMessagesLoading(true);
        const payload = new newnewapi.GetMessagesRequest({
          roomId: chatRoom?.id,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });
        const res = await getMessages(payload);

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        if (res.data && res.data.messages.length > 0) {
          setMessages((curr) => {
            const arr = [...curr, ...(res.data?.messages as newnewapi.ChatMessage[])];
            return arr;
          });
          setMessagesNextPageToken(res.data.paging?.nextPageToken);
          setLocalUserData({ ...localUserData, justSubscribed: false });
        }
        setMessagesLoading(false);
      } catch (err) {
        console.error(err);
        setMessagesLoading(false);
      }
    },
    [messagesLoading, chatRoom, localUserData]
  );

  useEffect(() => {
    if (chatRoom) {
      setLocalUserData((data) => ({ ...data, ...chatRoom.visavis }));

      if (!chatRoom.lastMessage) setLocalUserData({ ...localUserData, justSubscribed: true });
      getChatMessages();
      if (chatRoom.kind === 4) {
        setIsAnnouncement(true);
        if (chatRoom.myRole === 2) setIsMyAnnouncement(true);
      } else {
        setIsAnnouncement(false);
        setIsMyAnnouncement(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom]);

  useEffect(() => {
    if (inView && !messagesLoading && messagesNextPageToken) {
      getChatMessages(messagesNextPageToken);
    }
  }, [inView, messagesLoading, messagesNextPageToken, getChatMessages]);

  useEffect(() => {
    if (usersIBlocked.length > 0 && chatRoom) {
      const isBlocked = usersIBlocked.find((i) => i === chatRoom?.visavis?.uuid);
      if (isBlocked) {
        setIsVisavisBlocked(true);
      }
    }
    if (isVisavisBlocked) setIsVisavisBlocked(false);
  }, [usersIBlocked, chatRoom, isVisavisBlocked]);

  useEffect(() => {
    if (usersBlockedMe.length > 0 && chatRoom) {
      const isBlocked = usersBlockedMe.find((i) => i === chatRoom?.visavis?.uuid);
      if (isBlocked) {
        setIsMessagingDisabled(true);
      }
    }
    if (isMessagingDisabled) setIsMessagingDisabled(false);
  }, [usersBlockedMe, chatRoom, isMessagingDisabled]);

  useEffect(() => {
    if (newMessage) {
      setMessages((curr) => [newMessage, ...curr]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  async function unblockUserRequest() {
    try {
      const payload = new newnewapi.MarkUserRequest({
        markAs: 4,
        userUuid: chatRoom?.visavis?.uuid,
      });
      const res = await markUser(payload);
      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
      unblockUser(chatRoom?.visavis?.uuid!!);
    } catch (err) {
      console.error(err);
    }
  }

  const onUserBlock = () => {
    if (!isVisavisBlocked) {
      if (!confirmBlockUser) setConfirmBlockUser(true);
    } else {
      unblockUserRequest();
    }
  };

  const onUserReport = () => {
    setConfirmReportUser(true);
  };

  const handleChange = useCallback((id, value) => {
    setMessageText(value);
  }, []);

  const submitMessage = useCallback(async () => {
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
        if (res.data.message) setMessages([res.data.message].concat(messages));

        setMessageText('');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageText]);

  const renderMessage = useCallback(
    (item: newnewapi.IChatMessage, index) => {
      const prevElement = messages[index - 1];
      const nextElement = messages[index + 1];

      const isMine = item.sender?.uuid === user.userData?.userUuid;

      const prevSameUser = prevElement?.sender?.uuid === item.sender?.uuid;
      const nextSameUser = nextElement?.sender?.uuid === item.sender?.uuid;

      const content = (
        <>
          <SMessage
            id={item.id ? item.id.toString() : randomID()}
            key={randomID()}
            mine={isMine}
            prevSameUser={prevSameUser}
          >
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
          {index === messages.length - 1 && <SRef ref={scrollRef}>Loading...</SRef>}
        </>
      );

      if (
        item.createdAt?.seconds &&
        nextElement?.createdAt?.seconds &&
        moment(toNumber(item.createdAt?.seconds)).format('DD.MM.YYYY') !==
          moment(toNumber(nextElement?.createdAt?.seconds)).format('DD.MM.YYYY')
      ) {
        let date = moment(toNumber(item.createdAt?.seconds)).format('MMM DD');

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
    [chatRoom, t, user.userData?.avatarUrl, user.userData?.userUuid, messages, scrollRef]
  );

  const clickHandler = () => {
    if (showChatList) {
      showChatList();
    }
  };

  const isTextareaHidden = useCallback(() => {
    if (
      isVisavisBlocked ||
      localUserData.subscriptionExpired ||
      isMessagingDisabled ||
      localUserData.accountDeleted ||
      !chatRoom
    ) {
      return false;
    }
    if (isAnnouncement && !isMyAnnouncement) {
      return false;
    }
    return true;
  }, [
    isVisavisBlocked,
    localUserData.subscriptionExpired,
    isMessagingDisabled,
    localUserData.accountDeleted,
    isAnnouncement,
    isMyAnnouncement,
    chatRoom,
  ]);

  return (
    <SContainer>
      {chatRoom && (
        <STopPart>
          {isMobileOrTablet && <GoBackButton onClick={clickHandler} />}
          <SUserData>
            <SUserName>
              {isMyAnnouncement ? user.userData?.nickname : chatRoom.visavis?.nickname}
              {isAnnouncement && t('announcement.title')}
            </SUserName>
            <SUserAlias>
              {!isMyAnnouncement
                ? `@${chatRoom.visavis?.username}`
                : `${mySubscribers.length} ${
                    mySubscribers.length > 1 ? t('new-announcement.members') : t('new-announcement.member')
                  }`}
            </SUserAlias>
          </SUserData>
          <SActionsDiv>
            {!isMyAnnouncement && (
              <SMoreButton view="transparent" iconOnly onClick={() => handleOpenEllipseMenu()}>
                <InlineSVG svg={MoreIconFilled} fill={theme.colorsThemed.text.secondary} width="20px" height="20px" />
              </SMoreButton>
            )}
            {/* Ellipse menu */}
            {!isMobile && chatRoom.visavis && (
              <ChatEllipseMenu
                myRole={chatRoom.myRole ? chatRoom.myRole : 0}
                user={chatRoom.visavis}
                isVisible={ellipseMenuOpen}
                handleClose={handleCloseEllipseMenu}
                userBlocked={isVisavisBlocked}
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
                userBlocked={isVisavisBlocked}
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
      <SCenterPart id="messagesScrollContainer">
        {localUserData?.justSubscribed && chatRoom && !isMyAnnouncement && (
          <WelcomeMessage userAlias={chatRoom.visavis?.username ? chatRoom.visavis?.username : ''} />
        )}
        {messages.length > 0 && messages.map(renderMessage)}
      </SCenterPart>
      <SBottomPart>
        {(isVisavisBlocked === true || confirmBlockUser) && chatRoom && chatRoom.visavis && (
          <BlockedUser
            confirmBlockUser={confirmBlockUser}
            isBlocked={isVisavisBlocked}
            user={chatRoom.visavis}
            onUserBlock={onUserBlock}
            closeModal={() => setConfirmBlockUser(false)}
            // isAnnouncement={isAnnouncement}
          />
        )}
        {localUserData.subscriptionExpired && chatRoom && chatRoom.visavis?.uuid && (
          <SubscriptionExpired user={chatRoom.visavis} />
        )}
        {localUserData.accountDeleted && <AccountDeleted />}
        {isMessagingDisabled && chatRoom && chatRoom.visavis && <MessagingDisabled user={chatRoom.visavis} />}

        {isTextareaHidden() && (
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
            user={chatRoom && chatRoom.visavis!!}
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
  padding: 0 12px;
  position: relative;
  ${({ theme }) => theme.media.tablet} {
    padding: 0 24px;
  }
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
  prevSameUser?: boolean;
}

const SMessage = styled.div<ISMessage>`
  width: 100%;
  position: relative;

  ${(props) => {
    if (props.type !== 'info') {
      if (props.mine) {
        return css`
          ${props.theme.media.mobile} {
            justify-content: flex-end;
          }
          ${props.theme.media.tablet} {
            padding-right: 0;
            padding-left: 44px;
            justify-content: flex-start;
          }
        `;
      }
      return css`
        ${props.theme.media.mobile} {
          padding-left: 0;
        }
        ${props.theme.media.tablet} {
          justify-content: flex-start;
          padding-left: 44px;
        }
      `;
    }
    return css`
      justify-content: center;
    `;
  }}

  ${(props) => {
    if (!props.prevSameUser && props.type !== 'info') {
      return css`
        margin-bottom: 8px;
      `;
    }
    return css`
      margin-bottom: 0;
    `;
  }}
  display: flex;
  flex-direction: row;
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
          border-radius: 16px 16px 16px 8px;
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
      return css`
        border-radius: 16px 16px 16px 8px;
      `;
    }

    if (props.type === 'info') {
      return css`
        margin: 8px 0;
      `;
    }

    return css`
      border-radius: 16px 16px 16px 8px;
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

const SRef = styled.span`
  text-indent: -9999px;
`;
