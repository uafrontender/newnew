import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import Headline from '../../../atoms/Headline';
import Navigation from '../../../molecules/creator/Navigation';

import { useAppSelector } from '../../../../redux-store/store';
import { getMySubscriptionProduct } from '../../../../api/endpoints/subscription';
import { useGetSubscriptions } from '../../../../contexts/subscriptionsContext';
import NoResults from '../../../molecules/creator/dashboard/NoResults';
import SubscribersTable from '../../../molecules/creator/dashboard/SubscribersTable';

export const Subscriptions = () => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const router = useRouter();

  const { mySubscribersTotal } = useGetSubscriptions();
  const [mySubscriptionProduct, setMySubscriptionProduct] = useState<newnewapi.ISubscriptionProduct | null>(null);

  const fetchMySubscriptionProduct = async () => {
    try {
      const payload = new newnewapi.EmptyRequest();
      const res = await getMySubscriptionProduct(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      if (res.data?.myProduct) {
        setMySubscriptionProduct(res.data?.myProduct);
      } else {
        router.push('/creator/subscribers/edit-subscription-rate');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!mySubscriptionProduct) {
      fetchMySubscriptionProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySubscriptionProduct]);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>
            {t('subscriptions.title')} {mySubscribersTotal > 0 && `(${mySubscribersTotal})`}
          </STitle>
        </STitleBlock>
        {!mySubscribersTotal || mySubscribersTotal < 1 ? <NoResults /> : <SubscribersTable />}
      </SContent>
    </SContainer>
  );
};

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
