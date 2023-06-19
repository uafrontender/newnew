import React, { useCallback, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useQuery } from 'react-query';

import {
  SChatItemContainer,
  SChatItemCenter,
  SChatItemText,
  SChatSeparator,
  SUserAlias,
  SChatItemM,
  SUserAvatar,
  SChatItemLine,
} from '../../atoms/direct-messages/styles';
import useScrollGradients from '../../../utils/hooks/useScrollGradients';
import GradientMask from '../../atoms/GradientMask';
import { useUserData } from '../../../contexts/userDataContext';
import InlineSVG from '../../atoms/InlineSVG';
import SearchInput from '../../atoms/direct-messages/SearchInput';
import Modal from '../../organisms/Modal';

import {
  getMyRooms,
  getRoom,
  getVisavisList,
} from '../../../api/endpoints/chat';

import chevronLeftIcon from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import DisplayName from '../../atoms/DisplayName';
import Loader from '../../atoms/Loader';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

const CloseModalButton = dynamic(
  () => import('../../atoms/direct-messages/CloseModalButton')
);
const NoResults = dynamic(
  () => import('../../atoms/direct-messages/NoResults')
);
const NewAnnouncement = dynamic(
  () => import('../../atoms/direct-messages/NewAnnouncement')
);

interface INewMessageModal {
  showModal: boolean;
  closeModal: () => void;
  onNewMessageSelect: (newChatRoom: newnewapi.IChatRoom) => void;
}
interface IChatroomsSorted {
  letter: string;
  chats: newnewapi.IVisavisListItem[];
}

const NewMessageModal: React.FC<INewMessageModal> = ({
  showModal,
  closeModal,
  onNewMessageSelect,
}) => {
  const { t } = useTranslation('page-Chat');
  const theme = useTheme();
  const scrollRef: any = useRef();
  const { resizeMode } = useAppState();
  const { userData } = useUserData();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { showErrorToastCustom } = useErrorToasts();

  const [searchValue, setSearchValue] = useState('');

  const { data, isLoading } = useQuery<newnewapi.IVisavisListItem[]>(
    ['private', 'fetchVisavisList'],
    async ({ signal }) => {
      const payload = new newnewapi.EmptyRequest();

      const res = await getVisavisList(payload, signal);

      if (!res?.data || res.error) {
        throw new Error(res?.error?.message ?? 'Request failed');
      }

      return res.data.visavis;
    },
    {
      onError: (error) => {
        console.error(error);
      },
      enabled: showModal,
    }
  );

  const chatRooms = useMemo(() => data || [], [data]);

  const passInputValue = (str: string) => {
    setSearchValue(str);
  };

  const filteredChatRooms = useMemo(() => {
    const searchValueInLowerCase = searchValue.toLowerCase();

    return chatRooms.filter(
      (chat: newnewapi.IVisavisListItem) =>
        (chat.user?.username &&
          chat.user?.username.toLowerCase().includes(searchValueInLowerCase)) ||
        (chat.user?.nickname &&
          chat.user?.nickname.toLowerCase().includes(searchValueInLowerCase))
    );
  }, [chatRooms, searchValue]);

  const chatsInAlphabetOrder = useMemo(() => {
    const obj = filteredChatRooms.reduce((acc: { [key: string]: any }, c) => {
      if (c.user && c.user.username) {
        const letter = c.user.username[0];
        acc[letter] = (acc[letter] || []).concat(c);
      }
      return acc;
    }, {});

    // `map` over the object entries to return an array of objects
    const arr = Object.entries(obj)
      .map(([letter, chats]) => ({ letter, chats }))
      .sort((a, b) => a.letter.localeCompare(b.letter));

    return arr;
  }, [filteredChatRooms]);

  const openMyAnnouncement = useCallback(async () => {
    Mixpanel.track('My Announcement Clicked', {
      _stage: 'Direct Messages',
      _component: 'NewMessageModal',
    });

    try {
      const payload = new newnewapi.GetMyRoomsRequest({
        myRole: newnewapi.ChatRoom.MyRole.CREATOR,
        roomKind: newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
      });

      const targetChatRoomResponse = await getMyRooms(payload);

      if (!targetChatRoomResponse?.data || targetChatRoomResponse.error) {
        throw new Error('Request failed');
      }

      const targetChatRoom = targetChatRoomResponse.data.rooms[0] || null;

      await onNewMessageSelect(targetChatRoom);

      closeModal();
    } catch (err) {
      console.error(err);
    }
  }, [onNewMessageSelect, closeModal]);

  const renderChatItem = useCallback(
    (chat: newnewapi.IVisavisListItem, index: number) => {
      const handleItemClick = async () => {
        Mixpanel.track('Chat Item Clicked', {
          _stage: 'Direct Messages',
          _component: 'NewMessageModal',
        });

        try {
          const payload = new newnewapi.GetRoomRequest({
            roomId: chat.chatroomId,
          });

          const res = await getRoom(payload);

          if (!res?.data || res.error) {
            throw new Error(res?.error?.message ?? 'Request failed');
          }

          await onNewMessageSelect(res.data);

          closeModal();
        } catch (err) {
          showErrorToastCustom(t('chat.notFound'));
        }
      };

      return (
        <SChatItemContainer key={`visavis-list-item-${chat.chatroomId}`}>
          <SChatItemM onClick={handleItemClick}>
            {chat.user?.thumbnailAvatarUrl && (
              <SUserAvatar avatarUrl={chat.user?.thumbnailAvatarUrl} />
            )}
            <SChatItemCenter>
              <SChatItemLine>
                <SChatItemText variant={3} weight={600}>
                  <DisplayName user={chat.user} />
                </SChatItemText>
              </SChatItemLine>
              <SUserAlias>@{chat.user?.username}</SUserAlias>
            </SChatItemCenter>
          </SChatItemM>
          {filteredChatRooms.length > 0
            ? index !== filteredChatRooms.length - 1 && <SChatSeparator />
            : chatRooms && index !== chatRooms.length - 1 && <SChatSeparator />}
        </SChatItemContainer>
      );
    },
    [
      filteredChatRooms.length,
      chatRooms,
      onNewMessageSelect,
      closeModal,
      showErrorToastCustom,
      t,
    ]
  );

  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  return (
    <Modal show={showModal} additionalz={21} onClose={closeModal}>
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
            {!isLoading && (
              <SSectionContent ref={scrollRef}>
                {userData?.options?.isOfferingBundles && !searchValue && (
                  <NewAnnouncement handleClick={openMyAnnouncement} />
                )}
                {chatsInAlphabetOrder.length > 0 &&
                  chatsInAlphabetOrder.map((section: IChatroomsSorted) => (
                    <SSection key={section.letter}>
                      {!searchValue && <SLetter>{section.letter}</SLetter>}
                      {section.chats.map(renderChatItem)}
                    </SSection>
                  ))}

                {searchValue && chatsInAlphabetOrder.length === 0 && (
                  <NoResults text={searchValue} />
                )}
              </SSectionContent>
            )}

            <GradientMask positionTop active={showTopGradient} />
            <GradientMask active={showBottomGradient} />
            {isLoading && <Loader isStatic size='md' />}
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
