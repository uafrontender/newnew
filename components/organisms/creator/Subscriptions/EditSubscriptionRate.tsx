import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import Headline from '../../../atoms/Headline';
import Navigation from '../../../molecules/creator/Navigation';

import { useAppSelector } from '../../../../redux-store/store';
import { getMySubscriptionProduct } from '../../../../api/endpoints/subscription';
import SubproductsSelect from '../../../molecules/creator/dashboard/SubproductsSelect';

export const EditSubscriptionRate: React.FC = React.memo(() => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const [mySubscriptionProduct, setMySubscriptionProduct] =
    useState<newnewapi.ISubscriptionProduct | null>(null);

  const fetchMySubscriptionProduct = async () => {
    try {
      const payload = new newnewapi.EmptyRequest();
      const res = await getMySubscriptionProduct(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      if (res.data?.myProduct) {
        setMySubscriptionProduct(res.data?.myProduct);
      } else {
        setMySubscriptionProduct(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!mySubscriptionProduct) {
      fetchMySubscriptionProduct();
    }
  }, [mySubscriptionProduct]);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>{t('SubrateSection.heading')}</STitle>
        </STitleBlock>
        <SubproductsSelect
          mySubscriptionProduct={mySubscriptionProduct}
          removedMyProduct={fetchMySubscriptionProduct}
        />
      </SContent>
    </SContainer>
  );
});

export default EditSubscriptionRate;

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
  margin-bottom: 30px;
  /* width: calc(100vw - 180px); */

  ${(props) => props.theme.media.tablet} {
    margin-left: 180px;
    /* width: calc(100vw - 365px); */
    padding: 40px 32px;
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    border-radius: 24px;
  }

  ${(props) => props.theme.media.desktop} {
    margin-left: 224px;
  }
`;

const STitle = styled(Headline)`
  font-weight: 600;
`;

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;
  justify-content: space-between;
`;
