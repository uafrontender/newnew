/* eslint-disable consistent-return */
import React, { useState, useEffect, useCallback, useContext } from 'react';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled, { css, useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';

import sendIcon from '../../../../public/images/svg/icons/filled/Send.svg';
import { IChatData } from '../../../interfaces/ichat';
import { useAppSelector } from '../../../../redux-store/store';
import { SocketContext } from '../../../../contexts/socketContext';
import { ChannelsContext } from '../../../../contexts/channelsContext';
import { getMessages, sendMessage } from '../../../../api/endpoints/chat';
import GoBackButton from '../../GoBackButton';
import { SUserAlias } from '../../../atoms/chat/styles';
import InlineSVG from '../../../atoms/InlineSVG';
import Text from '../../../atoms/Text';
import TextArea from '../../../atoms/chat/TextArea';
import Button from '../../../atoms/Button';
import UserAvatar from '../../UserAvatar';

const MobileChatArea: React.FC<IChatData> = ({ chatRoom, showChatList }) => {
  const theme = useTheme();
  const { t } = useTranslation('creator');

  const { ref: scrollRef, inView } = useInView();
  const user = useAppSelector((state) => state.user);

  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  const [messageText, setMessageText] = useState<string>('');
  const [messages, setMessages] = useState<newnewapi.IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<newnewapi.IChatMessage | null | undefined>();

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

  const [messagesNextPageToken, setMessagesNextPageToken] = useState<string | undefined | null>('');
  const [messagesLoading, setMessagesLoading] = useState(false);

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
      if (chatRoom.id) {
        addChannel(`chat_${chatRoom.id.toString()}`, {
          chatRoomUpdates: {
            chatRoomId: chatRoom.id,
          },
        });
      }
      return () => {
        if (chatRoom.id) removeChannel(`chat_${chatRoom.id.toString()}`);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom]);

  useEffect(() => {
    const socketHandlerMessageCreated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.ChatMessageCreated.decode(arr);
      if (decoded) {
        setNewMessage(decoded.newMessage);
      }
    };
    if (socketConnection) {
      socketConnection.on('ChatMessageCreated', socketHandlerMessageCreated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('ChatMessageCreated', socketHandlerMessageCreated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  useEffect(() => {
    if (inView && !messagesLoading && messagesNextPageToken) {
      getChatMessages(messagesNextPageToken);
    }
  }, [inView, messagesLoading, messagesNextPageToken, getChatMessages]);

  useEffect(() => {
    if (newMessage) {
      setMessages((curr) => {
        if (curr.length === 0) {
          return [newMessage, ...curr];
        }
        if (curr[0]?.id !== newMessage.id) {
          return [newMessage, ...curr];
        }
        return curr;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

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
        <SMessage id={item.id?.toString()} mine={isMine} prevSameUser={prevSameUser}>
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
          {index === messages.length - 1 && <SRef ref={scrollRef}>Loading...</SRef>}
        </SMessage>
      );
      if (
        item.createdAt?.seconds &&
        nextElement?.createdAt?.seconds &&
        moment((item.createdAt?.seconds as number) * 1000).format('DD.MM.YYYY') !==
          moment((nextElement?.createdAt?.seconds as number) * 1000).format('DD.MM.YYYY')
      ) {
        let date = moment((item.createdAt?.seconds as number) * 1000).format('MMM DD');
        if (date === moment().format('MMM DD')) {
          date = t('chat.today');
        }

        return (
          <React.Fragment key={item.id?.toString()}>
            {content}
            <SMessage type="info">
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
          </React.Fragment>
        );
      }
      if (item.createdAt?.seconds && !nextElement) {
        const date = moment((item.createdAt?.seconds as number) * 1000).format('MMM DD');
        return (
          <React.Fragment key={item.id?.toString()}>
            {content}
            <SMessage type="info">
              <SMessageContent type="info" prevSameUser={prevElement?.sender?.uuid === item.sender?.uuid}>
                <SMessageText type="info" weight={600} variant={3}>
                  {date}
                </SMessageText>
              </SMessageContent>
            </SMessage>
          </React.Fragment>
        );
      }

      return <React.Fragment key={item.id?.toString()}>{content}</React.Fragment>;
    },
    [chatRoom, t, user.userData?.avatarUrl, user.userData?.userUuid, messages, scrollRef]
  );

  const clickHandler = () => {
    if (showChatList) {
      showChatList();
    }
  };

  const isTextareaHidden = useCallback(() => {
    if (!chatRoom) {
      return false;
    }
    if (isAnnouncement && !isMyAnnouncement) {
      return false;
    }
    return true;
  }, [isAnnouncement, isMyAnnouncement, chatRoom]);

  return (
    <SContainer>
      {chatRoom && (
        <STopPart>
          <GoBackButton onClick={clickHandler} />
          <SUserData>
            <SUserName>
              {isMyAnnouncement ? user.userData?.nickname : chatRoom.visavis?.nickname}
              {isAnnouncement && t('announcement.title')}
            </SUserName>
            <SUserAlias>
              {!isAnnouncement
                ? `@${chatRoom.visavis?.username}`
                : `${chatRoom.memberCount && chatRoom.memberCount > 0 ? chatRoom.memberCount : 0} ${
                    chatRoom.memberCount!! > 1 ? t('new-announcement.members') : t('new-announcement.member')
                  }`}
            </SUserAlias>
          </SUserData>
        </STopPart>
      )}
      <SCenterPart id="messagesScrollContainer">{messages.length > 0 && messages.map(renderMessage)}</SCenterPart>
      <SBottomPart>
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
      </SBottomPart>
    </SContainer>
  );
};

export default MobileChatArea;

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
const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;
