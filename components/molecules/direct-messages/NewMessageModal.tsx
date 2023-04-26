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
import { useRouter } from 'next/router';
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
import { useAppSelector } from '../../../redux-store/store';
import InlineSVG from '../../atoms/InlineSVG';
import SearchInput from '../../atoms/direct-messages/SearchInput';
import Modal from '../../organisms/Modal';

import { getVisavisList } from '../../../api/endpoints/chat';

import chevronLeftIcon from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import useMyChatRooms from '../../../utils/hooks/useMyChatRooms';
import { useGetChats } from '../../../contexts/chatContext';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import DisplayName from '../../atoms/DisplayName';
import Loader from '../../atoms/Loader';

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
}
interface IChatroomsSorted {
  letter: string;
  chats: newnewapi.IVisavisListItem[];
}

const NewMessageModal: React.FC<INewMessageModal> = ({
  showModal,
  closeModal,
}) => {
  const { t } = useTranslation('page-Chat');
  const theme = useTheme();
  const scrollRef: any = useRef();
  const { resizeMode } = useAppState();
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const router = useRouter();

  const { setActiveChatRoom } = useGetChats();
  const { data } = useMyChatRooms({});

  const targetChatRooms = useMemo(
    () => (data ? data.pages.map((page) => page.chatrooms).flat() : []),
    [data]
  );

  const [searchValue, setSearchValue] = useState('');

  const [loading, setLoading] = useState(false);
  const [chatRooms, setChatRooms] = useState<newnewapi.IVisavisListItem[]>([]);

  const passInputValue = (str: string) => {
    setSearchValue(str);
  };

  useEffect(() => {
    const loadData = async () => {
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
    };
    if (!loading && !chatRooms.length) {
      loadData();
    }
  }, [loading, chatRooms.length]);

  const filteredChatRooms = useMemo(
    () =>
      chatRooms.filter(
        (chat: newnewapi.IVisavisListItem) =>
          (chat.user?.username &&
            chat.user?.username.toLowerCase().includes(searchValue)) ||
          (chat.user?.nickname &&
            chat.user?.nickname.toLowerCase().includes(searchValue))
      ),
    [chatRooms, searchValue]
  );

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

  const isDashboard = useMemo(() => {
    if (
      router.asPath.includes('/creator/dashboard') ||
      router.asPath.includes('/creator/bundles')
    ) {
      return true;
    }
    return false;
  }, [router.asPath]);

  useEffect(() => {
    // TODO: visavilist should include only creators on dashboard
    if (showModal && isDashboard && targetChatRooms.length === 1) {
      setActiveChatRoom(targetChatRooms[0]);
      if (router.asPath.includes('/creator/bundles')) {
        router.push(
          `/creator/bundles?tab=direct-messages&roomID=${targetChatRooms[0].id?.toString()}`
        );
      } else {
        router.push(
          `/creator/dashboard?tab=direct-messages&roomID=${targetChatRooms[0].id?.toString()}`
        );
      }
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, targetChatRooms]);

  const openMyAnnouncement = useCallback(async () => {
    Mixpanel.track('My Announcement Clicked', {
      _stage: 'Direct Messages',
      _component: 'NewMessageModal',
      _isDashboard: isDashboard,
      ...(!isDashboard
        ? {
            _target: `/direct-messages/${user.userData?.username}-announcement`,
          }
        : {
            _roomKind: newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE,
            _username: user.userData?.username,
          }),
    });

    // TODO: replace with request because of pagination
    const targetChatRoom =
      targetChatRooms.find(
        (targetChat: newnewapi.IChatRoom) =>
          targetChat.myRole === newnewapi.ChatRoom.MyRole.CREATOR &&
          targetChat.kind === newnewapi.ChatRoom.Kind.CREATOR_MASS_UPDATE
      ) || null;

    setActiveChatRoom(targetChatRoom);

    if (!isDashboard) {
      await router.push(`${user.userData?.username}-announcement`, undefined, {
        shallow: true,
      });

      closeModal();
    }
  }, [
    isDashboard,
    user.userData?.username,
    targetChatRooms,
    setActiveChatRoom,
    router,
    closeModal,
  ]);

  const renderChatItem = useCallback(
    (chat: newnewapi.IVisavisListItem, index: number) => {
      const handleItemClick = async () => {
        Mixpanel.track('Chat Item Clicked', {
          _stage: 'Direct Messages',
          _component: 'NewMessageModal',
          _isDashboard: isDashboard,
          ...(!isDashboard
            ? {
                _target: `/direct-messages/${chat.user?.username}`,
                _visavis: chat.user?.username,
              }
            : {
                _roomKind: newnewapi.ChatRoom.Kind.CREATOR_TO_ONE,
                _visavis: chat.user?.username,
              }),
        });

        if (!isDashboard) {
          // TODO: replace with request because of pagination
          const targetChatRoom =
            targetChatRooms.find(
              (targetChat: newnewapi.IChatRoom) =>
                targetChat.id === chat.chatroomId
            ) || null;

          const chatPrefix =
            targetChatRoom?.myRole === newnewapi.ChatRoom.MyRole.CREATOR
              ? '-bundle'
              : '';

          setActiveChatRoom(targetChatRoom);

          await router.push(`${chat.user?.username}${chatPrefix}`, undefined, {
            shallow: true,
          });

          closeModal();
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
      isDashboard,
      router,
      setActiveChatRoom,
      targetChatRooms,
      closeModal,
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
            {!loading && (
              <SSectionContent ref={scrollRef}>
                {user.userData?.options?.isOfferingBundles && !searchValue && (
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
            {loading && <Loader isStatic size='md' />}
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
