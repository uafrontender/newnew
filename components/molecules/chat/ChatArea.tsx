/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-nested-ternary */
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import dynamic from 'next/dynamic';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled, { css, useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import TextArea from '../../atoms/chat/TextArea';
import InlineSVG from '../../atoms/InlineSVG';
import { IChatData } from '../../interfaces/ichat';
import { useAppSelector } from '../../../redux-store/store';
import { SUserAlias } from '../../atoms/chat/styles';
import { sendMessage, getMessages } from '../../../api/endpoints/chat';

import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';
import { markUser } from '../../../api/endpoints/user';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { SocketContext } from '../../../contexts/socketContext';
import { reportUser } from '../../../api/endpoints/report';
import getDisplayname from '../../../utils/getDisplayname';
import isBrowser from '../../../utils/isBrowser';
import { getSubscriptionStatus } from '../../../api/endpoints/subscription';
import validateInputText from '../../../utils/validateMessageText';

const UserAvatar = dynamic(() => import('../UserAvatar'));
const ChatEllipseMenu = dynamic(() => import('./ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('./ChatEllipseModal'));
const BlockedUser = dynamic(() => import('./BlockedUser'));
const AccountDeleted = dynamic(() => import('./AccountDeleted'));
const SubscriptionExpired = dynamic(() => import('./SubscriptionExpired'));
const MessagingDisabled = dynamic(() => import('./MessagingDisabled'));
const WelcomeMessage = dynamic(() => import('./WelcomeMessage'));
const NoMessagesYet = dynamic(() => import('./NoMessagesYet'));
const ReportModal = dynamic(() => import('./ReportModal'));
const GoBackButton = dynamic(() => import('../GoBackButton'));

const ChatArea: React.FC<IChatData> = ({
  chatRoom,
  showChatList,
  updateLastMessage,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Chat');

  const { ref: scrollRef, inView } = useInView();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  const { usersIBlocked, usersBlockedMe, unblockUser } = useGetBlockedUsers();
  const [messageText, setMessageText] = useState<string>('');
  const [messageTextValid, setMessageTextValid] = useState(false);
  const [messages, setMessages] = useState<newnewapi.IChatMessage[]>([]);
  const [isVisavisBlocked, setIsVisavisBlocked] = useState<boolean>(false);
  const [isMessagingDisabled, setIsMessagingDisabled] =
    useState<boolean>(false);
  const [isSubscriptionExpired, setIsSubscriptionExpired] =
    useState<boolean>(false);
  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<
    newnewapi.IChatMessage | null | undefined
  >();
  // TODO: replace or abandon
  const mySubscribers: any[] = [];

  const [localUserData, setLocalUserData] = useState({
    justSubscribed: false,
    blockedUser: false,
    isAnnouncement: false,
    subscriptionExpired: false,
    // messagingDisabled: false,
    accountDeleted: false,
  });

  const [isAnnouncement, setIsAnnouncement] = useState<boolean>(false);
  const [isMyAnnouncement, setIsMyAnnouncement] = useState<boolean>(false);

  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

  const [messagesNextPageToken, setMessagesNextPageToken] = useState<
    string | undefined | null
  >('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const handleOpenEllipseMenu = () => setEllipseMenuOpen(true);
  const handleCloseEllipseMenu = () => setEllipseMenuOpen(false);

  useEffect(() => {
    async function fetchIsSubscribed() {
      try {
        const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
          creatorUuid:
            chatRoom && chatRoom.visavis ? chatRoom.visavis.user?.uuid : null,
        });

        const res = await getSubscriptionStatus(getStatusPayload);

        if (res.data?.status?.notSubscribed) {
          chatRoom!!.visavis?.user?.options?.isOfferingSubscription
            ? setIsSubscriptionExpired(true)
            : setIsMessagingDisabled(true);
        } else {
          setIsSubscriptionExpired(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (chatRoom && chatRoom.visavis) {
      if (chatRoom.myRole === 1) {
        fetchIsSubscribed();
      } else {
        // TODO: Load active sold bundles? Or abandon?
        const isMyActiveSub = mySubscribers.find(
          (sub) => sub.user?.uuid === chatRoom.visavis?.user?.uuid
        );
        if (!isMyActiveSub) setIsMessagingDisabled(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom]);

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

      if (!chatRoom.lastMessage)
        setLocalUserData({ ...localUserData, justSubscribed: true });
      getChatMessages();
      if (chatRoom.kind === 4) {
        setIsAnnouncement(true);
        /* eslint-disable no-unused-expressions */
        chatRoom.myRole === 2
          ? setIsMyAnnouncement(true)
          : setIsMyAnnouncement(false);
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
        if (updateLastMessage && chatRoom)
          updateLastMessage({ roomId: chatRoom.id });
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
    if (usersIBlocked.length > 0 && chatRoom) {
      const isBlocked = usersIBlocked.find(
        (i) => i === chatRoom?.visavis?.user?.uuid
      );

      if (isBlocked) {
        setIsVisavisBlocked(true);
      } else {
        if (isVisavisBlocked) setIsVisavisBlocked(false);
      }
    } else {
      if (isVisavisBlocked) setIsVisavisBlocked(false);
    }
  }, [usersIBlocked, chatRoom, isVisavisBlocked]);

  useEffect(() => {
    if (usersBlockedMe.length > 0 && chatRoom) {
      const isBlocked = usersBlockedMe.find(
        (i) => i === chatRoom?.visavis?.user?.uuid
      );
      if (isBlocked) {
        setIsMessagingDisabled(true);
      }
    }
  }, [usersBlockedMe, chatRoom]);

  useEffect(() => {
    if (newMessage && newMessage.roomId === chatRoom?.id) {
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

  async function unblockUserRequest() {
    try {
      const payload = new newnewapi.MarkUserRequest({
        markAs: 4,
        userUuid: chatRoom?.visavis?.user?.uuid,
      });
      const res = await markUser(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      if (chatRoom?.visavis?.user?.uuid)
        unblockUser(chatRoom.visavis.user?.uuid);
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
        if (updateLastMessage) updateLastMessage({ roomId: chatRoom.id });
      } catch (err) {
        console.error(err);
        setMessageText(tmpMsgText);
        setSendingMessage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom?.id, messageTextValid, messageText]);

  const handleSubmit = useCallback(() => {
    if (!sendingMessage) submitMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendingMessage, submitMessage]);

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

  const renderMessage = useCallback(
    (item: newnewapi.IChatMessage, index: number) => {
      const prevElement = messages[index - 1];
      const nextElement = messages[index + 1];

      const isMine = item.sender?.uuid === user.userData?.userUuid;

      const prevSameUser = prevElement?.sender?.uuid === item.sender?.uuid;
      const nextSameUser = nextElement?.sender?.uuid === item.sender?.uuid;

      const prevSameDay =
        !!prevElement?.createdAt &&
        !!item.createdAt &&
        moment((prevElement?.createdAt.seconds as number) * 1000).isSame(
          (item.createdAt.seconds as number) * 1000,
          'day'
        );

      const nextSameDay =
        !!nextElement?.createdAt &&
        !!item.createdAt &&
        moment((nextElement?.createdAt.seconds as number) * 1000).isSame(
          (item.createdAt.seconds as number) * 1000,
          'day'
        );

      const content = (
        <SMessage
          id={item.id?.toString()}
          mine={isMine}
          prevSameUser={prevSameUser}
        >
          {(!prevSameUser || !prevSameDay) &&
            (isMine ? (
              <SUserAvatar
                mine={isMine}
                avatarUrl={user.userData?.avatarUrl ?? ''}
              />
            ) : (
              <Link href={`/${chatRoom?.visavis?.user?.username}`}>
                <a>
                  <SUserAvatar
                    mine={isMine}
                    avatarUrl={chatRoom?.visavis?.user?.avatarUrl ?? ''}
                  />
                </a>
              </Link>
            ))}
          <SMessageContent
            mine={isMine}
            prevSameUser={prevSameUser}
            nextSameUser={nextSameUser}
            prevSameDay={prevSameDay}
            nextSameDay={nextSameDay}
          >
            <SMessageText mine={isMine} weight={600} variant={3}>
              {item.content?.text}
            </SMessageText>
          </SMessageContent>
          {index === messages.length - 2 && (
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
      if (!nextElement) {
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
    [
      chatRoom,
      t,
      user.userData?.avatarUrl,
      user.userData?.userUuid,
      messages,
      scrollRef,
    ]
  );

  const clickHandler = () => {
    if (showChatList) {
      showChatList();
    }
  };

  const isTextareaVisible = useCallback(() => {
    if (
      isMessagingDisabled ||
      isVisavisBlocked ||
      isSubscriptionExpired ||
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
    isSubscriptionExpired,
    isMessagingDisabled,
    localUserData.accountDeleted,
    isAnnouncement,
    isMyAnnouncement,
    chatRoom,
  ]);

  const moreButtonRef: any = useRef();

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

  return (
    <SContainer>
      {chatRoom && (
        <STopPart>
          {isMobileOrTablet && <GoBackButton onClick={clickHandler} />}
          <SUserData>
            <SUserName>
              {
                // eslint-disable-next-line no-nested-ternary
                isAnnouncement
                  ? t('announcement.title', {
                      username: isMyAnnouncement
                        ? user.userData?.nickname || user.userData?.username
                        : chatRoom.visavis?.user?.nickname ||
                          chatRoom.visavis?.user?.username,
                    })
                  : isMyAnnouncement
                  ? user.userData?.nickname || user.userData?.username
                  : chatRoom.visavis?.user?.nickname ||
                    chatRoom.visavis?.user?.username
              }
              {chatRoom.visavis?.user?.options?.isVerified &&
                !isAnnouncement && (
                  <SInlineSVG
                    svg={VerificationCheckmark}
                    width='16px'
                    height='16px'
                    fill='none'
                  />
                )}
            </SUserName>
            {!isAnnouncement && (
              <Link href={`/${chatRoom?.visavis?.user?.username}`}>
                <a style={{ display: 'flex' }}>
                  <SUserAlias>{`@${chatRoom.visavis?.user?.username}`}</SUserAlias>
                </a>
              </Link>
            )}
            {isAnnouncement && (
              <SUserAlias>
                {`${
                  chatRoom.memberCount && chatRoom.memberCount > 0
                    ? chatRoom.memberCount
                    : 0
                } ${
                  chatRoom.memberCount && chatRoom.memberCount > 1
                    ? t('newAnnouncement.members')
                    : t('newAnnouncement.member')
                }`}
              </SUserAlias>
            )}
          </SUserData>
          <SActionsDiv>
            {!isMyAnnouncement && (
              <SMoreButton
                view='transparent'
                iconOnly
                onClick={() => handleOpenEllipseMenu()}
                ref={moreButtonRef}
              >
                <InlineSVG
                  svg={MoreIconFilled}
                  fill={theme.colorsThemed.text.secondary}
                  width='20px'
                  height='20px'
                />
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
                anchorElement={moreButtonRef.current}
              />
            )}
            {isMobile && ellipseMenuOpen ? (
              <ChatEllipseModal
                isOpen={ellipseMenuOpen}
                zIndex={21}
                onClose={handleCloseEllipseMenu}
                userBlocked={isVisavisBlocked}
                onUserBlock={onUserBlock}
                onUserReport={onUserReport}
                visavis={chatRoom.visavis}
                isAnnouncement={localUserData.isAnnouncement}
              />
            ) : null}
          </SActionsDiv>
        </STopPart>
      )}
      {isAnnouncement && !isMyAnnouncement && chatRoom && (
        <SAnnouncementHeader>
          <SAnnouncementText>
            {t('announcement.topMessageStart')}{' '}
            <SAnnouncementName>
              {chatRoom.visavis?.user?.username}
            </SAnnouncementName>{' '}
            {t('announcement.topMessageEnd')}
          </SAnnouncementText>
        </SAnnouncementHeader>
      )}
      <SCenterPart
        id='messagesScrollContainer'
        ref={(el) => {
          messagesScrollContainerRef.current = el!!;
        }}
      >
        {localUserData?.justSubscribed &&
          chatRoom &&
          messages.length === 0 &&
          !isAnnouncement &&
          (chatRoom.myRole === 1 ? (
            <WelcomeMessage
              userAlias={
                chatRoom.visavis?.user?.username
                  ? chatRoom.visavis?.user?.username
                  : ''
              }
            />
          ) : (
            <NoMessagesYet />
          ))}
        {messages.length > 0 &&
          messages.map((item, index) => {
            if (index < messages.length) {
              return renderMessage(item, index);
            }
            return null;
          })}
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
              // isAnnouncement={isAnnouncement}
            />
          )}

        {localUserData.accountDeleted ? (
          <AccountDeleted />
        ) : chatRoom && chatRoom.visavis ? (
          isMessagingDisabled ? (
            <MessagingDisabled user={chatRoom.visavis.user!!} />
          ) : isSubscriptionExpired && chatRoom.visavis?.user?.uuid ? (
            <SubscriptionExpired />
          ) : null
        ) : null}

        {isTextareaVisible() && (
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
        )}
      </SBottomPart>
      {chatRoom?.visavis && (
        <ReportModal
          show={confirmReportUser}
          reportedDisplayname={getDisplayname(chatRoom.visavis?.user!!)}
          onClose={() => setConfirmReportUser(false)}
          onSubmit={async ({ reasons, message }) => {
            if (chatRoom?.visavis?.user?.uuid) {
              await reportUser(
                chatRoom.visavis.user?.uuid,
                reasons,
                message
              ).catch((e) => console.error(e));
            }
          }}
        />
      )}
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
  border-bottom: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
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
  display: flex;
  align-items: center;
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
  flex: 1;
  margin: 0 0 24px;
  display: flex;
  overflow-y: auto;
  flex-direction: column-reverse;
  padding: 0 12px;
  position: relative;
  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
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
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.button.background.secondary};
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
  margin-bottom: 8px;
`;

interface ISMessageContent {
  type?: string;
  mine?: boolean;
  prevSameUser?: boolean;
  nextSameUser?: boolean;
  prevSameDay?: boolean;
  nextSameDay?: boolean;
}

const SMessageContent = styled.div<ISMessageContent>`
  padding: ${(props) => (props.type === 'info' ? '12px 0 0' : '12px 16px')};
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
      if (props.prevSameUser && props.prevSameDay) {
        if (props.nextSameUser && props.nextSameDay) {
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

          ${props.theme.media.tablet} {
            border-radius: 16px;
          }
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

          ${props.theme.media.tablet} {
            border-radius: 16px 16px 16px 8px;
          }
        `;
      }
    } else {
      if (props.prevSameUser && props.prevSameDay) {
        if (props.nextSameUser && props.nextSameDay) {
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

          ${props.theme.media.tablet} {
            border-radius: 16px;
          }
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

          ${props.theme.media.tablet} {
            border-radius: 16px 16px 16px 8px;
          }
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

      ${props.theme.media.tablet} {
        border-radius: 16px 16px 16px 8px;
      }
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
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};
`;

const SAnnouncementName = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;
