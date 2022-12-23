import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useMemo,
} from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { toNumber } from 'lodash';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

import Text from '../../../atoms/Text';
import UserAvatar from '../../UserAvatar';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import InlineSVG from '../../../atoms/InlineSVG';
import TextArea from '../../../atoms/chat/TextArea';
import { useAppSelector } from '../../../../redux-store/store';

import sendIcon from '../../../../public/images/svg/icons/filled/Send.svg';
import chevronLeftIcon from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import { SocketContext } from '../../../../contexts/socketContext';
import { ChannelsContext } from '../../../../contexts/channelsContext';
import {
  getMessages,
  getRoom,
  markRoomAsRead,
  sendMessage,
} from '../../../../api/endpoints/chat';
import isBrowser from '../../../../utils/isBrowser';
import getDisplayname from '../../../../utils/getDisplayname';
import validateInputText from '../../../../utils/validateMessageText';
import { useGetBlockedUsers } from '../../../../contexts/blockedUsersContext';

const AccountDeleted = dynamic(() => import('../../chat/AccountDeleted'));
const MessagingDisabled = dynamic(() => import('../../chat/MessagingDisabled'));
const BlockedUser = dynamic(() => import('../../chat/BlockedUser'));
const SubscriptionExpired = dynamic(
  () => import('../../chat/SubscriptionExpired')
);

interface IChat {
  roomID: string;
}

