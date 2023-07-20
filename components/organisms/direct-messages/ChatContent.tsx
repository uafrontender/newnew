import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { createGlobalStyle, useTheme } from 'styled-components';
import { useQueryClient } from 'react-query';

/* Contexts */
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';

/* API */
import { reportUser } from '../../../api/endpoints/report';
import { sendMessage } from '../../../api/endpoints/chat';

/* Utils */
import validateInputText from '../../../utils/validateMessageText';

/* Icons */
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';

/* Components */
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import TextArea from '../../atoms/direct-messages/TextArea';
import ChatContentHeader from '../../molecules/direct-messages/ChatContentHeader';
import { useGetChats } from '../../../contexts/chatContext';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import { SocketContext } from '../../../contexts/socketContext';
import useMyChatRoom from '../../../utils/hooks/useMyChatRoom';
import BlockUserModal from '../../molecules/direct-messages/BlockUserModal';
import ChatAreaCenter from '../../molecules/direct-messages/ChatAreaCenter';
import usePreventLayoutMoveOnInputFocusSafari from '../../../utils/hooks/usePreventLayoutMoveOnInputFocusSafari';
import useDisableTouchMoveSafari from '../../../utils/hooks/useDisableTouchMoveSafari';

const ReportModal = dynamic(
  () => import('../../molecules/direct-messages/ReportModal')
);
const BlockedUser = dynamic(
  () => import('../../molecules/direct-messages/BlockedUser')
);
const AccountDeleted = dynamic(
  () => import('../../molecules/direct-messages/AccountDeleted')
);

const MessagingDisabled = dynamic(
  () => import('../../molecules/direct-messages/MessagingDisabled')
);
const SubscriptionExpired = dynamic(
  () => import('../../molecules/direct-messages/SubscriptionExpired')
);

interface IFuncProps {
  chatRoom: newnewapi.IChatRoom;
  isBackButton?: boolean;
  isMoreButton?: boolean;
  withChatMessageAvatars?: boolean;
  withHeaderAvatar?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
  isHidden?: boolean;
  onBackButtonClick?: () => void;
}

