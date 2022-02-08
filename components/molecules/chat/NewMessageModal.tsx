import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import dynamic from 'next/dynamic';
import randomID from '../../../utils/randomIdGenerator';
import Modal from '../../organisms/Modal';
import SearchInput from '../../atoms/chat/SearchInput';
import {
  SChatItemContainer,
  SChatItemCenter,
  SChatItemText,
  SChatSeparator,
  SUserAlias,
  SChatItemM,
} from '../../atoms/chat/styles';
import UserAvatar from '../UserAvatar';
import useScrollGradients from '../../../utils/hooks/useScrollGradients';
import GradientMask from '../../atoms/GradientMask';
import clearNameFromEmoji from '../../../utils/clearNameFromEmoji';
import { useAppSelector } from '../../../redux-store/store';
import InlineSVG from '../../atoms/InlineSVG';

import chevronLeftIcon from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';

const CloseModalButton = dynamic(() => import('../../atoms/chat/CloseModalButton'));
const NoResults = dynamic(() => import('../../atoms/chat/NoResults'));
const NewAnnouncement = dynamic(() => import('../../atoms/chat/NewAnnouncement'));

interface INewMessageModal {
  showModal: boolean;
  closeModal: () => void;
}

interface IUserData {
  userName: string;
  userNameWithoutEmoji?: string;
  userAlias: string;
  avatar: string;
}

interface IUser {
  id: string;
  userData: IUserData;
}

interface IUsersSorted {
  letter: string;
  users: IUser[];
}

