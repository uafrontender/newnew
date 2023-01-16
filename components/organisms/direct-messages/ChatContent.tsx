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

  const [messageText, setMessageText] = useState<string>('');
  const [messageTextValid, setMessageTextValid] = useState(false);

  const [isAnnouncement, setIsAnnouncement] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [isMyAnnouncement, setIsMyAnnouncement] = useState<boolean>(false);
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

        setSendingMessage(false);
      } catch (err) {
        console.error(err);
        setMessageText(tmpMsgText);
        setSendingMessage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom.id, messageTextValid, messageText]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messageText, isMobileOrTablet, handleSubmit]
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

  return (
    <SContainer>
      <ChatContentHeader
        chatRoom={chatRoom}
        isVisavisBlocked
        onUserReport={onUserReport}
        onUserBlock={onUserBlock}
      />

      <ChatAreaCenter chatRoom={chatRoom} isAnnouncement={isAnnouncement} />
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
  position: relative;
  flex-direction: column;
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