export const Chat: React.FC<IChat> = ({ roomID }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Creator');
  const router = useRouter();

  const { ref: scrollRef, inView } = useInView();
  const { user, ui } = useAppSelector((state) => state);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(ui.resizeMode);
  const { usersIBlocked, usersBlockedMe, changeUserBlockedStatus } =
    useGetBlockedUsers();

  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);
  const [messageText, setMessageText] = useState<string>('');
  const [messageTextValid, setMessageTextValid] = useState(false);
  const [messages, setMessages] = useState<newnewapi.IChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<
    newnewapi.IChatMessage | null | undefined
  >();
  const [messagesNextPageToken, setMessagesNextPageToken] = useState<
    string | undefined | null
  >('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  const [chatRoom, setChatRoom] = useState<newnewapi.ChatRoom | undefined>();
  const [chatRoomLoading, setChatRoomLoading] = useState<boolean>(false);
  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [isSubscriptionExpired, setIsSubscriptionExpired] =
    useState<boolean>(false);

  const getChatMessages = useCallback(
    async (pageToken?: string) => {
      if (messagesLoading) return;
      try {
        if (!pageToken) setMessages([]);
        setMessagesLoading(true);
        const payload = new newnewapi.GetMessagesRequest({
          roomId: toNumber(roomID),
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });
        const res = await getMessages(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        if (res.data && res.data.messages.length > 0) {
          setMessages((curr) => {
            const arr = [
              ...curr,
              ...(res.data?.messages as newnewapi.ChatMessage[]),
            ];
            return arr;
          });
          setMessagesNextPageToken(res.data.paging?.nextPageToken);
        }
        setMessagesLoading(false);
      } catch (err) {
        console.error(err);
        setMessagesLoading(false);
      }
    },
    [messagesLoading, roomID]
  );

  const fetchChatRoom = useCallback(async () => {
    if (chatRoomLoading) return;
    try {
      setChatRoomLoading(true);
      const payload = new newnewapi.GetRoomRequest({
        roomId: toNumber(roomID),
      });
      const res = await getRoom(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      if (res.data) {
        setChatRoom(res.data);
      }
      setChatRoomLoading(false);
    } catch (err) {
      console.error(err);
      setChatRoomLoading(false);
    }
  }, [chatRoomLoading, roomID]);

  async function markChatAsRead() {
    try {
      const payload = new newnewapi.MarkRoomAsReadRequest({
        roomId: toNumber(roomID),
      });
      const res = await markRoomAsRead(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    getChatMessages();
    addChannel(`chat_${roomID.toString()}`, {
      chatRoomUpdates: {
        chatRoomId: toNumber(roomID),
      },
    });
    return () => {
      removeChannel(`chat_${roomID.toString()}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chatRoom) {
      fetchChatRoom();
    } else if (!chatRoom?.visavis?.isSubscriptionActive) {
      setIsSubscriptionExpired(true);
    }

    if (chatRoom?.unreadMessageCount && chatRoom?.unreadMessageCount > 0)
      markChatAsRead();
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
      socketConnection?.on('ChatMessageCreated', socketHandlerMessageCreated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off(
          'ChatMessageCreated',
          socketHandlerMessageCreated
        );
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

  const messagesScrollContainerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (newMessage && isBrowser()) {
      setTimeout(() => {
        messagesScrollContainerRef.current?.scrollBy({
          top: messagesScrollContainerRef.current?.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [newMessage]);

  const handleSubmit = useCallback(() => {
    if (!sendingMessage) submitMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageText, sendingMessage]);

  const handleChange = useCallback(
    (id: string, value: string, isShiftEnter: boolean) => {
      if (
        value.charCodeAt(value.length - 1) === 10 &&
        !isShiftEnter &&
        !isMobileOrTablet
      ) {
        setMessageText(value.slice(0, -1));
        handleSubmit();
        return;
      }

      const isValid = validateInputText(value);
      setMessageTextValid(isValid);
      setMessageText(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messageText, isMobileOrTablet, handleSubmit]
  );

  const submitMessage = useCallback(async () => {
    if (chatRoom && messageTextValid) {
      const tmpMsgText = messageText.trim();
      try {
        setSendingMessage(true);
        setMessageText('');
        const payload = new newnewapi.SendMessageRequest({
          roomId: chatRoom.id,
          content: {
            text: tmpMsgText,
          },
        });
        const res = await sendMessage(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data.message) {
          setMessages([res.data.message].concat(messages));
        }
        setSendingMessage(false);
      } catch (err) {
        console.error(err);
        setSendingMessage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom?.id, messageTextValid, messageText]);

  const handleGoBack = useCallback(() => {
    router.push('/creator/dashboard?tab=chat');
  }, [router]);

  const renderMessage = useCallback(
    (item: newnewapi.IChatMessage, index: number) => {
      const prevElement = messages[index - 1];
      const nextElement = messages[index + 1];

      const isMine = item.sender?.uuid === user.userData?.userUuid;

      const prevSameUser = prevElement?.sender?.uuid === item.sender?.uuid;
      const nextSameUser = nextElement?.sender?.uuid === item.sender?.uuid;

      const content = (
        <SMessage
          id={item.id?.toString()}
          mine={isMine}
          prevSameUser={prevSameUser}
        >
          <SMessageContent
            mine={isMine}
            prevSameUser={prevSameUser}
            nextSameUser={nextSameUser}
          >
            <SMessageText mine={isMine} weight={600} variant={3}>
              {item.content?.text}
            </SMessageText>
          </SMessageContent>
          {index === messages.length - 1 && (
            <SRef ref={scrollRef}>Loading...</SRef>
          )}
        </SMessage>
      );
      if (
        item.createdAt?.seconds &&
        nextElement?.createdAt?.seconds &&
        moment((item.createdAt?.seconds as number) * 1000).format(
          'DD.MM.YYYY'
        ) !==
          moment((nextElement?.createdAt?.seconds as number) * 1000).format(
            'DD.MM.YYYY'
          )
      ) {
        let date = moment((item.createdAt?.seconds as number) * 1000).format(
          'MMM DD'
        );
        if (date === moment().format('MMM DD')) {
          date = t('chat.today');
        }

        return (
          <React.Fragment key={item.id?.toString()}>
            {content}
            <SMessage type='info'>
              <SMessageContent
                type='info'
                prevSameUser={prevElement?.sender?.uuid === item.sender?.uuid}
                nextSameUser={nextElement?.sender?.uuid === item.sender?.uuid}
              >
                <SMessageText type='info' weight={600} variant={3}>
                  {date}
                </SMessageText>
              </SMessageContent>
            </SMessage>
          </React.Fragment>
        );
      }
      if (item.createdAt?.seconds && !nextElement) {
        const date = moment((item.createdAt?.seconds as number) * 1000).format(
          'MMM DD'
        );
        return (
          <React.Fragment key={item.id?.toString()}>
            {content}
            <SMessage type='info'>
              <SMessageContent
                type='info'
                prevSameUser={prevElement?.sender?.uuid === item.sender?.uuid}
              >
                <SMessageText type='info' weight={600} variant={3}>
                  {date}
                </SMessageText>
              </SMessageContent>
            </SMessage>
          </React.Fragment>
        );
      }

      return (
        <React.Fragment key={item.id?.toString()}>{content}</React.Fragment>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      roomID,
      t,
      user.userData?.avatarUrl,
      user.userData?.userUuid,
      messages,
      chatRoom,
    ]
  );

  const handleUserClick = useCallback(() => {
    if (chatRoom?.visavis?.user?.username) {
      router.push(`/${chatRoom?.visavis?.user?.username}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageText, chatRoom?.visavis?.user?.username]);

  const isVisavisBlocked = useMemo(
    () => usersIBlocked.includes(chatRoom?.visavis?.user?.uuid ?? ''),
    [chatRoom?.visavis?.user?.uuid, usersIBlocked]
  );

  const isMessagingDisabled = useMemo(
    () => usersBlockedMe.includes(chatRoom?.visavis?.user?.uuid ?? ''),
    [chatRoom?.visavis?.user?.uuid, usersBlockedMe]
  );

  const isTextareaHidden = useMemo(() => {
    if (chatRoom?.kind !== newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE) {
      return (
        isMessagingDisabled ||
        isVisavisBlocked ||
        isSubscriptionExpired ||
        chatRoom?.visavis?.user?.options?.isTombstone ||
        !chatRoom
      );
    }
    return false;
  }, [isVisavisBlocked, isSubscriptionExpired, isMessagingDisabled, chatRoom]);

  const onUserBlock = useCallback(() => {
    if (!isVisavisBlocked) {
      if (!confirmBlockUser) setConfirmBlockUser(true);
    } else {
      changeUserBlockedStatus(chatRoom?.visavis?.user?.uuid, false);
    }
  }, [
    isVisavisBlocked,
    confirmBlockUser,
    chatRoom?.visavis?.user?.uuid,
    changeUserBlockedStatus,
  ]);

  const whatComponentToDisplay = useCallback(() => {
    if (chatRoom?.visavis?.user?.options?.isTombstone)
      return <AccountDeleted />;

    if (isMessagingDisabled && chatRoom?.visavis?.user)
      return <MessagingDisabled user={chatRoom.visavis.user} />;

    if (
      isSubscriptionExpired &&
      chatRoom?.visavis?.user?.uuid &&
      chatRoom.myRole
    )
      return (
        <SubscriptionExpired
          user={chatRoom.visavis.user}
          myRole={chatRoom.myRole}
        />
      );
    return null;
  }, [
    isMessagingDisabled,
    chatRoom?.visavis?.user,
    isSubscriptionExpired,
    chatRoom?.myRole,
  ]);

  return (
    <SContainer>
      <STopPart>
        <SInlineSVG
          clickable
          svg={chevronLeftIcon}
          fill={theme.colorsThemed.text.secondary}
          width='24px'
          height='24px'
          onClick={handleGoBack}
        />
        {chatRoom?.kind === 4 ? (
          <SUserAvatar avatarUrl={user?.userData?.avatarUrl ?? ''} />
        ) : (
          <SUserAvatar
            withClick
            onClick={handleUserClick}
            avatarUrl={chatRoom?.visavis?.user?.avatarUrl ?? ''}
          />
        )}
        {chatRoom?.kind === 4 ? (
          <SUserDescription>
            <SUserNickName variant={3} weight={600}>
              {`${t('announcement.beforeName')} ${getDisplayname(
                user.userData
              )}${t('announcement.suffix')} ${t('announcement.afterName')}`}
            </SUserNickName>
            <SUserName variant={2} weight={600}>
              {`${
                chatRoom.memberCount && chatRoom.memberCount > 0
                  ? chatRoom.memberCount
                  : 0
              } ${
                chatRoom.memberCount && chatRoom.memberCount > 1
                  ? t('newAnnouncement.members')
                  : t('newAnnouncement.member')
              }`}
            </SUserName>
          </SUserDescription>
        ) : (
          <SUserDescription>
            <SUserNickName variant={3} weight={600}>
              {getDisplayname(chatRoom?.visavis?.user)}
              {chatRoom?.visavis?.user?.options?.isVerified && (
                <SInlineSVG
                  svg={VerificationCheckmark}
                  width='16px'
                  height='16px'
                  fill='none'
                />
              )}
            </SUserNickName>
            <Link href={`/${chatRoom?.visavis?.user?.username}`}>
              <a>
                <SUserName variant={2} weight={600}>
                  @{chatRoom?.visavis?.user?.username}
                </SUserName>
              </a>
            </Link>
          </SUserDescription>
        )}
      </STopPart>
      <SCenterPart
        id='messagesScrollContainer'
        ref={(el) => {
          messagesScrollContainerRef.current = el!!;
        }}
      >
        {messages.length > 0 && messages.map(renderMessage)}
      </SCenterPart>
      <SBottomPart>
        {(isVisavisBlocked === true || confirmBlockUser) &&
          chatRoom &&
          chatRoom.visavis && (
            <BlockedUser
              confirmBlockUser={confirmBlockUser}
              isBlocked={isVisavisBlocked}
              user={chatRoom.visavis}
              onUserBlock={onUserBlock}
              closeModal={() => setConfirmBlockUser(false)}
            />
          )}
        {!isTextareaHidden ? (
          <SBottomTextarea>
            <STextArea>
              <TextArea
                isDashboard
                maxlength={500}
                value={messageText}
                onChange={handleChange}
                placeholder={t('chat.placeholder')}
                gotMaxLength={handleSubmit}
              />
            </STextArea>
            <SButton
              withShadow
              view={messageTextValid ? 'primaryGrad' : 'secondary'}
              onClick={handleSubmit}
              disabled={!messageTextValid}
            >
              <SInlineSVG
                svg={sendIcon}
                fill={
                  messageTextValid
                    ? theme.colors.white
                    : theme.colorsThemed.text.primary
                }
                width='24px'
                height='24px'
              />
            </SButton>
          </SBottomTextarea>
        ) : (
          whatComponentToDisplay()
        )}
      </SBottomPart>
    </SContainer>
  );
};

export default Chat;

const SContainer = styled.div`
  height: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
`;

const STopPart = styled.div`
  display: flex;
  padding: 0 24px;
  align-items: center;
  flex-direction: row;
`;

const SCenterPart = styled.div`
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

const STextArea = styled.div`
  flex: 1;
  border-radius: 16px;
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
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.button.background.secondary};
  }
`;

const SUserAvatar = styled(UserAvatar)`
  margin: 0 12px;
`;

const SUserDescription = styled.div`
  display: flex;
  flex-direction: column;
`;

const SUserNickName = styled(Text)`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
`;

const SUserName = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
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
        `;
      }
      return css`
        ${props.theme.media.mobile} {
          padding-left: 0;
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
  margin-bottom: 8px;
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
      border-radius: 16px 16px 8px 16px;
    `;
  }}
`;

interface ISMessageText {
  type?: string;
  mine?: boolean;
}

const SMessageText = styled(Text)<ISMessageText>`
  line-height: 20px;
  max-width: 80vw;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  color: ${(props) => {
    if (props.type === 'info') {
      return props.theme.colorsThemed.text.tertiary;
    }

    if (props.mine && props.theme.name === 'light') {
      return props.theme.colors.white;
    }

    return props.theme.colorsThemed.text.primary;
  }};

  ${({ theme }) => theme.media.tablet} {
    max-width: 412px;
  }
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;
const SBottomTextarea = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;
