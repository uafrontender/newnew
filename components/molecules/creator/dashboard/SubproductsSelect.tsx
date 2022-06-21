/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-lonely-if */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';
import {
  getStandardSubscriptionProducts,
  setMySubscriptionProduct,
} from '../../../../api/endpoints/subscription';
import Text from '../../../atoms/Text';
import Lottie from '../../../atoms/Lottie';
import Button from '../../../atoms/Button';
import { formatNumber } from '../../../../utils/format';
import SubsFeatures from '../../../atoms/dashboard/SubsFeatures';
import checkBoxAnim from '../../../../public/animations/checkbox-subrate.json';
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import EnableSubModal from '../../../atoms/dashboard/EnableSubModal';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { setUserData } from '../../../../redux-store/slices/userStateSlice';

interface ISubProductsSelect {
  mySubscriptionProduct: newnewapi.ISubscriptionProduct | null;
}

const SubProductsSelect: React.FC<ISubProductsSelect> = ({
  mySubscriptionProduct,
}) => {
  const { t } = useTranslation('page-Creator');
  const [standardProducts, setStandardProducts] = useState<
    newnewapi.ISubscriptionProduct[]
  >([]);
  const [selectedProduct, setSelectedProduct] =
    useState<newnewapi.ISubscriptionProduct>();
  const [isLoading, setIsLoading] = useState(true);
  const [confirmSubEnable, setConfirmSubEnable] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const getStandardProductsPayload = new newnewapi.EmptyRequest({});
        const getStandardProductsRes = await getStandardSubscriptionProducts(
          getStandardProductsPayload
        );
        if (getStandardProductsRes.data) {
          setStandardProducts(getStandardProductsRes.data.products);
        }
        setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    }

    fetchOnboardingState();
  }, []);

  useEffect(() => {
    if (mySubscriptionProduct) {
      setSelectedProduct(mySubscriptionProduct);
    } else {
      if (standardProducts.length > 0) {
        setSelectedProduct(standardProducts[0]);
      }
    }
  }, [mySubscriptionProduct, standardProducts]);

  const handleSetSelectedProduct = (
    product: newnewapi.ISubscriptionProduct
  ) => {
    setSelectedProduct(product);
  };

  const handlerConfirmEnable = () => {
    setConfirmSubEnable(true);
  };

  const setRate = async () => {
    try {
      const payload = new newnewapi.SetMySubscriptionProductRequest({
        productId: selectedProduct ? selectedProduct.id : null,
      });
      const res = await setMySubscriptionProduct(payload);

      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      setConfirmSubEnable(false);
      if (!user.userData?.options?.isOfferingSubscription) {
        dispatch(
          setUserData({
            options: {
              ...user.userData?.options,
              isOfferingSubscription: true,
            },
          })
        );
      }
      router.push('/creator/subscribers');
    } catch (err) {
      console.error(err);
    }
  };

  const handlerUpdateRate = async () => {
    await setRate();
    router.push('/creator/subscribers');
  };

  return (
    <>
      {!isLoading ? (
        <SContainer>
          <SProductOptions>
            {standardProducts.map((p) => (
              <ProductOption
                key={p.id}
                product={p}
                selected={selectedProduct ? selectedProduct.id === p.id : false}
                handleClick={() => handleSetSelectedProduct(p)}
                currentProduct={
                  mySubscriptionProduct
                    ? mySubscriptionProduct.id === p.id
                    : false
                }
              />
            ))}
          </SProductOptions>
          <SubsFeatures />
          <SNote>{t('subscribersFeatures.note')}</SNote>
          <SActions>
            <Link
              href={
                !mySubscriptionProduct
                  ? '/creator/dashboard'
                  : '/creator/subscribers'
              }
            >
              <Button view='quaternary'>
                {t('subRateSection.button.back')}
              </Button>
            </Link>
            {!mySubscriptionProduct ? (
              <Button view='primaryGrad' onClick={() => handlerConfirmEnable()}>
                {t('subRateSection.button.enable')}
              </Button>
            ) : (
              <Button
                view='primaryGrad'
                disabled={
                  selectedProduct &&
                  mySubscriptionProduct.id === selectedProduct.id
                }
                onClick={() => handlerUpdateRate()}
              >
                {t('subRateSection.button.update')}
              </Button>
            )}
          </SActions>
          {selectedProduct && !mySubscriptionProduct && (
            <EnableSubModal
              confirmEnableSub={confirmSubEnable}
              selectedProduct={selectedProduct}
              closeModal={() => setConfirmSubEnable(false)}
              subEnabled={setRate}
            />
          )}
        </SContainer>
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
    </>
  );
};

export default SubProductsSelect;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 608px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    flex-wrap: wrap;
    /* gap: 16px; */
  }
