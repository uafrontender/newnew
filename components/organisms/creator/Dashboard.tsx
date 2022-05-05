import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useAppSelector } from '../../../redux-store/store';
import { getMySubscriptionProduct } from '../../../api/endpoints/subscription';

import Lottie from '../../atoms/Lottie';
import Headline from '../../atoms/Headline';
import Navigation from '../../molecules/creator/Navigation';
import Earnings from '../../molecules/creator/dashboard/Earnings';
import YourTodos from '../../molecules/creator/dashboard/YourTodos';
import DynamicSection from '../../molecules/creator/dashboard/DynamicSection';
import ExpirationPosts from '../../molecules/creator/dashboard/ExpirationPosts';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import SubscriptionStats from '../../molecules/creator/dashboard/SubscriptionStats';
import EnableSubscription from '../../molecules/creator/dashboard/EnableSubscription';
import EmptySubscriptionStats from '../../molecules/creator/dashboard/EmptySubscriptionStats';

import { getMyPosts } from '../../../api/endpoints/user';
import { useGetSubscriptions } from '../../../contexts/subscriptionsContext';
import { getMyUrgentPosts } from '../../../api/endpoints/post';

export const Dashboard: React.FC = React.memo(() => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { mySubscribers } = useGetSubscriptions();
  const [mySubscriptionProduct, setMySubscriptionProduct] =
    useState<newnewapi.ISubscriptionProduct | null>(null);
  const [isTodosCompleted, setIsTodosCompleted] = useState<boolean>(false);
  const [isTodosCompletedLoading, setIsTodosCompletedLoading] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [expirationPosts, setExprirationPosts] = useState<newnewapi.IPost[]>(
    []
  );
  const [isLoadingExpirationPosts, setIsLoadingExpirationPosts] =
    useState(true);
  const [hasMyPosts, setHasMyPosts] = useState(false);

  const fetchMySubscriptionProduct = async () => {
    try {
      const payload = new newnewapi.EmptyRequest();
      const res = await getMySubscriptionProduct(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      if (res.data?.myProduct) setMySubscriptionProduct(res.data?.myProduct);
    } catch (err) {
      console.error(err);
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

  const todosCompleted = (value: boolean) => {
    setIsTodosCompleted(value);
  };

  const todosCompletedLoading = (value: boolean) => {
    setIsTodosCompletedLoading(value);
  };

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

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>{t('dashboard.title')}</STitle>
          {!isMobile && <DynamicSection />}
        </STitleBlock>
        <SBlock name='your-todos'>
          <YourTodos
            todosCompleted={todosCompleted}
            todosCompletedLoading={todosCompletedLoading}
          />
        </SBlock>
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
          <SBlock>
            <ExpirationPosts expirationPosts={expirationPosts} />
          </SBlock>
        )}
        <SBlock>
          <Earnings
            isTodosCompleted={isTodosCompleted}
            isTodosCompletedLoading={isTodosCompletedLoading}
            hasMyPosts={hasMyPosts}
          />
        </SBlock>
        {!mySubscriptionProduct ? (
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
  min-height: calc(100vh - 120px);

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

const STitle = styled(Headline)``;

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
    min-width: 608px;
    max-width: 100%;
  }
  ${(props) => props.theme.media.laptopL} {
    max-width: calc(100% - 464px);
  }
`;

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;
  justify-content: space-between;
`;
