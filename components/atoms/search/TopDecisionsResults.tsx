/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import getDisplayname from '../../../utils/getDisplayname';
import usePageVisibility from '../../../utils/hooks/usePageVisibility';
import isBrowser from '../../../utils/isBrowser';
import secondsToDHMS from '../../../utils/secondsToDHMS';
import textTrim from '../../../utils/textTrim';
import UserAvatar from '../../molecules/UserAvatar';

interface IFunction {
  posts: newnewapi.IPost[];
}

const TopDecisionsResults: React.FC<IFunction> = ({ posts }) => {
  const { t } = useTranslation('common');
  const [updateTimer, setUpdateTimer] = useState<boolean>(false);
  const interval = useRef<number>();
  const isPageVisible = usePageVisibility();
  useEffect(() => {
    if (isBrowser() && isPageVisible) {
      interval.current = window.setInterval(() => {
        setUpdateTimer((curr) => !curr);
      }, 1000);
    }
    return () => clearInterval(interval.current);
  }, [isPageVisible]);

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
        <Link href={`/p/${data.postUuid}`} key={data.postUuid}>
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
                  <SCreatorUsername>
                    {getDisplayname(data.creator)}
                  </SCreatorUsername>
                </SPostData>
              </SLeftSide>
              <SPostDetails>
                {!hasEnded ? (
                  <SPostEnded>
                    {parsed.days !== '00' &&
                      `${parsed.days}${t('timer.daysLeft')}`}{' '}
                    {`${
                      parsed.hours !== '00' ||
                      (parsed.days !== '00' && parsed.hours === '00')
                        ? `${parsed.hours}${t('timer.hoursLeft')}`
                        : ''
                    } ${parsed.minutes}${t('timer.minutesLeft')}
                    ${
                      parsed.days === '00'
                        ? `${parsed.seconds}${t('timer.secondsLeft')}`
                        : ''
                    }`}
                  </SPostEnded>
                ) : (
                  <SPostEnded>
                    {t('timer.endedOn')}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, updateTimer]
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
