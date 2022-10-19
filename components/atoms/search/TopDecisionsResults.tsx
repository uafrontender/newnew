/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import secondsToDHMS from '../../../utils/secondsToDHMS';
import textTrim from '../../../utils/textTrim';
import UserAvatar from '../../molecules/UserAvatar';

interface IFunction {
  posts: newnewapi.IPost[];
}

const TopDecisionsResults: React.FC<IFunction> = ({ posts }) => {
  const { t } = useTranslation('common');
  const { t: tPostCard } = useTranslation('component-PostCard');
  const renderItem = useCallback(
    (post: newnewapi.IPost) => {
      const postType = Object.keys(post)[0];
      const data = Object.values(post)[0] as
        | newnewapi.Auction
        | newnewapi.Crowdfunding
        | newnewapi.MultipleChoice;

      let postTypeConverted = '';

      const timestampSeconds = new Date(
        (data.expiresAt?.seconds as number) * 1000
      ).getTime();

      const hasEnded = Date.now() > timestampSeconds;

      const parsed = secondsToDHMS(
        (timestampSeconds - Date.now()) / 1000,
        'noTrim'
      );

      switch (postType) {
        case 'auction':
          postTypeConverted = t('postType.ac');
          break;
        case 'crowdfunding':
          postTypeConverted = t('postType.cf');
          break;
        default:
          postTypeConverted = t('postType.mc');
      }

      return (
        <Link href={`/post/${data.postUuid}`} key={data.postUuid}>
          <a>
            <SPost>
              <SLeftSide>
                <SUserAvatar>
                  <UserAvatar avatarUrl={data.creator?.avatarUrl ?? ''} />
                </SUserAvatar>
                <SPostData>
                  {data.title && (
                    <SPostTitle>{textTrim(data.title, 28)}</SPostTitle>
                  )}
                  <SCreatorUsername>{data.creator?.nickname}</SCreatorUsername>
                </SPostData>
              </SLeftSide>
              <SPostDetails>
                <SPostType>{postTypeConverted}</SPostType>
                {!hasEnded ? (
                  <SPostEnded>
                    {parsed.days !== '00' &&
                      `${parsed.days}${tPostCard('timer.daysLeft')}`}{' '}
                    {`${parsed.hours}${tPostCard('timer.hoursLeft')} ${
                      parsed.minutes
                    }${tPostCard('timer.minutesLeft')} ${
                      parsed.seconds
                    }${tPostCard('timer.secondsLeft')} `}
                  </SPostEnded>
                ) : (
                  <SPostEnded>
                    {tPostCard('timer.endedOn')}
                    {new Date(
                      (data.expiresAt?.seconds as number) * 1000
                    ).toLocaleDateString()}
                  </SPostEnded>
                )}
              </SPostDetails>
            </SPost>
          </a>
        </Link>
      );
    },
    [t, tPostCard]
  );

  return (
    <SContainer>
      <SBlockTitle>{t('search.topPosts')}</SBlockTitle>
      {posts.map(renderItem)}
    </SContainer>
  );
};

export default TopDecisionsResults;

const SContainer = styled.div`
  padding-bottom: 20px;
`;

const SBlockTitle = styled.strong`
  display: block;
  color: #646e81;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  margin-bottom: 16px;
`;

const SPost = styled.div`
  margin-bottom: 16px;
  display: flex;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  padding: 8px 16px;
  margin: 0 -16px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

const SLeftSide = styled.div`
  display: flex;
`;

const SPostData = styled.div`
  display: flex;
  flex-direction: column;
`;

const SUserAvatar = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 6px;
  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

const SPostTitle = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SPostType = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SPostEnded = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SPostDetails = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: column;
  text-align: right;
`;
