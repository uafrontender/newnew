/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import moment from 'moment';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import GradientMask from '../../atoms/GradientMask';
import useScrollGradients from '../../../utils/hooks/useScrollGradients';
import randomID from '../../../utils/randomIdGenerator';
import Comment from '../../atoms/decision/Comment';
import CommentForm from '../../atoms/decision/CommentForm';
import { useAppSelector } from '../../../redux-store/store';
import Button from '../../atoms/Button';

const MoreCommentsModal = dynamic(() => import('./MoreCommentsModal'));

interface ICommentsTab {
  comments: newnewapi.Auction.Option[];
  handleGoBack: () => void,
}

const CommentsTab: React.FunctionComponent<ICommentsTab> = ({
  comments,
  handleGoBack,
}) => {
  const scrollRef: any = useRef();
  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef, true);
  const { t } = useTranslation('decision');

  const [confirmMoreComments, setConfirmMoreComments] = useState(false);

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const collection = useMemo(
    () => [
      {
        id: 1,
        parent_id: -1,
        created_at: moment().subtract(3, 'days'),
        user: {
          uuid: randomID(),
          nickname: 'Nickname',
          avatarUrl: '/images/mock/test_user_1.jpg',
        },
        bid: '$10',
        message:
          'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
        replies: [
          {
            id: 2,
            parent_id: 1,
            created_at: moment().subtract(2.7, 'days'),
            user: {
              uuid: randomID(),
              nickname: 'Nickname',
              avatarUrl: '/images/mock/test_user_1.jpg',
            },
            bid: '$10',
            message:
              'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
            replies: [
              {
                id: 4,
                parent_id: 2,
                created_at: moment().subtract(2.7, 'days'),
                user: {
                  uuid: randomID(),
                  nickname: 'Nickname',
                  avatarUrl: '/images/mock/test_user_1.jpg',
                },
                bid: '$10',
                message:
                  'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
                replies: [
                  {
                    id: 6,
                    parent_id: 4,
                    created_at: moment().subtract(2.7, 'days'),
                    user: {
                      uuid: randomID(),
                      nickname: 'Nickname',
                      avatarUrl: '/images/mock/test_user_1.jpg',
                    },
                    bid: '$10',
                    message:
                      'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
                    replies: [],
                  },
                  {
                    id: 7,
                    parent_id: 4,
                    created_at: moment().subtract(3, 'days'),
                    user: {
                      uuid: randomID(),
                      nickname: 'Nickname',
                      avatarUrl: '/images/mock/test_user_1.jpg',
                    },
                    bid: '$10',
                    message:
                      'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
                    replies: [],
                  },
                ],
              },
              {
                id: 8,
                parent_id: 1,
                created_at: moment().subtract(2.7, 'days'),
                user: {
                  uuid: randomID(),
                  nickname: 'Nickname',
                  avatarUrl: '/images/mock/test_user_1.jpg',
                },
                bid: '$10',
                message:
                  'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: 3,
        parent_id: -1,
        created_at: moment().subtract(3, 'days'),
        user: {
          uuid: randomID(),
          nickname: 'Nickname',
          avatarUrl: '/images/mock/test_user_1.jpg',
        },
        bid: '$10',
        message:
          'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
        replies: [],
      },
      {
        id: 5,
        parent_id: -1,
        created_at: moment().subtract(3, 'days'),
        user: {
          uuid: randomID(),
          nickname: 'Nickname',
          avatarUrl: '/images/mock/test_user_1.jpg',
        },
        bid: '$10',
        message:
          'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
        replies: [],
      },
      {
        id: 13,
        parent_id: -1,
        created_at: moment().subtract(3, 'days'),
        user: {
          uuid: randomID(),
          nickname: 'Nickname',
          avatarUrl: '/images/mock/test_user_1.jpg',
        },
        bid: '$10',
        message:
          'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
        replies: [],
      },
      {
        id: 15,
        parent_id: -1,
        created_at: moment().subtract(3, 'days'),
        user: {
          uuid: randomID(),
          nickname: 'Nickname',
          avatarUrl: '/images/mock/test_user_1.jpg',
        },
        bid: '$10',
        message:
          'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
        replies: [],
      },
      {
        id: 23,
        parent_id: -1,
        created_at: moment().subtract(3, 'days'),
        user: {
          uuid: randomID(),
          nickname: 'Nickname',
          avatarUrl: '/images/mock/test_user_1.jpg',
        },
        bid: '$10',
        message:
          'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
        replies: [],
      },
      {
        id: 25,
        parent_id: -1,
        created_at: moment().subtract(3, 'days'),
        user: {
          uuid: randomID(),
          nickname: 'Nickname',
          avatarUrl: '/images/mock/test_user_1.jpg',
        },
        bid: '$10',
        message:
          'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
        replies: [],
      },
      {
        id: 41,
        parent_id: -1,
        created_at: moment().subtract(3, 'days'),
        user: {
          uuid: randomID(),
          nickname: 'Nickname',
          avatarUrl: '/images/mock/test_user_1.jpg',
        },
        bid: '$10',
        message:
          'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
        replies: [
          {
            id: 42,
            parent_id: 41,
            created_at: moment().subtract(2.7, 'days'),
            user: {
              uuid: randomID(),
              nickname: 'Nickname',
              avatarUrl: '/images/mock/test_user_1.jpg',
            },
            bid: '$10',
            message:
              'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
            replies: [
              {
                id: 44,
                parent_id: 42,
                created_at: moment().subtract(2.7, 'days'),
                user: {
                  uuid: randomID(),
                  nickname: 'Nickname',
                  avatarUrl: '/images/mock/test_user_1.jpg',
                },
                bid: '$10',
                message:
                  'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
                replies: [
                  {
                    id: 46,
                    parent_id: 44,
                    created_at: moment().subtract(2.7, 'days'),
                    user: {
                      uuid: randomID(),
                      nickname: 'Nickname',
                      avatarUrl: '/images/mock/test_user_1.jpg',
                    },
                    bid: '$10',
                    message:
                      'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
                    replies: [],
                  },
                  {
                    id: 47,
                    parent_id: 44,
                    created_at: moment().subtract(3, 'days'),
                    user: {
                      uuid: randomID(),
                      nickname: 'Nickname',
                      avatarUrl: '/images/mock/test_user_1.jpg',
                    },
                    bid: '$10',
                    message:
                      'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
                    replies: [],
                  },
                ],
              },
              {
                id: 48,
                parent_id: 41,
                created_at: moment().subtract(2.7, 'days'),
                user: {
                  uuid: randomID(),
                  nickname: 'Nickname',
                  avatarUrl: '/images/mock/test_user_1.jpg',
                },
                bid: '$10',
                message:
                  'When your mother asks, ‘Do you want a piece of advice?’ it is a mere formality. It doesn’t matter if you answer yes or no. You’re going to get it anyway.',
                replies: [],
              },
            ],
          },
        ],
      },
    ],
    []
  );

  return (
    <>
      <STabContainer
        key="comments"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={scrollRef}
      >
        <SActionSection>
          <CommentForm />
          <SCommentsWrapper>
            {collection.map((item, index) => {
              if (!isMobile || index < 3)
                return (
                  <Comment
                    key={randomID()}
                    lastChild={index === collection.length - 1 || (isMobile && index === 2)}
                    comment={item}
                  />
                );
              return null;
            })}
            {isMobile && collection.length > 3 && (
              <>
                <SButton
                  size="lg"
                  view="modalSecondary"
                  onClick={() => {
                    setConfirmMoreComments(true);
                  }}
                >
                  {t('comments.view-more')}
                </SButton>
                <MoreCommentsModal
                  confirmMoreComments={isMobile}
                  closeMoreCommentsModal={() => handleGoBack()}
                  comments={collection.slice(3)}
                />
              </>
            )}
          </SCommentsWrapper>
        </SActionSection>
        <GradientMask positionTop active={showTopGradient} />
        <GradientMask active={showBottomGradient} />
      </STabContainer>
    </>
  );
};

export default CommentsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  padding-right: 20px;
  height: calc(100% - 50px);
  align-self: flex-end;

  ${({ theme }) => theme.media.tablet} {
    height: calc(100% - 56px);
  }
`;

const SActionSection = styled.div`
  padding-right: 0;
  height: 100%;
  overflow: hidden;
  &:hover {
    overflow-y: auto;
  }
  ${(props) => props.theme.media.desktop} {
    padding-right: 24px;
  }
`;

const SCommentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SButton = styled(Button)`
  margin-top: 20px;
`;
