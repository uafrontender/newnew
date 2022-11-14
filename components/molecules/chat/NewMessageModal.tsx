import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useUpdateEffect } from 'react-use';
import Modal from '../../organisms/Modal';
import SearchInput from '../../atoms/chat/SearchInput';
import {
  SChatItemContainer,
  SChatItemCenter,
  SChatItemText,
  SChatSeparator,
  SUserAlias,
  SChatItemM,
  SUserAvatar,
} from '../../atoms/chat/styles';
import UserAvatar from '../UserAvatar';
import useScrollGradients from '../../../utils/hooks/useScrollGradients';
import GradientMask from '../../atoms/GradientMask';
import clearNameFromEmoji from '../../../utils/clearNameFromEmoji';
import { useAppSelector } from '../../../redux-store/store';
import InlineSVG from '../../atoms/InlineSVG';

import { getMyRooms } from '../../../api/endpoints/chat';

import chevronLeftIcon from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import { IChatData } from '../../interfaces/ichat';
import usePagination, {
  PaginatedResponse,
  Paging,
} from '../../../utils/hooks/usePagination';

const CloseModalButton = dynamic(
  () => import('../../atoms/chat/CloseModalButton')
);
const NoResults = dynamic(() => import('../../atoms/chat/NoResults'));
const NewAnnouncement = dynamic(
  () => import('../../atoms/chat/NewAnnouncement')
);

interface INewMessageModal {
  showModal: boolean;
  closeModal: () => void;
  openChat: (arg: IChatData) => void;
}

interface IChatRoomUserNameWithoutEmoji extends newnewapi.IChatRoom {
  userNameWithoutEmoji?: string;
}

interface IChatroomsSorted {
  letter: string;
  chats: IChatRoomUserNameWithoutEmoji[];
}

