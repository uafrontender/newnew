/* eslint-disable consistent-return */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
/* Contexts */
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';

/* API */
import { reportUser } from '../../../api/endpoints/report';
import { sendMessage } from '../../../api/endpoints/chat';

/* Utils */
import getDisplayname from '../../../utils/getDisplayname';
import { useAppSelector } from '../../../redux-store/store';
import validateInputText from '../../../utils/validateMessageText';

/* Icons */
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';

/* Components */
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import TextArea from '../../atoms/direct-messages/TextArea';
import ChatContentHeader from '../../molecules/direct-messages/ChatContentHeader';
import { useGetChats } from '../../../contexts/chatContext';

const ReportModal = dynamic(
  () => import('../../molecules/direct-messages/ReportModal')
);
const BlockedUser = dynamic(
  () => import('../../molecules/direct-messages/BlockedUser')
);
const AccountDeleted = dynamic(
  () => import('../../molecules/direct-messages/AccountDeleted')
);
const ChatAreaCenter = dynamic(
  () => import('../../molecules/direct-messages/ChatAreaCenter')
);

const MessagingDisabled = dynamic(
  () => import('../../molecules/direct-messages/MessagingDisabled')
);
const SubscriptionExpired = dynamic(
  () => import('../../molecules/direct-messages/SubscriptionExpired')
);

interface IFuncProps {
  chatRoom: newnewapi.IChatRoom;
}

const ChatContent: React.FC<IFuncProps> = ({ chatRoom }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Chat');
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { usersIBlocked, usersBlockedMe, changeUserBlockedStatus } =
    useGetBlockedUsers();
  const { setJustSentMessage } = useGetChats();
  const [messageText, setMessageText] = useState<string>('');
  const [messageTextValid, setMessageTextValid] = useState(false);

  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [textareaFocused, setTextareaFocused] = useState<boolean>(false);
  const [isSubscriptionExpired, setIsSubscriptionExpired] =
    useState<boolean>(false);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom]);

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
    () => usersIBlocked.includes(chatRoom.visavis?.user?.uuid ?? ''),
    [chatRoom.visavis?.user?.uuid, usersIBlocked]
  );

  const isMessagingDisabled = useMemo(
    () => usersBlockedMe.includes(chatRoom.visavis?.user?.uuid ?? ''),
    [chatRoom.visavis?.user?.uuid, usersBlockedMe]
  );

  const onUserBlock = useCallback(() => {
    if (!isVisavisBlocked) {
      if (!confirmBlockUser) setConfirmBlockUser(true);
    } else {
      changeUserBlockedStatus(chatRoom.visavis?.user?.uuid, false);
    }
  }, [
    isVisavisBlocked,
    confirmBlockUser,
    chatRoom.visavis?.user?.uuid,
    changeUserBlockedStatus,
  ]);

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
          if (!res.data || res.error)
            throw new Error(res.error?.message ?? 'Request failed');

          setJustSentMessage(true);
          setSendingMessage(false);
        } catch (err) {
          console.error(err);
          setMessageText(tmpMsgText);
          setSendingMessage(false);
        }
      }
    }
  }, [chatRoom, messageTextValid, messageText, setJustSentMessage]);

  const handleSubmit = useCallback(() => {
    if (!sendingMessage) submitMessage();
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
    [isMobileOrTablet, handleSubmit]
  );

  const isTextareaHidden = useMemo(
    () =>
      isMessagingDisabled ||
      isVisavisBlocked ||
      isSubscriptionExpired ||
      chatRoom.visavis?.user?.options?.isTombstone ||
      !chatRoom ||
      (isAnnouncement && !isMyAnnouncement),
    [
      isVisavisBlocked,
      isSubscriptionExpired,
      isMessagingDisabled,
      isAnnouncement,
      isMyAnnouncement,
      chatRoom,
    ]
  );

  const whatComponentToDisplay = useCallback(() => {
    if (chatRoom.visavis?.user?.options?.isTombstone) return <AccountDeleted />;

    if (isMessagingDisabled && chatRoom.visavis?.user)
      return <MessagingDisabled user={chatRoom.visavis.user} />;

    if (
      isSubscriptionExpired &&
      chatRoom.visavis?.user?.uuid &&
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
    chatRoom.visavis?.user,
    isSubscriptionExpired,
    chatRoom.myRole,
  ]);

  const handleTextareaFocused = useCallback(() => {
    setTextareaFocused(true);
  }, []);

  return (
    <SContainer>
      <ChatContentHeader
        chatRoom={chatRoom}
        isVisavisBlocked={isVisavisBlocked}
        onUserReport={onUserReport}
        onUserBlock={onUserBlock}
      />

      <ChatAreaCenter
        chatRoom={chatRoom}
        isAnnouncement={isAnnouncement}
        textareaFocused={textareaFocused}
      />
      <SBottomPart>
        {(isVisavisBlocked === true || confirmBlockUser) &&
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
                maxlength={500}
                value={messageText}
                onChange={handleChange}
                placeholder={t('chat.placeholder')}
                gotMaxLength={handleSubmit}
                setTextareaFocused={handleTextareaFocused}
              />
            </STextArea>
            <SButton
              withShadow
              view={messageTextValid ? 'primaryGrad' : 'secondary'}
              onClick={handleSubmit}
              disabled={!messageTextValid || messageText.length < 1}
            >
              <SInlineSVG
                svg={sendIcon}
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
        ) : (
          whatComponentToDisplay()
        )}
      </SBottomPart>
      {chatRoom.visavis && (
        <ReportModal
          show={confirmReportUser}
          reportedDisplayname={getDisplayname(chatRoom.visavis?.user!!)}
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
    </SContainer>
  );
};

export default ChatContent;

const SContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 80px 0 82px;
  ${(props) => props.theme.media.tablet} {
    padding: 0;
  }
`;

const SBottomPart = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  padding: 10px 24px;
  ${(props) => props.theme.media.tablet} {
    position: absolute;
    padding: 20px;
    bottom: 0;
    left: 0;
    right: 0;
    background: none;
    min-height: 80px;
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
