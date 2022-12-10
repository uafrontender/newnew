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
import { IChatData } from '../../interfaces/ichat';
import getDisplayname from '../../../utils/getDisplayname';
import { useAppSelector } from '../../../redux-store/store';
import validateInputText from '../../../utils/validateMessageText';

/* Icons */
import sendIcon from '../../../public/images/svg/icons/filled/Send.svg';
import MoreIconFilled from '../../../public/images/svg/icons/filled/More.svg';

/* Components */
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import TextArea from '../../atoms/chat/TextArea';

const ReportModal = dynamic(() => import('./ReportModal'));
const BlockedUser = dynamic(() => import('./BlockedUser'));
const GoBackButton = dynamic(() => import('../GoBackButton'));
const AccountDeleted = dynamic(() => import('./AccountDeleted'));
const ChatAreaCenter = dynamic(() => import('./ChatAreaCenter'));
const ChatEllipseMenu = dynamic(() => import('./ChatEllipseMenu'));
const ChatEllipseModal = dynamic(() => import('./ChatEllipseModal'));
const MessagingDisabled = dynamic(() => import('./MessagingDisabled'));
const SubscriptionExpired = dynamic(() => import('./SubscriptionExpired'));
const AnnouncementHeader = dynamic(
  () => import('../../atoms/chat/AnnouncementHeader')
);
const ChatUserData = dynamic(() => import('../../atoms/chat/ChatUserData'));

const ChatArea: React.FC<IChatData> = ({
  chatRoom,
  showChatList,
  updateLastMessage,
}) => {
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
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { usersIBlocked, usersBlockedMe, changeUserBlockedStatus } =
    useGetBlockedUsers();

  const [messageText, setMessageText] = useState<string>('');
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const [messageTextValid, setMessageTextValid] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [messages, setMessages] = useState<newnewapi.IChatMessage[]>([]);
  const [confirmBlockUser, setConfirmBlockUser] = useState<boolean>(false);
  const [confirmReportUser, setConfirmReportUser] = useState<boolean>(false);
  const [isMyAnnouncement, setIsMyAnnouncement] = useState<boolean>(false);
  const [isSubscriptionExpired, setIsSubscriptionExpired] =
    useState<boolean>(false);

  useEffect(() => {
    if (chatRoom) {
      if (chatRoom && chatRoom.visavis) {
        if (!chatRoom.visavis.isSubscriptionActive) {
          setIsSubscriptionExpired(true);
        }
      }
      if (chatRoom.kind === 4) {
        setIsAnnouncement(true);
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

  const isVisavisBlocked = useMemo(
    () => usersIBlocked.includes(chatRoom?.visavis?.user?.uuid ?? ''),
    [chatRoom?.visavis?.user?.uuid, usersIBlocked]
  );

  const isMessagingDisabled = useMemo(
    () => usersBlockedMe.includes(chatRoom?.visavis?.user?.uuid ?? ''),
    [chatRoom?.visavis?.user?.uuid, usersBlockedMe]
  );

  const handleOpenEllipseMenu = useCallback(() => {
    setEllipseMenuOpen(true);
  }, []);

  const handleCloseEllipseMenu = useCallback(() => {
    setEllipseMenuOpen(false);
  }, []);

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

  const goBackHandler = () => {
    if (showChatList) {
      setMessageText('');
      showChatList();
    }
  };

  const isTextareaHidden = useMemo(
    () =>
      isMessagingDisabled ||
      isVisavisBlocked ||
      isSubscriptionExpired ||
      chatRoom?.visavis?.user?.options?.isTombstone ||
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

  // const isTextareaVisible = useCallback(() => {
  //   if (
  //     isMessagingDisabled ||
  //     isVisavisBlocked ||
  //     isSubscriptionExpired ||
  //     chatRoom?.visavis?.user?.options?.isTombstone ||
  //     !chatRoom ||
  //     (isAnnouncement && !isMyAnnouncement)
  //   ) {
  //     return false;
  //   }

  //   // if (isAnnouncement && !isMyAnnouncement) {
  //   //   return false;
  //   // }

  //   return true;
  // }, [
  //   isVisavisBlocked,
  //   isSubscriptionExpired,
  //   isMessagingDisabled,
  //   isAnnouncement,
  //   isMyAnnouncement,
  //   chatRoom,
  // ]);

  const moreButtonRef: any = useRef();

  return (
    <SContainer>
      {chatRoom && (
        <STopPart>
          {isMobileOrTablet && <GoBackButton onClick={goBackHandler} />}
          <ChatUserData
            chatRoom={chatRoom}
            isAnnouncement={isAnnouncement}
            isMyAnnouncement={isMyAnnouncement}
          />
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
                isAnnouncement={isAnnouncement}
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
                isAnnouncement={isAnnouncement}
              />
            ) : null}
          </SActionsDiv>
        </STopPart>
      )}
      {isAnnouncement && !isMyAnnouncement && chatRoom?.visavis?.user && (
        <AnnouncementHeader user={chatRoom.visavis?.user} />
      )}
      <ChatAreaCenter
        chatRoom={chatRoom}
        isAnnouncement={isAnnouncement}
        updateLastMessage={updateLastMessage}
      />
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

        {chatRoom?.visavis?.user?.options?.isTombstone ? (
          <AccountDeleted />
        ) : chatRoom && chatRoom.visavis ? (
          isMessagingDisabled ? (
            <MessagingDisabled user={chatRoom.visavis.user!!} />
          ) : isSubscriptionExpired && chatRoom.visavis?.user?.uuid ? (
            <SubscriptionExpired
              user={chatRoom.visavis.user!!}
              myRole={chatRoom.myRole!!}
            />
          ) : null
        ) : null}

        {!isTextareaHidden && (
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