`;

const SProductOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;
const SActions = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const SNote = styled.p`
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  line-height: 16px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin: 0 0 16px;
`;

interface IProductOption {
  selected: boolean;
  currentProduct: boolean;
  product: newnewapi.ISubscriptionProduct;
  handleClick: () => void;
}

const ProductOption: React.FunctionComponent<IProductOption> = ({
  selected,
  product,
  handleClick,
  currentProduct,
}) => {
  const { t } = useTranslation('page-Creator');
  const ref: any = useRef();

  useEffect(() => {
    ref.current.anim.stop();

    if (selected) {
      ref.current.anim.setSegment(0, 23);
    } else {
      ref.current.anim.setSegment(1, 1);
    }
    ref.current.anim.play();
  }, [ref, selected]);

  return (
    <SProductOption selected={selected ?? false} onClick={handleClick}>
      <SAnimation>
        <Lottie
          ref={ref}
          width={18}
          height={18}
          options={{
            loop: false,
            autoplay: false,
            animationData: checkBoxAnim,
          }}
        />
      </SAnimation>
      <SLabelContent>
        {product.id !== '' ? (
          <>
            {product?.monthlyRate?.usdCents && (
              <SPrice variant={1} weight={600} selected={selected ?? false}>
                ${formatNumber(product.monthlyRate.usdCents / 100 ?? 0, true)}
              </SPrice>
            )}
            <SPerMonth variant={2} selected={selected ?? false}>
              {t('subRateSection.selectInput.perMonth')}
            </SPerMonth>
            {currentProduct && (
              <SLabelCurrent selected={selected ?? false}>
                Current
              </SLabelCurrent>
            )}
          </>
        ) : (
          <Text variant={2}>{t('subRateSection.selectInput.noProduct')}</Text>
        )}
      </SLabelContent>
    </SProductOption>
  );
};

const SProductOption = styled.button<{
  selected: boolean;
}>`
  display: flex;
  align-items: center;
  position: relative;
  border: none;
  border-radius: 16px;
  width: 100%;

  background: ${({ selected, theme }) =>
    selected
      ? 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF'
      : theme.name === 'light'
      ? theme.colors.white
      : theme.colorsThemed.background.secondary};

  padding: 24px 16px 24px 27px;
  margin-top: 8px;
  margin-bottom: 8px;

  cursor: pointer;
  transition: 0.2s linear;

  ${({ theme }) => theme.media.tablet} {
    width: 49%;
  }
`;

const SAnimation = styled.div`
  margin-right: 11px;
`;

const SLabelContent = styled.div`
  position: relative;

  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 4px;

  padding-left: 3px;
`;

const SPrice = styled(Text)<{
  selected: boolean;
}>`
  color: ${({ selected }) => (selected ? '#fff' : '')};
`;

const SPerMonth = styled(Text)<{
  selected: boolean;
}>`
  color: ${({ theme, selected }) =>
    selected
      ? 'rgba(255,255,255,.4)'
      : theme.name === 'light'
      ? '#586070'
      : theme.colorsThemed.text.tertiary};
`;

const SLabelCurrent = styled.div<{
  selected: boolean;
}>`
  border-radius: 20px;
  background: ${({ selected, theme }) =>
    selected
      ? '#fff'
      : theme.name !== 'light'
      ? theme.colors.white
      : 'linear-gradient(315deg, rgba(29, 180, 255, 0.85) 0%, rgba(29, 180, 255, 0) 50%), #1D6AFF'};
  margin: auto 0 auto auto;
  padding: 6px;
  font-weight: bold;
  color: ${({ theme, selected }) =>
    selected
      ? '#2C2C33'
      : theme.name === 'light'
      ? theme.colors.white
      : '#2C2C33'};
`;