const NewMessageModal: React.FC<INewMessageModal> = ({
  openChat,
  showModal,
  closeModal,
}) => {
  const { t } = useTranslation('page-Chat');
  const theme = useTheme();
  const scrollRef: any = useRef();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [chatroomsSortedList, setChatroomsSortedList] = useState<
    IChatroomsSorted[]
  >([]);
  const [searchValue, setSearchValue] = useState('');

  const [filteredChatrooms, setFilteredChatrooms] = useState<
    IChatRoomUserNameWithoutEmoji[]
  >([]);

  const [myAnnouncement, setMyAnnouncement] =
    useState<newnewapi.IChatRoom | null>(null);

  const passInputValue = (str: string) => {
    setSearchValue(str);
  };

  const loadData = useCallback(
    async (paging: Paging): Promise<PaginatedResponse<newnewapi.IChatRoom>> => {
      const payload = new newnewapi.GetMyRoomsRequest({
        myRole: user.userData?.options?.isOfferingBundles ? null : 1,
        paging,
      });

      const res = await getMyRooms(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      // Find own announcement chat
      const myAnnouncementChat = res.data.rooms.find(
        (chat) => chat.kind === 4 && chat.myRole === 2
      );
      if (myAnnouncementChat) {
        setMyAnnouncement(myAnnouncementChat);
      }

      return {
        nextData: res.data.rooms,
        nextPageToken: res.data.paging?.nextPageToken,
      };
    },
    [user.userData?.options?.isOfferingBundles]
  );

  const { data, loading, hasMore, loadMore } = usePagination(
    loadData,
    50,
    !showModal
  );

  const chatRooms: IChatRoomUserNameWithoutEmoji[] = useMemo(
    () =>
      data.reduce<newnewapi.IChatRoom[]>((list, chat) => {
        if (chat.kind === 4) {
          return list;
        }

        const existingRoomIndex = list.findIndex(
          (currChat) =>
            currChat.visavis?.user?.username === chat.visavis?.user?.username
        );

        if (existingRoomIndex < 0) {
          return [...list, chat];
        }

        if (chat.myRole === 2) {
          return [
            ...list.slice(0, existingRoomIndex),
            chat,
            ...list.slice(existingRoomIndex + 1),
          ];
        }

        return list;
      }, []),
    [data]
  );

  useUpdateEffect(() => {
    if (data.length > 0 && !loading && hasMore) {
      loadMore().catch((e) => console.error(e));
    }
  }, [data, loading, hasMore, loadMore]);

  useEffect(() => {
    const obj = chatRooms.reduce((acc: { [key: string]: any }, c) => {
      if (c.visavis && c.visavis?.user?.username) {
        const letter = clearNameFromEmoji(
          c.visavis.user.username
        )[0].toLowerCase();
        acc[letter] = (acc[letter] || []).concat(c);
      }
      return acc;
    }, {});

    // `map` over the object entries to return an array of objects
    const arr = Object.entries(obj)
      /* eslint-disable arrow-body-style */
      .map(([letter, chats]) => {
        return { letter, chats };
      })
      .sort((a, b) => {
        if (a.letter < b.letter) {
          return -1;
        }
        if (a.letter > b.letter) {
          return 1;
        }
        return 0;
      });

    setChatroomsSortedList(arr);
  }, [chatRooms]);

  useEffect(() => {
    if (searchValue.length > 0) {
      const arr: IChatRoomUserNameWithoutEmoji[] = [];

      chatRooms.forEach((chat: IChatRoomUserNameWithoutEmoji) => {
        if (!chat.userNameWithoutEmoji) {
          /* eslint-disable no-param-reassign */
          if (chat.visavis && chat.visavis.user?.username)
            chat.userNameWithoutEmoji = clearNameFromEmoji(
              chat.visavis.user.username
            ).toLowerCase();
        } else {
          // eslint-disable-next-line no-lonely-if
          if (
            chat.userNameWithoutEmoji.includes(searchValue) ||
            (chat.visavis?.user?.nickname &&
              chat.visavis?.user?.nickname.includes(searchValue))
          )
            arr.push(chat);
        }
      });

      arr.sort((a, b) => {
        if (a.userNameWithoutEmoji && b.userNameWithoutEmoji) {
          if (a.userNameWithoutEmoji < b.userNameWithoutEmoji) {
            return -1;
          }
          if (a.userNameWithoutEmoji > b.userNameWithoutEmoji) {
            return 1;
          }
        }
        return 0;
      });
      setFilteredChatrooms(arr);
    } else {
      setFilteredChatrooms([]);
    }
  }, [searchValue, chatRooms]);

  const createNewAnnouncement = () => {
    if (myAnnouncement)
      openChat({ chatRoom: myAnnouncement, showChatList: null });
    closeModal();
  };

  const renderChatItem = useCallback(
    (chat: IChatRoomUserNameWithoutEmoji, index: number) => {
      const handleItemClick = () => {
        openChat({ chatRoom: chat, showChatList: null });
        closeModal();
      };

      return (
        <SChatItemContainer key={chat.id?.toString()}>
          <SChatItemM onClick={handleItemClick}>
            {chat.visavis?.user?.avatarUrl && (
              <SUserAvatar>
                <UserAvatar avatarUrl={chat.visavis?.user?.avatarUrl} />
              </SUserAvatar>
            )}
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {chat.visavis?.user?.nickname || chat.visavis?.user?.username}
                {chat.visavis?.user?.options &&
                  chat.visavis?.user?.options.isVerified && (
                    <SInlineSVG
                      svg={VerificationCheckmark}
                      width='16px'
                      height='16px'
                    />
                  )}
              </SChatItemText>
              <SUserAlias>@{chat.visavis?.user?.username}</SUserAlias>
            </SChatItemCenter>
          </SChatItemM>
          {filteredChatrooms.length > 0
            ? index !== filteredChatrooms.length - 1 && <SChatSeparator />
            : chatRooms && index !== chatRooms.length - 1 && <SChatSeparator />}
        </SChatItemContainer>
      );
    },
    [chatRooms, closeModal, openChat, filteredChatrooms]
  );

  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  return (
    <Modal show={showModal} additionalz={21} onClose={closeModal} overlaydim>
      <SContainer>
        <SModal>
          <SModalHeader>
            <SModalTitle>{t('modal.newMessage.title')}</SModalTitle>
            {!isMobile ? (
              <CloseModalButton handleClick={closeModal} />
            ) : (
              <SBackButton
                clickable
                svg={chevronLeftIcon}
                fill={theme.colorsThemed.text.tertiary}
                width='24px'
                height='24px'
                onClick={closeModal}
              />
            )}
          </SModalHeader>
          <SearchInput
            placeholderText={t('modal.newMessage.searchPlaceholder')}
            bgColor={theme.colorsThemed.background.tertiary}
            fontSize='16px'
            style={{ marginBottom: '16px' }}
            passInputValue={passInputValue}
          />
          <SWrapper>
            {
              /* eslint-disable no-nested-ternary */
              searchValue.length > 0 ? (
                filteredChatrooms.length > 0 ? (
                  <SSectionContent ref={scrollRef}>
                    {filteredChatrooms.map(renderChatItem)}
                  </SSectionContent>
                ) : (
                  <>
                    <NoResults text={searchValue} />
                  </>
                )
              ) : (
                <SSectionContent ref={scrollRef}>
                  {user.userData?.options?.isOfferingBundles && (
                    <NewAnnouncement handleClick={createNewAnnouncement} />
                  )}
                  {chatroomsSortedList.length > 0 &&
                    chatroomsSortedList.map((section: IChatroomsSorted) => (
                      <SSection key={section.letter}>
                        <SLetter>{section.letter}</SLetter>
                        {section.chats.map(renderChatItem)}
                      </SSection>
                    ))}
                </SSectionContent>
              )
            }

            <GradientMask positionTop active={showTopGradient} />
            <GradientMask active={showBottomGradient} />
          </SWrapper>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default NewMessageModal;

const SWrapper = styled.div`
  position: relative;
  height: 100%;
  overflow-y: auto;
  ${(props) => props.theme.media.tablet} {
    overflow: hidden;
  }
`;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SSectionContent = styled.div`
  height: 100%;
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  ${(props) => props.theme.media.tablet} {
    padding: 0 24px;
    margin: 0 -24px;
  }
`;

const SModal = styled.div`
  width: 100%;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 24px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
  height: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  max-width: 100%;
  max-height: 100vh;
  z-index: 1;

  ${(props) => props.theme.media.tablet} {
    max-width: 480px;
    max-height: 80vh;
    border-radius: ${(props) => props.theme.borderRadius.medium};
    padding: 24px;
  }
`;

const SModalHeader = styled.header`
  display: flex;
  justify-content: start;
  flex-direction: row-reverse;
  align-items: center;
  padding: 0 0 20px;

  ${(props) => props.theme.media.tablet} {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SModalTitle = styled.strong`
  font-size: 14px;
  ${(props) => props.theme.media.tablet} {
    font-size: 20px;
  }
`;

const SLetter = styled.div`
  text-transform: uppercase;
  background-color: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: ${(props) => props.theme.borderRadius.small};
  font-size: 12px;
  line-height: 24px;
  padding: 0 20px;
  margin: 10px 0;
`;

const SSection = styled.div`
  & ${SChatItemContainer}:last-child ${SChatSeparator} {
    display: none;
  }
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
`;

const SBackButton = styled(SInlineSVG)`
  margin-right: 20px;
  position: relative;
  z-index: 1;
`;
