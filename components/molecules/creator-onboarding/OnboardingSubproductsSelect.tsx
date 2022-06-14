/* eslint-disable no-unsafe-optional-chaining */
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import Lottie from '../../atoms/Lottie';

import checkBoxAnim from '../../../public/animations/checkbox.json';

import Text from '../../atoms/Text';
import { formatNumber } from '../../../utils/format';

interface IOnboardingSubproductSelect {
  standardProducts: newnewapi.ISubscriptionProduct[];
  currentProduct: newnewapi.ISubscriptionProduct;
  featuredProductsIds: string[];
  handleSelectProduct: (product: newnewapi.ISubscriptionProduct) => void;
}

const OnboardingSubproductSelect: React.FunctionComponent<IOnboardingSubproductSelect> =
  ({
    standardProducts,
    currentProduct,
    featuredProductsIds,
    handleSelectProduct,
  }) => (
    <SContainer>
      <ProductOption
        product={
          new newnewapi.SubscriptionProduct({
            id: '',
          })
        }
        selected={currentProduct && currentProduct.id === ''}
        featured={false}
        handleClick={() =>
          handleSelectProduct(
            new newnewapi.SubscriptionProduct({
              id: '',
            })
          )
        }
      />
      {standardProducts.map((p) => (
        <ProductOption
          key={p.id}
          product={p}
          selected={currentProduct && currentProduct.id === p.id}
          featured={featuredProductsIds.includes(p.id as string)}
          handleClick={() => handleSelectProduct(p)}
        />
      ))}
    </SContainer>
  );

export default OnboardingSubproductSelect;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    /* justify-content: space-between; */
    flex-wrap: wrap;
    gap: 16px;
  }
`;

interface IProductOption {
  selected: boolean;
  featured: boolean;
  product: newnewapi.ISubscriptionProduct;
  handleClick: () => void;
}

const ProductOption: React.FunctionComponent<IProductOption> = ({
  selected,
  featured,
  product,
  handleClick,
}) => {
  const { t } = useTranslation('page-CreatorOnboarding');
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
          width={24}
          height={24}
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
              <Text variant={2}>
                ${formatNumber(product.monthlyRate.usdCents / 100 ?? 0, true)}
              </Text>
            )}
            <SPerMonth variant={2}>
              {t('subRateSection.selectInput.perMonth')}
            </SPerMonth>
            {featured && (
              <SFeaturedLabel>
                {t('subRateSection.selectInput.featured')}
              </SFeaturedLabel>
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

  border-style: solid;
  border-width: 2px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  border-color: ${({ theme, selected }) =>
    selected ? theme.colorsThemed.accent.blue : 'transparent'};

  width: 100%;

  background: ${({ selected, theme }) =>
    selected
      ? 'linear-gradient(0deg, rgba(29, 106, 255, 0.2), rgba(29, 106, 255, 0.2))'
      : theme.colorsThemed.background.tertiary};

  padding: 27px 16px;
  margin-top: 6px;
  margin-bottom: 6px;

  cursor: pointer;
  transition: 0.2s linear;

  ${({ theme }) => theme.media.tablet} {
    width: 45%;
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
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SFeaturedLabel = styled.div`
  position: absolute;
  top: calc(50% - 16px);
  right: 0px;

  border-radius: 24px;
  padding: 8px 16px;

  background: ${({ theme }) => theme.colorsThemed.accent.blue};

  color: #fff;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
`;