const NewMessageModal: React.FC<INewMessageModal> = ({ showModal, closeModal }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const scrollRef: any = useRef();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [usersSortedList, setuUsersSortedList] = useState<IUsersSorted[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);

  const passInputValue = (str: string) => {
    setSearchValue(str);
  };

  const collection: Array<IUser> = useMemo(
    () => [
      {
        id: randomID(),
        userData: {
          userName: '🦄Unicornbabe',
          userAlias: 'unicornbabe',
          avatar: '/images/mock/test_user_1.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: 'Caramella🍬',
          userAlias: 'caramella',
          avatar: '/images/mock/test_user_2.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: '👧Girly',
          userAlias: 'girly',
          avatar: '/images/mock/test_user_3.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: '🪆Dolly🪆',
          userAlias: 'dolly',
          avatar: '/images/mock/test_user_4.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: 'Cuttie🍰Pie',
          userAlias: 'cuttiepie',
          avatar: '/images/mock/test_user_1.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: 'AcidBunny111🐰',
          userAlias: 'rogerlawrence',
          avatar: '/images/mock/test_user_1.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: 'Alpha13🐺🌕',
          userAlias: 'jacobbishop',
          avatar: '/images/mock/test_user_2.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: 'BeardedGenius95',
          userAlias: 'alexpeterson',
          avatar: '/images/mock/test_user_3.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: '☠CaptainBlack☠️',
          userAlias: 'marshallmclaughlin',
          avatar: '/images/mock/test_user_4.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: 'CaptainCyborg👾',
          userAlias: 'codybrewer',
          avatar: '/images/mock/test_user_1.jpg',
        },
      },
      {
        id: randomID(),
        userData: {
          userName: '✨Cinderella✨',
          userAlias: 'cindycraw',
          avatar: '/images/mock/test_user_1.jpg',
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (collection) {
      const obj = collection.reduce((acc: { [key: string]: any }, c) => {
        const letter = clearNameFromEmoji(c.userData.userName)[0].toLowerCase();
        acc[letter] = (acc[letter] || []).concat(c);
        return acc;
      }, {});

      // `map` over the object entries to return an array of objects
      const arr = Object.entries(obj)
        /* eslint-disable arrow-body-style */
        .map(([letter, users]) => {
          return { letter, users };
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

      setuUsersSortedList(arr);
    }
  }, [collection]);

  useEffect(() => {
    if (searchValue.length > 0) {
      const arr: IUser[] = [];

      collection.forEach((user: IUser) => {
        if (!user.userData.userNameWithoutEmoji) {
          /* eslint-disable no-param-reassign */
          user.userData.userNameWithoutEmoji = clearNameFromEmoji(user.userData.userName).toLowerCase();
        }
        if (user.userData.userNameWithoutEmoji.startsWith(searchValue)) {
          arr.push(user);
        }
      });

      arr.sort((a, b) => {
        if (a.userData.userNameWithoutEmoji && b.userData.userNameWithoutEmoji) {
          if (a.userData.userNameWithoutEmoji < b.userData.userNameWithoutEmoji) {
            return -1;
          }
          if (a.userData.userNameWithoutEmoji > b.userData.userNameWithoutEmoji) {
            return 1;
          }
        }
        return 0;
      });
      setFilteredUsers(arr);
    } else {
      setFilteredUsers([]);
    }
  }, [searchValue, collection]);

  const createNewAnnouncement = () => {
    console.log('New Announcement');
  };

  const renderChatItem = useCallback(
    (item: IUser, index: number) => {
      const handleItemClick = () => {};

      return (
        <SChatItemContainer key={item.id}>
          <SChatItemM onClick={handleItemClick}>
            <UserAvatar avatarUrl={item.userData.avatar} />
            <SChatItemCenter>
              <SChatItemText variant={3} weight={600}>
                {item.userData.userName}
              </SChatItemText>
              <SUserAlias>@{item.userData.userAlias}</SUserAlias>
            </SChatItemCenter>
          </SChatItemM>
          {index !== collection.length - 1 && <SChatSeparator />}
        </SChatItemContainer>
      );
    },
    [collection.length]
  );

  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef);

  return (
    <Modal show={showModal}>
      <SContainer>
        <SModal>
          <SModalHeader>
            <SModalTitle>{t('modal.new-message.title')}</SModalTitle>
            {!isMobile ? (
              <CloseModalButton handleClick={closeModal} />
            ) : (
              <SBackButton
                clickable
                svg={chevronLeftIcon}
                fill={theme.colorsThemed.text.tertiary}
                width="24px"
                height="24px"
                onClick={closeModal}
              />
            )}
          </SModalHeader>
          <SearchInput
            placeholderText={t('modal.new-message.search-placeholder')}
            bgColor={theme.colorsThemed.background.tertiary}
            fontSize="16px"
            style={{ marginBottom: '16px' }}
            passInputValue={passInputValue}
          />
          <SWrapper>
            {
              /* eslint-disable no-nested-ternary */
              searchValue.length > 0 ? (
                filteredUsers.length > 0 ? (
                  <SSectionContent ref={scrollRef}>{filteredUsers.map(renderChatItem)}</SSectionContent>
                ) : (
                  <>
                    <NoResults text={searchValue} />
                  </>
                )
              ) : (
                <SSectionContent ref={scrollRef}>
                  <NewAnnouncement handleClick={createNewAnnouncement} />
                  {usersSortedList.length > 0 &&
                    usersSortedList.map((section: IUsersSorted) => (
                      <SSection>
                        <SLetter>{section.letter}</SLetter>
                        {section.users.map(renderChatItem)}
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
  overflow: hidden;
  height: 100%;
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
  padding: 0 24px;
  margin: 0 -24px;
`;

const SModal = styled.div`
  max-width: 480px;
  width: 100%;
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  color: ${(props) =>
    props.theme.name === 'light' ? props.theme.colorsThemed.text.primary : props.theme.colors.white};
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
  max-height: 80vh;
  height: 100%;

  ${(props) => props.theme.media.mobile} {
    background-color: ${(props) => props.theme.colorsThemed.background.secondary};
    border-radius: 0;
    max-width: 100%;
    max-height: 100vh;
  }
`;

const SModalHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 20px;

  ${(props) => props.theme.media.mobile} {
    justify-content: start;
    flex-direction: row-reverse;
  }
`;

const SModalTitle = styled.strong`
  font-size: 20px;
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
