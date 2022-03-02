/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import styled, { css } from 'styled-components';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import UserAvatar from '../UserAvatar';
import textTrim from '../../../utils/textTrim';

import { IChatData } from '../../interfaces/ichat';

import {
  SChatItemContainer,
  SChatItem,
  SChatItemCenter,
  SChatItemText,
  SChatItemLastMessage,
  SChatItemRight,
  SChatItemTime,
  SChatItemIndicator,
  SChatSeparator,
  SUserAvatar,
} from '../../atoms/chat/styles';
import randomID from '../../../utils/randomIdGenerator';
import { getMyRooms } from '../../../api/endpoints/chat';
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';

const EmptyInbox = dynamic(() => import('../../atoms/chat/EmptyInbox'));

interface IFunctionProps {
  openChat: (arg: IChatData) => void;
}

export const ChatList: React.FC<IFunctionProps> = ({ openChat }) => {
  const { t } = useTranslation('chat');
  const [activeChatIndex, setActiveChatIndex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('chatRooms');

  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [parsingRooms, setParsingRooms] = useState<boolean | null>(null);
  const [chatRooms, setChatRooms] = useState<newnewapi.IChatRoom[] | null>(null);
  const [chatRoomsCreators, setChatRoomsCreators] = useState<newnewapi.IChatRoom[]>([]);
  const [chatRoomsSubs, setChatRoomsSubs] = useState<newnewapi.IChatRoom[]>([]);

  const userTypes = useMemo(
    () => [
      {
        id: 'chatRooms',
        title: t('usertypes.all'),
      },
      {
        id: 'chatRoomsSubs',
        title: t('usertypes.subscribers'),
      },
      {
        id: 'chatRoomsCreators',
        title: t('usertypes.subscribing'),
      },
    ],
    [t]
  );

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  useEffect(() => {
    async function fetchMyRooms() {
      try {
        setLoadingRooms(true);
        const payload = new newnewapi.GetMyRoomsRequest({ paging: { limit: 20 }, roomKind: 1 });
        const res = await getMyRooms(payload);

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        setChatRooms(res.data.rooms);
        setLoadingRooms(false);
      } catch (err) {
        console.error(err);
        setLoadingRooms(false);
      }
    }
    if (!chatRooms && !loadingRooms) {
      fetchMyRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatRooms && parsingRooms === null) {
      openChat({ chatRoom: chatRooms[0], showChatList: null });
      if (chatRooms[0].visavis?.uuid) setActiveChatIndex(chatRooms[0].visavis?.uuid);
      chatRooms.forEach((chat) => {
        setParsingRooms(true);
        if (chat.myRole === 1) setChatRoomsSubs([...chatRoomsSubs, chat]);
        if (chat.myRole === 2) setChatRoomsCreators([...chatRoomsCreators, chat]);
        setParsingRooms(false);

        if (chat.id) {
          addChannel(chat.id.toString(), {
            postUpdates: {
              postUuid: chat.id.toString(),
            },
          });

          return () => {
            if (chat.id) removeChannel(chat.id.toString());
          };
        }

        const socketHandlerMessageCreated = (data: any) => {
          const arr = new Uint8Array(data);
          const decoded = newnewapi.ChatMessageCreated.decode(arr);
          console.log(decoded);
        };
        if (socketConnection) {
          socketConnection.on('ChatMessageCreated', socketHandlerMessageCreated);
        }

        return () => {
          if (socketConnection && socketConnection.connected) {
            socketConnection.off('ChatMessageCreated', socketHandlerMessageCreated);
          }
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRooms, socketConnection]);

  const renderChatItem = useCallback(
    (chat: newnewapi.IChatRoom) => {
      const handleItemClick = () => {
        if (chat.visavis?.uuid) {
          openChat({ chatRoom: chat, showChatList: null });
          setActiveChatIndex(chat.visavis.uuid);
        }
      };

      return (
        <SChatItemContainer key={randomID()}>
          <SChatItem onClick={handleItemClick} className={activeChatIndex === chat.visavis?.uuid ? 'active' : ''}>
            <SUserAvatar>
              <UserAvatar avatarUrl={chat.visavis?.avatarUrl ? chat.visavis?.avatarUrl : ''} />
            </SUserAvatar>
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {chat.visavis?.nickname && chat.visavis?.nickname?.length > 0
                  ? chat.visavis?.nickname
                  : chat.visavis?.username}
              </SChatItemText>
              <SChatItemLastMessage variant={3} weight={600}>
                {!chat.lastMessage?.content?.text
                  ? textTrim(t('chat.default-first-message'))
                  : textTrim(chat.lastMessage.content?.text)}
              </SChatItemLastMessage>
            </SChatItemCenter>
            <SChatItemRight>
              <SChatItemTime variant={3} weight={600}>
                {chat.updatedAt && moment(chat.updatedAt?.nanos).fromNow()}
              </SChatItemTime>
              {/* {!!item.unread && <SChatItemIndicator counter={item.unreadCount} />} */}
            </SChatItemRight>
          </SChatItem>
          <SChatSeparator />
        </SChatItemContainer>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChatIndex]
  );

  const Tabs = useCallback(
    () => (
      <STabs>
        {userTypes.map((item) => (
          <STab active={activeTab === item.id} key={randomID()} onClick={() => setActiveTab(item.id)}>
            {item.title}
          </STab>
        ))}
      </STabs>
    ),
    [activeTab, userTypes]
  );
  /* eslint-disable no-eval */
  return (
    <>
      <SSectionContent>
        {chatRooms && chatRooms.length > 0 ? (
          <>
            {chatRoomsCreators.length > 0 && chatRoomsSubs.length > 0 && <Tabs />}
            {eval(activeTab).map(renderChatItem)}
          </>
        ) : (
          <EmptyInbox />
        )}
      </SSectionContent>
    </>
  );
};

export default ChatList;

const SSectionContent = styled.div`
  height: calc(100% - 74px);
  display: flex;
  position: relative;
  overflow-y: auto;
  flex-direction: column;
`;

const STabs = styled.div`
  display: flex;
  text-align: center;
  align-items: stretch;
  align-content: stretch;
  justify-content: stretch;
  margin-bottom: 16px;
  font-size: 14px;
`;

interface ISTab {
  active: boolean;
}
const STab = styled.div<ISTab>`
  width: calc(100% / 3);
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  ${(props) => {
    if (props.active) {
      return css`
        font-weight: bold;
        position: relative;
        &:after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 4px;
          background: ${({ theme }) => theme.gradients.blueHorizontal};
          border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
          border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
        }
      `;
    }
    return css`
      font-weight: normal;
    `;
  }}
`;
