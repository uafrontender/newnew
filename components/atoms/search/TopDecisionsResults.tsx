import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import getDisplayname from '../../../utils/getDisplayname';
import usePageVisibility from '../../../utils/hooks/usePageVisibility';
import isBrowser from '../../../utils/isBrowser';
import { Mixpanel } from '../../../utils/mixpanel';
import secondsToDHMS from '../../../utils/secondsToDHMS';
import UserAvatar from '../../molecules/UserAvatar';
import PostTitleContent from '../PostTitleContent';

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
      const data = Object.values(post)[0] as
        | newnewapi.Auction
        | newnewapi.Crowdfunding
        | newnewapi.MultipleChoice;

      const timestampSeconds = new Date(
        (data.expiresAt?.seconds as number) * 1000
      ).getTime();

      const hasEnded = Date.now() > timestampSeconds;

      const parsed = secondsToDHMS(
        (timestampSeconds - Date.now()) / 1000,
        'noTrim'
      );

      return (
        <Link
          href={`/p/${data.postShortId ? data.postShortId : data.postUuid}`}
          key={data.postUuid}
        >
          <a>
            <SPost
              onClick={() => {
                Mixpanel.track('Search Result Post Clicked', {
                  _postUuid: data.postUuid,
                });
              }}
            >
              <SLeftSide>
                <SUserAvatar>
                  <UserAvatar avatarUrl={data.creator?.avatarUrl ?? ''} />
                </SUserAvatar>
                <SPostData>
                  {data.title && (
                    <SPostTitle>
                      <PostTitleContent>{data.title}</PostTitleContent>
                    </SPostTitle>
                  )}
                  <SCreatorUsername>
                    {getDisplayname(data.creator)}
                  </SCreatorUsername>
                </SPostData>
              </SLeftSide>
              <SPostDetails>
                {!hasEnded ? (
                  <STimeLeft>
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
                  </STimeLeft>
                ) : (
                  <SPostEnded>
                    {t('timer.endedOn')}
                    <br />
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
  overflow: hidden;
  padding-right: 12px;
`;

const SPostData = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  pointer-events: none;
`;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const STimeLeft = styled.span`
  white-space: nowrap;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SPostEnded = styled.span`
  white-space: nowrap;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SPostDetails = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: column;
  text-align: right;
`;
