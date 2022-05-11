import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Headline from '../../../atoms/Headline';
import { useAppSelector } from '../../../../redux-store/store';
import { getMySubscriptionProduct } from '../../../../api/endpoints/subscription';
import { useGetSubscriptions } from '../../../../contexts/subscriptionsContext';
import { getMyOnboardingState } from '../../../../api/endpoints/user';

const SubscribersTable = dynamic(
  () => import('../../../molecules/creator/dashboard/SubscribersTable')
);
const NoResults = dynamic(
  () => import('../../../molecules/creator/dashboard/NoResults')
);
const Navigation = dynamic(
  () => import('../../../molecules/creator/Navigation')
);

export const Subscriptions: React.FC = React.memo(() => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const router = useRouter();

  const { mySubscribersTotal } = useGetSubscriptions();
  const [mySubscriptionProduct, setMySubscriptionProduct] =
    useState<newnewapi.ISubscriptionProduct | null>(null);

  const [onboardingState, setOnboardingState] =
    useState<newnewapi.GetMyOnboardingStateResponse>();
  const [isLoadingOnboardingState, setIsLoadingOnboardingState] =
    useState(true);

  const fetchMySubscriptionProduct = async () => {
    try {
      const payload = new newnewapi.EmptyRequest();
      const res = await getMySubscriptionProduct(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      if (res.data?.myProduct) {
        setMySubscriptionProduct(res.data?.myProduct);
      } else {
        /* eslint-disable no-unused-expressions */
        !onboardingState?.isCreatorConnectedToStripe
          ? router.replace('/creator/get-paid')
          : router.replace('/creator/subscribers/edit-subscription-rate');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);

        if (res.data) {
          setOnboardingState(res.data);
        }
        setIsLoadingOnboardingState(false);
      } catch (err) {
        console.error(err);
      }
    }

    fetchOnboardingState();
  }, []);

  useEffect(() => {
    if (!mySubscriptionProduct && !isLoadingOnboardingState) {
      fetchMySubscriptionProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySubscriptionProduct, isLoadingOnboardingState]);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>
            {t('subscriptions.title')}{' '}
            {mySubscribersTotal > 0 && `(${mySubscribersTotal})`}
          </STitle>
        </STitleBlock>
        {!mySubscribersTotal || mySubscribersTotal < 1 ? (
          <NoResults
            isCreatorConnectedToStripe={
              onboardingState?.isCreatorConnectedToStripe
            }
          />
        ) : (
          <SubscribersTable />
        )}
      </SContent>
    </SContainer>
  );
});

export default Subscriptions;

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
  margin-bottom: 30px;
  width: 100%;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 24px;
  padding: 19px 0 30px;

  ${(props) => props.theme.media.tablet} {
    margin-left: 200px;
    width: calc(100vw - 270px);
    padding: 40px 0;
  }

  ${(props) => props.theme.media.laptop} {
    margin-left: 224px;
    width: calc(100vw - 385px);
  }
`;

const STitle = styled(Headline)``;

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  padding: 0 24px;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 48px;
  }
`;
