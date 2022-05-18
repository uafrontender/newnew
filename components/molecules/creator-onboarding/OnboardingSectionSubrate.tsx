import React, { useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import GoBackButton from '../GoBackButton';
import Headline from '../../atoms/Headline';
import OnboardingSubproductSelect from './OnboardingSubproductsSelect';
import LoadingModal from '../LoadingModal';
import { setMySubscriptionProduct } from '../../../api/endpoints/subscription';
import { setUserData } from '../../../redux-store/slices/userStateSlice';

interface IOnboardingSectionSubrate {
  standardProducts: newnewapi.ISubscriptionProduct[];
  featuredProductsIds: string[];
  currentProduct?: newnewapi.ISubscriptionProduct;
}

const OnboardingSectionSubrate: React.FunctionComponent<IOnboardingSectionSubrate> =
  ({ standardProducts, featuredProductsIds, currentProduct }) => {
    const router = useRouter();
    const { t } = useTranslation('creator-onboarding');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const user = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();

    // Selected products
    const [selectedProduct, setSelectedProduct] = useState(
      currentProduct ??
        standardProducts[
          standardProducts.findIndex((p) =>
            featuredProductsIds.includes(p.id as string)
          )
        ]
    );

    const [loadingModalOpen, setLoadingModalOpen] = useState(false);

    const handleSetSelectedProduct = (
      product: newnewapi.ISubscriptionProduct
    ) => {
      setSelectedProduct(product);
    };

    const handleSubmit = async () => {
      try {
        setLoadingModalOpen(true);

        const payload = new newnewapi.SetMySubscriptionProductRequest({
          productId: selectedProduct.id,
        });

        const res = await setMySubscriptionProduct(payload);

        if (res.error) throw new Error(res.error?.message ?? 'Request failed');

        if (
          !user.userData?.options?.isOfferingSubscription &&
          selectedProduct.id &&
          selectedProduct.id?.length > 0
        ) {
          dispatch(
            setUserData({
              options: {
                ...user.userData?.options,
                isOfferingSubscription: true,
              },
            })
          );
        } else {
          dispatch(
            setUserData({
              options: {
                ...user.userData?.options,
                isOfferingSubscription: false,
              },
            })
          );
        }

        router.push('/creator/dashboard');
      } catch (err) {
        setLoadingModalOpen(false);
        console.error(err);
      }
    };

    return (
      <SContainer>
        {isMobile && <SGoBackButton onClick={() => router.back()} />}
        <SHeadline variant={5}>
          <span>{t('SubrateSection.heading')}</span>
        </SHeadline>
        <OnboardingSubproductSelect
          currentProduct={selectedProduct}
          standardProducts={standardProducts}
          featuredProductsIds={featuredProductsIds}
          handleSelectProduct={handleSetSelectedProduct}
        />
        <SControlsDiv>
          {!isMobile && (
            <GoBackButton noArrow onClick={() => router.back()}>
              {t('AboutSection.backButton')}
            </GoBackButton>
          )}
          <Button
            view='primaryGrad'
            style={{
              width: isMobile ? '100%' : 'initial',
            }}
            onClick={() => handleSubmit()}
          >
            {isMobile
              ? t('AboutSection.submitMobile')
              : t('AboutSection.submitDesktop')}
          </Button>
        </SControlsDiv>
        {/* Loading Modal */}
        <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      </SContainer>
    );
  };

OnboardingSectionSubrate.defaultProps = {
  currentProduct: undefined,
};

export default OnboardingSectionSubrate;

const SContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;

  padding-bottom: 88px;

  z-index: 2;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 0;

    padding-left: 152px;
    padding-right: 152px;

    margin-bottom: 44px;

    margin-top: 114px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: fit-content;

    padding-left: 0;
    padding-right: 104px;

    margin-bottom: 190px;
    margin-top: 44px;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  padding-top: 16px;
  padding-bottom: 22px;
  margin-left: -4px;
`;

const SControlsDiv = styled.div`
  position: fixed;
  width: calc(100% - 32px);
  bottom: 16px;

  display: flex;
  justify-content: space-between;

  button {
    width: 100%;
    height: 56px;
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;
    margin-top: 24px;

    margin-left: initial;
    width: 100%;

    button {
      width: 170px;
      height: 48px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 35%;
  }
`;

const SHeadline = styled(Headline)`
  display: flex;
  align-items: flex-start;

  margin-bottom: 40px;

  span {
    position: relative;
    top: 3px;
  }
`;
