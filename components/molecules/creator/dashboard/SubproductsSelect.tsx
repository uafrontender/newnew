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
import checkBoxAnim from '../../../../public/animations/checkbox.json';
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import EnableSubModal from '../../../atoms/dashboard/EnableSubModal';
import RemoveSubModal from '../../../atoms/dashboard/RemoveSubModal';

interface ISubproductsSelect {
  mySubscriptionProduct: newnewapi.ISubscriptionProduct | null;
  removedMyProduct: () => void;
}

const SubproductsSelect: React.FC<ISubproductsSelect> = ({
  mySubscriptionProduct,
  removedMyProduct,
}) => {
  const { t } = useTranslation('creator');
  const [standardProducts, setStandardProducts] = useState<
    newnewapi.ISubscriptionProduct[]
  >([]);
  const [selectedProduct, setSelectedProduct] =
    useState<newnewapi.ISubscriptionProduct>();
  const [isLoading, setIsLoading] = useState(true);
  const [confirmSubEnable, setConfirmSubEnable] = useState<boolean>(false);
  const router = useRouter();

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
        productId: selectedProduct!!.id,
      });
      const res = await setMySubscriptionProduct(payload);

      if (res.error) throw new Error(res.error?.message ?? 'Request failed');

      setConfirmSubEnable(false);
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
                isMyProduct={
                  mySubscriptionProduct
                    ? mySubscriptionProduct.id === p.id
                    : false
                }
                selected={selectedProduct ? selectedProduct.id === p.id : false}
                handleClick={() => handleSetSelectedProduct(p)}
                removedMyProduct={removedMyProduct}
              />
            ))}
          </SProductOptions>
          <SubsFeatures />
          <SActions>
            <Link
              href={
                !mySubscriptionProduct
                  ? '/creator/dashboard'
                  : '/creator/subscribers'
              }
            >
              <Button view='quaternary'>
                {t('SubrateSection.backButton')}
              </Button>
            </Link>
            {!mySubscriptionProduct ? (
              <Button view='primaryGrad' onClick={() => handlerConfirmEnable()}>
                {t('SubrateSection.submitDesktop')}
              </Button>
            ) : (
              <Button
                view='primaryGrad'
                disabled={mySubscriptionProduct.id === selectedProduct!!.id}
                onClick={() => handlerUpdateRate()}
              >
                {t('SubrateSection.updateRate')}
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

export default SubproductsSelect;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 608px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
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

interface IProductOption {
  selected: boolean;
  isMyProduct: boolean;
  product: newnewapi.ISubscriptionProduct;
  handleClick: () => void;
  removedMyProduct: () => void;
}

const ProductOption: React.FunctionComponent<IProductOption> = ({
  selected,
  product,
  handleClick,
  isMyProduct,
  removedMyProduct,
}) => {
  const { t } = useTranslation('creator');
  const ref: any = useRef();
  const [confirmSubEnable, setConfirmSubEnable] = useState<boolean>(false);

  const removeMyProduct = async () => {
    try {
      const payload = new newnewapi.SetMySubscriptionProductRequest({
        productId: null,
      });
      const res = await setMySubscriptionProduct(payload);

      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      setConfirmSubEnable(false);
      removedMyProduct();
    } catch (err) {
      console.error(err);
      setConfirmSubEnable(false);
    }
  };

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
            <Text variant={1} weight={600}>
              ${formatNumber(product?.monthlyRate?.usdCents!! / 100 ?? 0, true)}
            </Text>
            <SPerMonth variant={2}>
              {t('SubrateSection.selectInput.perMonth')}
            </SPerMonth>
          </>
        ) : (
          <Text variant={2}>{t('SubrateSection.selectInput.noProduct')}</Text>
        )}
      </SLabelContent>
      {isMyProduct && (
        <>
          <SButton
            view='danger'
            onClick={() => {
              setConfirmSubEnable(true);
            }}
          >
            {t('SubrateSection.removeSubscription')}
          </SButton>
          <RemoveSubModal
            confirmEnableSub={confirmSubEnable}
            closeModal={() => setConfirmSubEnable(false)}
            subEnabled={removeMyProduct}
          />
        </>
      )}
    </SProductOption>
  );
};

const SProductOption = styled.button<{
  selected: boolean;
}>`
  display: flex;
  align-items: center;
  position: relative;

  border-style: solid;
  border-width: 2px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  border-color: ${({ theme, selected }) =>
    selected ? theme.colorsThemed.accent.blue : 'transparent'};

  width: 100%;

  background: ${({ selected, theme }) =>
    selected
      ? 'linear-gradient(0deg, rgba(29, 106, 255, 0.2), rgba(29, 106, 255, 0.2))'
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

const SPerMonth = styled(Text)`
  color: ${({ theme }) =>
    theme.name === 'light' ? '#586070' : theme.colorsThemed.text.tertiary};
`;

const SButton = styled(Button)`
  position: absolute;
  right: 0;
  top: -25px;
  font-size: 14px;
  line-height: 20px;
  padding: 14px 16px;
`;
