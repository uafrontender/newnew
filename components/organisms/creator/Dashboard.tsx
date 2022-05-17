/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import moment from 'moment';
import { useAppSelector } from '../../../redux-store/store';
import { getMySubscriptionProduct } from '../../../api/endpoints/subscription';
import Lottie from '../../atoms/Lottie';
import Headline from '../../atoms/Headline';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import { getMyPosts } from '../../../api/endpoints/user';
import { useGetSubscriptions } from '../../../contexts/subscriptionsContext';
import { getMyUrgentPosts } from '../../../api/endpoints/post';
import FinishProfileSetup from '../../atoms/creator/FinishProfileSetup';
import { getMyEarnings } from '../../../api/endpoints/payments';
import dateToTimestamp from '../../../utils/dateToTimestamp';

const Navigation = dynamic(() => import('../../molecules/creator/Navigation'));
const DynamicSection = dynamic(
  () => import('../../molecules/creator/dashboard/DynamicSection')
);
const ExpirationPosts = dynamic(
  () => import('../../molecules/creator/dashboard/ExpirationPosts')
);
const EnableSubscription = dynamic(
  () => import('../../molecules/creator/dashboard/EnableSubscription')
);
const SubscriptionStats = dynamic(
  () => import('../../molecules/creator/dashboard/SubscriptionStats')
);
const EmptySubscriptionStats = dynamic(
  () => import('../../molecules/creator/dashboard/EmptySubscriptionStats')
);
const Earnings = dynamic(
  () => import('../../molecules/creator/dashboard/Earnings')
);
const YourTodos = dynamic(
  () => import('../../molecules/creator/dashboard/YourTodos')
);

export const Dashboard: React.FC = React.memo(() => {
  const { t } = useTranslation('creator');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { mySubscribers } = useGetSubscriptions();
  const [mySubscriptionProduct, setMySubscriptionProduct] =
    useState<newnewapi.ISubscriptionProduct | null>(null);
  const [isTodosCompleted, setIsTodosCompleted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isEarningsLoading, setIsEarningsLoading] = useState(true);
  const [isMySubscriptionProductLoading, setIsMySubscriptionProductLoading] =
    useState(true);
  const [expirationPosts, setExprirationPosts] = useState<newnewapi.IPost[]>(
    []
  );
  const filter = '7_days';
  const [myEarnings, setMyEarnings] =
    useState<newnewapi.GetMyEarningsResponse | undefined>();
  const [isLoadingExpirationPosts, setIsLoadingExpirationPosts] =
    useState(true);
  const [hasMyPosts, setHasMyPosts] = useState(false);

  useEffect(() => {
    user.creatorData?.isLoaded &&
    user.creatorData?.hasCreatorTags &&
    user.userData?.bio &&
    user.userData?.bio.length > 0 &&
    user.creatorData?.options?.isCreatorConnectedToStripe
      ? setIsTodosCompleted(true)
      : setIsTodosCompleted(false);
  }, [user.creatorData, user.userData]);

  const fetchMySubscriptionProduct = async () => {
    try {
      const payload = new newnewapi.EmptyRequest();
      const res = await getMySubscriptionProduct(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      if (res.data?.myProduct) setMySubscriptionProduct(res.data?.myProduct);
      setIsMySubscriptionProductLoading(false);
    } catch (err) {
      console.error(err);
      setIsMySubscriptionProductLoading(false);
    }
  };

  const fetchMyExpirationPosts = async () => {
    try {
      const payload = new newnewapi.PagedRequest();
      const res = await getMyUrgentPosts(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      if (res.data?.posts) setExprirationPosts(res.data?.posts);
      setIsLoadingExpirationPosts(false);
    } catch (err) {
      setIsLoadingExpirationPosts(false);
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLoadingExpirationPosts) {
      fetchMyExpirationPosts();
    }
  }, [isLoadingExpirationPosts]);

  useEffect(() => {
    if (!mySubscriptionProduct) {
      fetchMySubscriptionProduct();
    }
  }, [mySubscriptionProduct]);

  const loadMyPosts = useCallback(async () => {
    if (isLoading) return;
    try {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
      });
      const postsResponse = await getMyPosts(payload);

      if (postsResponse.data && postsResponse.data.posts) {
        if (postsResponse.data.posts.length > 0) setHasMyPosts(true);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isTodosCompleted && !hasMyPosts && !isLoading) {
      loadMyPosts();
    } else {
      setIsLoading(false);
    }
  }, [isTodosCompleted, isLoading, hasMyPosts, loadMyPosts]);

  const fetchMyEarnings = useCallback(async () => {
    try {
      const payload = new newnewapi.GetMyEarningsRequest({
        beginDate: dateToTimestamp(
          moment()
            .subtract(
              filter.split('_')[0],
              filter.split('_')[1] as moment.unitOfTime.DurationConstructor
            )
            .startOf('day')
        ),
        endDate: dateToTimestamp(new Date()),
      });
      const res = await getMyEarnings(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      setMyEarnings(res.data);
      setIsEarningsLoading(false);
    } catch (err) {
      setIsEarningsLoading(false);
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEarningsLoading]);

  useEffect(() => {
    if (isTodosCompleted && !myEarnings && isEarningsLoading) {
      fetchMyEarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTodosCompleted]);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>{t('dashboard.title')}</STitle>
          {!isMobile && <DynamicSection />}
        </STitleBlock>
        {!user.creatorData?.isLoaded ? (
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        ) : (
          !isTodosCompleted && (
            <SBlock name='your-todos'>
              <YourTodos />
            </SBlock>
          )
        )}
        {isLoadingExpirationPosts ? (
          <SBlock>
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          </SBlock>
        ) : (
          expirationPosts.length > 0 && (
            <SBlock>
              <ExpirationPosts expirationPosts={expirationPosts} />
            </SBlock>
          )
        )}
        <SBlock>
          {!isEarningsLoading ? (
            isTodosCompleted ? (
              <Earnings hasMyPosts={hasMyPosts} earnings={myEarnings} />
            ) : (
              <FinishProfileSetup />
            )
          ) : (
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          )}
        </SBlock>
        {!isMySubscriptionProductLoading ? (
          !mySubscriptionProduct ? (
            <SBlock noMargin>
              <EnableSubscription />
            </SBlock>
          ) : (
            <SBlock noMargin>
              {mySubscribers.length > 0 ? (
                <SubscriptionStats />
              ) : (
                <EmptySubscriptionStats />
              )}
            </SBlock>
          )
        ) : (
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        )}
      </SContent>
    </SContainer>
  );
});

export default Dashboard;

const SContainer = styled.div`
  position: relative;
  margin-top: -16px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -40px;
    margin-bottom: -40px;
  }
`;

const SContent = styled.div`
  min-height: 840px;

  ${(props) => props.theme.media.tablet} {
    margin-left: 180px;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(100vw - 320px);
    padding: 40px 32px;
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    margin-left: 224px;
    border-top-left-radius: 24px;
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
