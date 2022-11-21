import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { toNumber } from 'lodash';
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
import { useAppSelector } from '../../../redux-store/store';
import InlineSVG from '../../atoms/InlineSVG';

import {
  getMyRooms,
  getRoom,
  getVisavisList,
} from '../../../api/endpoints/chat';

import chevronLeftIcon from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import { IChatData } from '../../interfaces/ichat';

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
interface IChatroomsSorted {
  letter: string;
  chats: newnewapi.IVisavisListItem[];
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
    newnewapi.IVisavisListItem[]
  >([]);

  const [myAnnouncement, setMyAnnouncement] =
    useState<newnewapi.IChatRoom | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingAnnouncement, setLoadingAnnouncement] =
    useState<boolean>(false);
  const [chatRoomLoading, setChatRoomLoading] = useState<boolean>(false);
  const [chatRooms, setChatRooms] = useState<newnewapi.IVisavisListItem[]>([]);

  const passInputValue = (str: string) => {
    setSearchValue(str);
  };

  const loadData = useCallback(async () => {
    if (loading) return;
    try {
      setLoading(true);
      const payload = new newnewapi.EmptyRequest();

      const res = await getVisavisList(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      setChatRooms(res.data.visavis);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [loading]);

  const getMyAnnouncement = useCallback(async () => {
    if (loadingAnnouncement) return;
    try {
      setLoadingAnnouncement(true);
      const payload = new newnewapi.GetMyRoomsRequest({
        roomKind: 4,
        myRole: 2,
      });
      const res = await getMyRooms(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      if (res.data.rooms[0]) setMyAnnouncement(res.data.rooms[0]);
      setLoadingAnnouncement(false);
    } catch (err) {
      console.error(err);
      setLoadingAnnouncement(false);
    }
  }, [loadingAnnouncement]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!myAnnouncement) getMyAnnouncement();
  }, [getMyAnnouncement, myAnnouncement]);

  useEffect(() => {
    const obj = chatRooms.reduce((acc: { [key: string]: any }, c) => {
      if (c.user && c.user.username) {
        const letter = c.user.username[0];
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
      const arr: newnewapi.IVisavisListItem[] = [];

      chatRooms.forEach((chat: newnewapi.IVisavisListItem) => {
        if (
          (chat.user?.username &&
            chat.user?.username.toLowerCase().includes(searchValue)) ||
          (chat.user?.nickname &&
            chat.user?.nickname.toLowerCase().includes(searchValue))
        )
          arr.push(chat);
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

  const fetchChatRoom = useCallback(
    async (roomID: number | Long.Long | null | undefined) => {
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
          console.log(res.data);

          openChat({ chatRoom: res.data, showChatList: null });
          closeModal();
        }
        setChatRoomLoading(false);
      } catch (err) {
        console.error(err);
        setChatRoomLoading(false);
      }
    },
    [chatRoomLoading, closeModal, openChat]
  );

  const renderChatItem = useCallback(
    (chat: newnewapi.IVisavisListItem, index: number) => {
      const handleItemClick = () => {
        fetchChatRoom(chat.chatroomId);
      };

      return (
        <SChatItemContainer key={`visavis-list-item-${chat.chatroomId}`}>
          <SChatItemM onClick={handleItemClick}>
            {chat.user?.thumbnailAvatarUrl && (
              <SUserAvatar>
                <UserAvatar avatarUrl={chat.user?.thumbnailAvatarUrl} />
              </SUserAvatar>
            )}
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {chat.user?.nickname || chat.user?.username}
                {chat.user?.isVerified && (
                  <SInlineSVG
                    svg={VerificationCheckmark}
                    width='16px'
                    height='16px'
                  />
                )}
              </SChatItemText>
              <SUserAlias>@{chat.user?.username}</SUserAlias>
            </SChatItemCenter>
          </SChatItemM>
          {filteredChatrooms.length > 0
            ? index !== filteredChatrooms.length - 1 && <SChatSeparator />
            : chatRooms && index !== chatRooms.length - 1 && <SChatSeparator />}
        </SChatItemContainer>
      );
    },
    [chatRooms, fetchChatRoom, filteredChatrooms]
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
                  {user.userData?.options?.isOfferingBundles &&
                    myAnnouncement && (
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
