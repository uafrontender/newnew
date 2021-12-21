/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';

import { fetchCurrentBidsForPost } from '../../../api/endpoints/auction';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import PostVideo from '../../molecules/decision/PostVideo';
import PostTitle from '../../molecules/decision/PostTitle';
import PostTimer from '../../molecules/decision/PostTimer';
import GoBackButton from '../../molecules/GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import DecisionTabs from '../../molecules/decision/PostTabs';
import BidsTab from '../../molecules/decision/auction/BidsTab';
import CommentsTab from '../../molecules/decision/CommentsTab';

// Temp
const MockVideo = '/video/mock/mock_video_1.mp4';

interface IPostViewAC {
  post: newnewapi.Auction;
  handleGoBack: () => void;
}

const PostViewAC: React.FunctionComponent<IPostViewAC> = ({
  post,
  handleGoBack,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Tabs
  const [currentTab, setCurrentTab] = useState<
    'bids' | 'comments'
  >('bids');

  // Bids
  const [bids, setBids] = useState<newnewapi.Auction.Option[]>([]);
  const [bidsNextPageToken, setBidsNextPageToken] = useState<string | undefined | null>('');
  const [bidsLoading, setBidsLoading] = useState(false);
  const [loadingBidsError, setLoadingBidsError] = useState('');

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [commentsNextPageToken, setCommentsNextPageToken] = useState<string | undefined | null>('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loadingCommentsError, setLoadingCommentsError] = useState('');

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  const fetchBids = useCallback(async (
    pageToken?: string,
  ) => {
    if (bidsLoading) return;
    try {
      setBidsLoading(true);
      setLoadingBidsError('');

      const getCurrentBidsPayload = new newnewapi.GetCurrentBidsRequest({
        postUuid: post.postUuid,
        ...(pageToken ? {
          paging: {
            pageToken,
          },
        } : {}),
      });

      const res = await fetchCurrentBidsForPost(getCurrentBidsPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      console.log(res.data);

      if (res.data && res.data.options) {
        setBids((curr) => [...curr, ...res.data?.options as newnewapi.Auction.Option[]]);
        setBidsNextPageToken(res.data.paging?.nextPageToken);
      }

      setBidsLoading(false);
    } catch (err) {
      setBidsLoading(false);
      setLoadingBidsError((err as Error).message);
      console.error(err);
    }
  }, [
    setBids, bidsLoading,
    post,
  ]);

  useEffect(() => {
    setBids([]);
    setBidsNextPageToken('');
    fetchBids();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  return (
    <SWrapper>
      <SExpiresSection>
        {isMobile && (
          <GoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={handleGoBack}
          />
        )}
        <PostTimer
          timestampSeconds={new Date((post.expiresAt?.seconds as number) * 1000).getTime()}
          postType="ac"
        />
        {!isMobile && (
          <SGoBackButtonDesktop
            onClick={handleGoBack}
          >
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width="24px"
              height="24px"
            />
          </SGoBackButtonDesktop>
        )}
      </SExpiresSection>
      <PostVideo
        videoSrc={post.announcement?.videoUrl ?? MockVideo}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <PostTitle>
        { post.title }
      </PostTitle>
      <SActivitesContainer>
        <PostTopInfo
          postType="ac"
          // Temp
          // amountInBids={post.totalAmount?.usdCents ?? 0}
          amountInBids={5000}
          creator={post.creator!!}
          startsAtSeconds={post.startsAt?.seconds as number}
          handleFollowCreator={() => {}}
          handleFollowDecision={() => {}}
          handleReportAnnouncement={() => {}}
        />
        <DecisionTabs
          tabs={[
            {
              label: 'bids',
              value: 'bids',
              ...(
                bids.length > 0
                  ? { amount: bids.length.toString() } : {}
              ),
            },
            {
              label: 'comments',
              value: 'comments',
              ...(
                comments.length > 0
                  ? { amount: comments.length.toString() } : {}
              ),
            },
          ]}
          activeTab={currentTab}
          handleChangeTab={(tab: string) => setCurrentTab(tab as typeof currentTab)}
        />
        {currentTab === 'bids'
          ? (
            <BidsTab
              bids={bids}
              bidsLoading={bidsLoading}
              pagingToken={bidsNextPageToken}
              handleLoadBids={fetchBids}
            />
          ) : (
            <CommentsTab
              comments={comments}
            />
          )}
      </SActivitesContainer>
    </SWrapper>
  );
};

export default PostViewAC;

const SWrapper = styled.div`
  display: grid;

  grid-template-areas:
    'expires'
    'video'
    'title'
    'activities'
  ;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'expires expires'
      'title title'
      'video activities'
    ;
    grid-template-columns: 284px 1fr;
    grid-template-rows: 46px 64px 40px calc(506px - 46px);
    grid-column-gap: 16px;

    align-items: flex-start;
  }

  ${({ theme }) => theme.media.laptop} {
    grid-template-areas:
      'video expires'
      'video title'
      'video activities'
    ;

    grid-template-rows: 46px 64px 40px calc(728px - 46px - 64px - 40px);
    /* grid-template-rows: 1fr max-content; */

    grid-template-columns: 410px 1fr;
  }
`;

const SExpiresSection = styled.div`
  grid-area: expires;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: 'closeBtnMobile timer closeBtnDesktop';

  width: 100%;

  margin-bottom: 6px;
`;

const SGoBackButtonDesktop = styled.button`
  grid-area: closeBtnDesktop;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  width: 100%;
  border: transparent;
  background: transparent;
  padding: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;

const SActivitesContainer = styled.div`
  grid-area: activities;

  display: flex;
  flex-direction: column;

  min-height: calc(728px - 46px - 64px - 40px - 72px);

  ${({ theme }) => theme.media.tablet} {
    min-height: initial;
    height: calc(728px - 46px - 64px - 40px - 72px);
  }

  ${({ theme }) => theme.media.laptop} {
    height: calc(728px - 46px - 64px);
  }
`;