const ChatContent: React.FC<IFuncProps> = ({
  chatRoom: initialChatRoom,
  isBackButton,
  isMoreButton,
  withChatMessageAvatars,
  withHeaderAvatar,
  className,
  variant,
  isHidden,
  onBackButtonClick,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Chat');
  const { isSocketConnected } = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  const chatContentRef = useRef<HTMLDivElement | null>(null);

  const { data, refetch: refetchChatRoom } = useMyChatRoom(
    initialChatRoom.id as number,
    {
      initialData: initialChatRoom,
    }
  );

  const chatRoom = data || initialChatRoom;

  const queryClient = useQueryClient();

  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { usersBlockedMe, changeUserBlockedStatus } = useGetBlockedUsers();
  const {
    chatsDraft,
    addInputValueIntoChatsDraft,
    removeInputValueFromChatsDraft,
  } = useGetChats();

  const [messageText, setMessageText] = useState<string>('');
  const [messageTextValid, setMessageTextValid] = useState(false);

  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [isConfirmBlockUserModalOpen, setIsConfirmBlockUserModalOpen] =
    useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);

  const handleCloseConfirmBlockUserModal = useCallback(() => {
    Mixpanel.track('Close Block User Modal', {
      _stage: 'Direct Messages',
    });
    setIsConfirmBlockUserModalOpen(false);
  }, []);

  useEffect(
    () => {
      if (chatRoom.id && isSocketConnected) {
        addChannel(`chat_${chatRoom.id.toString()}`, {
          chatRoomUpdates: {
            chatRoomId: chatRoom.id,
          },
        });
      }
      return () => {
        if (chatRoom.id) {
          removeChannel(`chat_${chatRoom.id.toString()}`);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      chatRoom,
      isSocketConnected,
      // addChannel, - reason unknown
      // removeChannel, - reason unknown
    ]
  );

  const prevChatRoomId = useRef(chatRoom.id);

  useEffect(() => {
    // Add message to draft
    if (prevChatRoomId.current && prevChatRoomId.current !== chatRoom.id) {
      addInputValueIntoChatsDraft(prevChatRoomId.current, messageText);

      setMessageText('');
      setMessageTextValid(false);
      setSendingMessage(false);

      prevChatRoomId.current = chatRoom.id;
    }
  }, [
    chatRoom.id,
    messageText,
    addInputValueIntoChatsDraft,
    removeInputValueFromChatsDraft,
  ]);

  const isUmount = useRef(false);

  useEffect(
    () => () => {
      isUmount.current = true;
    },
    []
  );

  useEffect(
    () => () => {
      // Add message to draft for mobile and dashboard
      if (isUmount.current && chatRoom.id) {
        addInputValueIntoChatsDraft(chatRoom.id, messageText);
        isUmount.current = false;
      }
    },
    [addInputValueIntoChatsDraft, chatRoom.id, messageText]
  );

  // Ready message from draft
  useEffect(() => {
    if (
      chatRoom.id &&
      chatsDraft.filter((chatDraft) => chatDraft.roomId === chatRoom.id)[0]
    ) {
      const draft = chatsDraft.filter(
        (chatDraft) => chatDraft.roomId === chatRoom.id
      )[0];

      const isValid = validateInputText(draft.text);
      setMessageTextValid(isValid);
      setMessageText(draft.text);
    }
  }, [chatRoom.id, chatsDraft]);

  const isAnnouncement = useMemo(
    () => chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
    [chatRoom.kind]
  );

  const isMyAnnouncement = useMemo(
    () =>
      chatRoom.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE &&
      !chatRoom.visavis,
    [chatRoom.kind, chatRoom.visavis]
  );

  const isVisavisBlocked = useMemo(
    () => !!chatRoom.visavis?.isVisavisBlocked,
    [chatRoom.visavis?.isVisavisBlocked]
  );

  const isMessagingDisabled = useMemo(
    () => usersBlockedMe.includes(chatRoom.visavis?.user?.uuid ?? ''),
    [chatRoom.visavis?.user?.uuid, usersBlockedMe]
  );

  const handleBlockUserClick = useCallback(async () => {
    Mixpanel.track('Block User Modal Opened', {
      _stage: 'Direct Messages',
      _component: 'ChatContent',
    });
    setIsConfirmBlockUserModalOpen(true);
  }, []);

  const blockUser = useCallback(async () => {
    await changeUserBlockedStatus(chatRoom.visavis?.user?.uuid, true);
    refetchChatRoom();
    setIsConfirmBlockUserModalOpen(false);
  }, [chatRoom.visavis?.user?.uuid, changeUserBlockedStatus, refetchChatRoom]);

  const unblockUser = useCallback(async () => {
    await changeUserBlockedStatus(chatRoom.visavis?.user?.uuid, false);
    refetchChatRoom();
  }, [chatRoom.visavis?.user?.uuid, changeUserBlockedStatus, refetchChatRoom]);

  const onUserReport = useCallback(() => {
    setConfirmReportUser(true);
  }, []);

  const submitMessage = useCallback(async () => {
    if (chatRoom && messageTextValid) {
      const tmpMsgText = messageText.trim();

      if (tmpMsgText.length > 0) {
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

          if (!res?.data || res.error) {
            throw new Error(res?.error?.message ?? 'Request failed');
          }

          // TODO: don't like this, need to think
          // Update Chat List
          queryClient.invalidateQueries({
            queryKey: ['private', 'getMyRooms'],
          });

          // Update Chat
          refetchChatRoom();
          setSendingMessage(false);

          if (chatContentRef.current) {
            chatContentRef.current.scrollTo(
              0,
              chatContentRef.current.scrollHeight
            );
          }

          if (chatRoom.id) {
            removeInputValueFromChatsDraft(chatRoom.id);
          }
        } catch (err) {
          console.error(err);
          setMessageText(tmpMsgText);
          setSendingMessage(false);
        }
      }
    }
  }, [
    chatRoom,
    messageTextValid,
    messageText,
    queryClient,
    removeInputValueFromChatsDraft,
    refetchChatRoom,
  ]);

  const handleSubmit = useCallback(() => {
    Mixpanel.track('Send Message Button Clicked', {
      _stage: 'Direct Messages',
      _component: 'ChatContent',
      _roomId: chatRoom.id,
    });

    if (!sendingMessage) {
      submitMessage();
    }
  }, [sendingMessage, submitMessage, chatRoom.id]);

  const handleChange = useCallback(
    (id: string, value: string, isEnter: boolean) => {
      if (isEnter && !isMobileOrTablet) {
        setMessageText(value.slice(0, -1));
        handleSubmit();
        return;
      }

      const isValid = validateInputText(value);
      setMessageTextValid(isValid);
      setMessageText(value);
    },
    [isMobileOrTablet, handleSubmit]
  );

  const renewSubscription = useCallback(() => {
    refetchChatRoom();
  }, [refetchChatRoom]);

  const isTextareaHidden = useMemo(
    () =>
      isMessagingDisabled ||
      isVisavisBlocked ||
      (chatRoom.myRole === newnewapi.ChatRoom.MyRole.SUBSCRIBER &&
        !chatRoom.visavis?.isSubscriptionActive) ||
      chatRoom.visavis?.user?.options?.isTombstone ||
      !chatRoom ||
      (isAnnouncement && !isMyAnnouncement),
    [
      isMessagingDisabled,
      isVisavisBlocked,
      chatRoom,
      isAnnouncement,
      isMyAnnouncement,
    ]
  );

  const whatComponentToDisplay = useCallback(() => {
    if (isVisavisBlocked === true && !!chatRoom.visavis) {
      return (
        <BlockedUser
          isBlocked={isVisavisBlocked}
          user={chatRoom.visavis}
          onUserUnblock={unblockUser}
          variant={variant}
        />
      );
    }

    if (chatRoom.visavis?.user?.options?.isTombstone) {
      return <AccountDeleted variant={variant} />;
    }

    if (isMessagingDisabled && chatRoom.visavis?.user) {
      return (
        <MessagingDisabled user={chatRoom.visavis.user} variant={variant} />
      );
    }

    if (
      !chatRoom.visavis?.isSubscriptionActive &&
      chatRoom.visavis?.user?.uuid &&
      chatRoom.myRole
    ) {
      return (
        <SubscriptionExpired
          user={chatRoom.visavis.user}
          myRole={chatRoom.myRole}
          onRenewal={renewSubscription}
          variant={variant}
        />
      );
    }

    return null;
  }, [
    isVisavisBlocked,
    chatRoom.visavis,
    chatRoom.myRole,
    isMessagingDisabled,
    unblockUser,
    variant,
    renewSubscription,
  ]);

  // react-focus-on cannot be used here because of column-reverse
  useDisableTouchMoveSafari(chatContentRef, isHidden);

  // Needed to prevent soft keyboard from pushing layout up on mobile Safari
  usePreventLayoutMoveOnInputFocusSafari('data-new-message-textarea');

  const isBottomPartElementVisible =
    !isAnnouncement || isMyAnnouncement || !!whatComponentToDisplay();

  return (
    <SContainer className={className}>
      <ChatContentHeader
        chatRoom={chatRoom}
        isVisavisBlocked={isVisavisBlocked}
        onUserReport={onUserReport}
        onUserBlock={handleBlockUserClick}
        onUserUnblock={unblockUser}
        onBackButtonClick={onBackButtonClick}
        isBackButton={isBackButton}
        isMoreButton={isMoreButton}
        withAvatar={withHeaderAvatar}
      />

      <SContent>
        <ChatAreaCenter
          forwardRef={chatContentRef}
          chatRoom={chatRoom}
          isAnnouncement={isAnnouncement}
          withAvatars={withChatMessageAvatars}
          variant={variant}
        />

        {isBottomPartElementVisible && (
          <SBottomPart>
            <SBottomPartContentWrapper>
              {isTextareaHidden ? (
                whatComponentToDisplay()
              ) : (
                <SBottomTextarea>
                  <STextArea>
                    <TextArea
                      maxlength={500}
                      value={messageText}
                      onChange={handleChange}
                      placeholder={t('chat.placeholder')}
                      gotMaxLength={handleSubmit}
                      variant={variant}
                    />
                  </STextArea>
                  <SButton
                    withShadow
                    view={messageTextValid ? 'primaryGrad' : 'secondary'}
                    onClick={handleSubmit}
                    loading={sendingMessage}
                    loadingAnimationColor='blue'
                    disabled={
                      sendingMessage ||
                      !messageTextValid ||
                      messageText.length < 1
                    }
                  >
                    <SInlineSVG
                      svg={!sendingMessage ? sendIcon : ''}
                      fill={
                        messageTextValid && messageText.length > 0
                          ? theme.colors.white
                          : theme.colorsThemed.text.primary
                      }
                      width='24px'
                      height='24px'
                    />
                  </SButton>
                </SBottomTextarea>
              )}
            </SBottomPartContentWrapper>
          </SBottomPart>
        )}
      </SContent>
      {chatRoom.visavis && (
        <ReportModal
          show={confirmReportUser}
          reportedUser={chatRoom.visavis?.user!!}
          onClose={() => setConfirmReportUser(false)}
          onSubmit={async ({ reasons, message }) => {
            if (chatRoom.visavis?.user?.uuid) {
              await reportUser(
                chatRoom.visavis.user?.uuid,
                reasons,
                message
              ).catch((e) => console.error(e));
            }
          }}
        />
      )}
      {chatRoom.visavis ? (
        <BlockUserModal
          isOpen={isConfirmBlockUserModalOpen}
          onUserBlock={blockUser}
          user={chatRoom.visavis}
          closeModal={handleCloseConfirmBlockUserModal}
          isAnnouncement={isAnnouncement}
        />
      ) : null}

      <GlobalStyles />
    </SContainer>
  );
};

export default ChatContent;

const SContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(var(--window-inner-height, 1vh) * 100);

  flex-shrink: 0;

  ${(props) => props.theme.media.tablet} {
    padding: 0;
    flex-shrink: unset;
  }

  ${(props) => props.theme.media.laptop} {
    height: 100%;
  }
`;

const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

const SContent = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  height: calc(var(--window-inner-height, 1vh) * 100 - 80px);

  ${(props) => props.theme.media.laptop} {
    height: 100%;
  }
`;

const SBottomPart = styled.div`
  display: flex;
  flex-direction: column;
  /* position: absolute;
  bottom: 0;
  left: 0;
  right: 0; */

  background: ${(props) => props.theme.colorsThemed.background.secondary};

  ${(props) => props.theme.media.tablet} {
    background: none;
    min-height: 80px;
  }
`;

const SBottomPartContentWrapper = styled.div`
  padding: 10px 16px 20px;

  ${(props) => props.theme.media.tablet} {
    padding: 20px 24px;
  }
`;

const SBottomTextarea = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const STextArea = styled.div`
  flex: 1;
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
