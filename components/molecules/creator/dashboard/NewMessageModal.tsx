import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { getMyRooms } from '../../../../api/endpoints/chat';
import clearNameFromEmoji from '../../../../utils/clearNameFromEmoji';
import { useAppSelector } from '../../../../redux-store/store';
import {
  SChatItemCenter,
  SChatItemContainer,
  SChatItemLine,
  SChatItemM,
  SChatItemText,
  SChatSeparator,
  SUserAlias,
  SUserAvatar,
  SVerificationSVG,
} from '../../../atoms/chat/styles';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';
import Modal from '../../../organisms/Modal';
import UserAvatar from '../../UserAvatar';
import SearchInput from '../../../atoms/chat/SearchInput';
import CloseModalButton from '../../../atoms/chat/CloseModalButton';
import GradientMask from '../../../atoms/GradientMask';
import InlineSVG from '../../../atoms/InlineSVG';
import NewAnnouncement from '../../../atoms/dashboard/NewAnnouncement';
import NoResults from '../../../atoms/chat/NoResults';
import chevronLeftIcon from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import getDisplayname from '../../../../utils/getDisplayname';

interface INewMessageModal {
  showModal: boolean;
  closeModal: () => void;
}

interface IChatRoomUserNameWithoutEmoji extends newnewapi.IChatRoom {
  userNameWithoutEmoji?: string;
}

interface IChatroomsSorted {
  letter: string;
  chats: IChatRoomUserNameWithoutEmoji[];
}

const NewMessageModal: React.FC<INewMessageModal> = ({
  showModal,
  closeModal,
}) => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();
  const scrollRef: any = useRef();
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
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

  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [chatRooms, setChatRooms] = useState<
    IChatRoomUserNameWithoutEmoji[] | null
  >(null);
  const [myAnnouncement, setMyAnnouncement] =
    useState<newnewapi.IChatRoom | null>(null);

  const passInputValue = (str: string) => {
    setSearchValue(str);
  };

  useEffect(() => {
    async function fetchMyRooms() {
      try {
        setLoadingRooms(true);
        const payload = new newnewapi.GetMyRoomsRequest({
          myRole: 2,
          paging: { limit: 50 },
        });
        const res = await getMyRooms(payload);
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');
        const arr = [] as IChatRoomUserNameWithoutEmoji[];
        res.data.rooms.forEach((chat) => {
          if (chat.kind === 4) {
            if (chat.myRole === 2) {
              setMyAnnouncement(chat);
            }
          } else {
            arr.push(chat);
          }
        });
        setChatRooms(arr);
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
    if (chatRooms) {
      const obj = chatRooms.reduce((acc: { [key: string]: any }, c) => {
        if (c.visavis && c.visavis.user?.username) {
          const letter = clearNameFromEmoji(
            c.visavis.user?.username
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
    }
  }, [chatRooms]);

  useEffect(() => {
    if (searchValue.length > 0 && chatRooms) {
      const arr: IChatRoomUserNameWithoutEmoji[] = [];

      chatRooms.forEach((chat: IChatRoomUserNameWithoutEmoji) => {
        if (!chat.userNameWithoutEmoji) {
          /* eslint-disable no-param-reassign */
          if (chat.visavis && chat.visavis.user?.username)
            chat.userNameWithoutEmoji = clearNameFromEmoji(
              chat.visavis.user?.username
            ).toLowerCase();
        } else {
          // eslint-disable-next-line no-lonely-if
          if (chat.userNameWithoutEmoji.startsWith(searchValue)) arr.push(chat);
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
      router.push(
        `/creator/dashboard?tab=direct-messages&roomID=${myAnnouncement.id}`
      );
    closeModal();
  };

  const renderChatItem = useCallback(
    (chat: IChatRoomUserNameWithoutEmoji, index: number) => {
      const handleItemClick = () => {
        router.push(`/creator/dashboard?tab=direct-messages&roomID=${chat.id}`);
        closeModal();
      };

      return (
        <SChatItemContainer key={chat.id?.toString()}>
          <SChatItemM onClick={handleItemClick}>
            <SUserAvatar>
              <UserAvatar
                avatarUrl={(chat.visavis && chat.visavis.user?.avatarUrl) ?? ''}
              />
            </SUserAvatar>
            <SChatItemCenter>
              <SChatItemLine>
                <SChatItemText variant={3} weight={600}>
                  {getDisplayname(chat.visavis?.user)}
                </SChatItemText>
                {chat.visavis?.user?.options?.isVerified && (
                  <SVerificationSVG
                    svg={VerificationCheckmark}
                    width='20px'
                    height='20px'
                  />
                )}
              </SChatItemLine>
              <SUserAlias>@{chat.visavis?.user?.username}</SUserAlias>
            </SChatItemCenter>
          </SChatItemM>
          {chatRooms && index !== chatRooms.length - 1 && <SChatSeparator />}
        </SChatItemContainer>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatRooms, closeModal]
  );

  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  return (
    <Modal show={showModal} onClose={closeModal}>
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
                  <NewAnnouncement handleClick={createNewAnnouncement} />
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
`;
