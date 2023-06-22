import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { TUserData, useUserData } from '../../../contexts/userDataContext';
import Headline from '../../atoms/Headline';
import { getMyPosts } from '../../../api/endpoints/user';
import { getMyUrgentPosts } from '../../../api/endpoints/post';
import FinishProfileSetup from '../../atoms/creator/FinishProfileSetup';
import { usePushNotifications } from '../../../contexts/pushNotificationsContext';
import StripeIssueBanner from '../../molecules/creator/dashboard/StripeIssueBanner';
import { useAppState } from '../../../contexts/appStateContext';
import { ChatsProvider } from '../../../contexts/chatContext';
import Loader from '../../atoms/Loader';

const Navigation = dynamic(() => import('../../molecules/creator/Navigation'));
const DynamicSection = dynamic(
  () => import('../../molecules/creator/dashboard/DynamicSection')
);
const ExpirationPosts = dynamic(
  () => import('../../molecules/creator/dashboard/ExpirationPosts')
);
const Earnings = dynamic(
  () => import('../../molecules/creator/dashboard/Earnings')
);
const YourToDos = dynamic(
  () => import('../../molecules/creator/dashboard/YourToDos')
);
const AboutBundles = dynamic(
  () => import('../../molecules/creator/dashboard/AboutBundles')
);

// eslint-disable-next-line no-shadow
enum ToDosStatus {
  idle = 'idle',
  stepsLeft = 'stepsLeft',
  completed = 'completed',
}

function getIsToDosCompleted(
  userData: TUserData | undefined,
  creatorData: newnewapi.IGetMyOnboardingStateResponse | undefined
): ToDosStatus {
  if (!userData || !creatorData) {
    return ToDosStatus.idle;
  }
  if (
    userData?.bio &&
    userData?.bio.length > 0 &&
    creatorData?.isCreatorConnectedToStripe
  ) {
    return ToDosStatus.completed;
  }
  return ToDosStatus.stepsLeft;
}

export const Dashboard: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Creator');
  const router = useRouter();
  const { userData, creatorData, creatorDataLoaded } = useUserData();
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

  const [toDosStatus, setToDosStatus] = useState<ToDosStatus>(
    getIsToDosCompleted(userData, creatorData)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [expirationPosts, setExpirationPosts] = useState<newnewapi.IPost[]>([]);

  const [expiringPostsLoaded, setExpiringPostsLoaded] = useState(false);
  const [hasMyPosts, setHasMyPosts] = useState(false);

  useEffect(() => {
    if (router.query.askPushNotificationPermission === 'true') {
      setTimeout(() => promptUserWithPushNotificationsPermissionModal(), 200);
      router.replace(router.pathname);
    }
  }, [promptUserWithPushNotificationsPermissionModal, router]);

  useEffect(() => {
    if (creatorDataLoaded) {
      const toDoCompletionStatus = getIsToDosCompleted(userData, creatorData);
      setToDosStatus(toDoCompletionStatus);
    }
  }, [creatorDataLoaded, userData, creatorData]);

  const fetchMyExpiringPosts = useCallback(async () => {
    try {
      const payload = new newnewapi.PagedRequest();
      const res = await getMyUrgentPosts(payload);

      if (res.error) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      if (res.data?.posts) {
        setExpirationPosts(res.data?.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExpiringPostsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!expiringPostsLoaded && hasMyPosts) {
      fetchMyExpiringPosts();
    }
  }, [expiringPostsLoaded, hasMyPosts, fetchMyExpiringPosts]);

  // TODO: Need WS event to load new expiring posts

  const loadMyPosts = useCallback(async () => {
    if (isLoading) {
      return;
    }

    try {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
      });
      const postsResponse = await getMyPosts(payload);

      if (postsResponse?.data && postsResponse.data.posts) {
        setHasMyPosts(postsResponse.data.posts.length > 0);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!hasMyPosts && !isLoading) {
      loadMyPosts();
    } else {
      setIsLoading(false);
    }
  }, [isLoading, hasMyPosts, loadMyPosts]);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>{t('dashboard.title')}</STitle>
          {!isMobile && (
            <ChatsProvider>
              <DynamicSection baseUrl='/creator/dashboard' />
            </ChatsProvider>
          )}
        </STitleBlock>

        {expiringPostsLoaded && expirationPosts.length > 0 && (
          <SBlock>
            <ExpirationPosts expirationPosts={expirationPosts} />
          </SBlock>
        )}

        {creatorData?.stripeConnectStatus &&
          creatorData?.stripeConnectStatus ===
            newnewapi.GetMyOnboardingStateResponse.StripeConnectStatus
              .CONNECTED_NEEDS_ATTENTION && (
            <SBlock>
              <StripeIssueBanner />
            </SBlock>
          )}

        {!creatorDataLoaded ? (
          <SBlock>
            <SLoader size='md' />
          </SBlock>
        ) : (
          toDosStatus === ToDosStatus.stepsLeft &&
          // TODO: This should not require special logic. isCreatorConnectedToStripe should be true for WL creators
          !userData?.options?.isWhiteListed && (
            <SBlock name='your-todos'>
              <YourToDos />
            </SBlock>
          )
        )}
        {/* TODO: Why can't we show earnings for a case when WL creators "earns" something on the stream? */}
        {!userData?.options?.isWhiteListed && (
          <SBlock>
            {toDosStatus === ToDosStatus.completed && (
              <Earnings hasMyPosts={hasMyPosts} />
            )}
            {toDosStatus === ToDosStatus.stepsLeft && <FinishProfileSetup />}

            {/* Loader */}
            {toDosStatus === ToDosStatus.idle && <SLoader size='md' />}
          </SBlock>
        )}
        <SBlock noMargin>
          <AboutBundles />
        </SBlock>
      </SContent>
    </SContainer>
  );
});

export default Dashboard;

const SContainer = styled.div`
  position: relative;
  margin-top: -16px;
  margin-bottom: -24px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -40px;
    margin-bottom: -40px;
  }
`;

const SContent = styled.div`
  ${(props) => props.theme.media.tablet} {
    margin-left: 180px;
    min-height: 840px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 40px 32px;
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    margin-left: 224px;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
  }
`;

const STitle = styled(Headline)`
  font-weight: 600;
`;

interface ISBlock {
  name?: string;
  noMargin?: boolean;
}

const SBlock = styled.section<ISBlock>`
  ${(props) =>
    !props.noMargin &&
    css`
      margin-bottom: 24px;
    `}
  ${(props) => props.theme.media.tablet} {
    max-width: 100%;
  }
  ${(props) => props.theme.media.laptopL} {
    max-width: calc(100% - 435px);
  }
`;

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;
  justify-content: space-between;
`;

const SLoader = styled(Loader)`
  margin: 0 auto;
`;
