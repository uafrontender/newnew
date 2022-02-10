import React, {
  useEffect, useRef,
} from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';

import Lottie from '../../atoms/Lottie';

import checkBoxAnim from '../../../public/animations/checkbox.json';

// Temp!
import { TSubProduct } from '../../../pages/creator-onboarding-subrate';
import Text from '../../atoms/Text';
import { formatNumber } from '../../../utils/format';

interface IOnboardingSubproductSelect {
  standardProducts: TSubProduct[];
  currentProduct: TSubProduct;
  handleSelectProduct: (product: TSubProduct) => void;
}

const OnboardingSubproductSelect: React.FunctionComponent<IOnboardingSubproductSelect> = ({
  standardProducts,
  currentProduct,
  handleSelectProduct,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  return (
    <SContainer>
      {isMobile ? (
        standardProducts.map((p) => (
          <ProductOptionMobile
            key={p.id}
            product={p}
            selected={currentProduct.id === p.id}
            handleClick={() => handleSelectProduct(p)}
          />
        ))
      ) : (
        standardProducts.map((p) => (
          <ProductOptionDesktop
            key={p.id}
            product={p}
            selected={currentProduct.id === p.id}
            handleClick={() => handleSelectProduct(p)}
          />
        ))
      )}
    </SContainer>
  );
};

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
  product: TSubProduct;
  handleClick: () => void;
}

const ProductOptionMobile: React.FunctionComponent<IProductOption> = ({
  selected,
  product,
  handleClick,
}) => {
  const { t } = useTranslation('creator-onboarding');
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
    <SProductOptionMobile
      selected={selected ?? false}
      onClick={handleClick}
    >
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
        <Text
          variant={2}
        >
          $
          {formatNumber((product.monthlyRate.usdCents!! / 100) ?? 0, true)}
        </Text>
        <SPerMonth
          variant={2}
        >
          { t('SubrateSection.selectInput.perMonth') }
        </SPerMonth>
      </SLabelContent>
    </SProductOptionMobile>
  );
};


const SProductOptionMobile = styled.button<{
  selected: boolean;
}>`
  display: flex;
  align-items: center;

  border-style: solid;
  border-width: 2px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  border-color: ${({ theme, selected }) => (selected ? theme.colorsThemed.accent.blue : 'transparent')};

  width: 100%;

  background: ${({ selected, theme }) => (selected ?
    'linear-gradient(0deg, rgba(29, 106, 255, 0.2), rgba(29, 106, 255, 0.2))' : theme.colorsThemed.background.tertiary)};;

  padding: 16px 16px;
  margin-top: 6px;
  margin-bottom: 6px;

  cursor: pointer;
  transition: .2s linear;
`;

const SAnimation = styled.div`
  margin-right: 11px;
`;

const SLabelContent = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 4px;

  padding-left: 3px;
`;

const SPerMonth = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`

const ProductOptionDesktop: React.FunctionComponent<IProductOption> = ({
  selected,
  product,
  handleClick,
}) => {
  const { t } = useTranslation('creator-onboarding');

  return (
    <SProductOptionDesktop
      selected={selected ?? false}
      onClick={handleClick}
    >
      <Text
        variant={2}
      >
        $
        {formatNumber((product.monthlyRate.usdCents!! / 100) ?? 0, true)}
      </Text>
      <SSelectLabel
        variant={2}
      >
        { t('SubrateSection.selectInput.select') }
      </SSelectLabel>
    </SProductOptionDesktop>
  );
};

const SProductOptionDesktop = styled.button<{
  selected: boolean;
}>`
  width: 104px;
  height: 108px;

  border-style: solid;
  border-width: 2px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-color: transparent;

  background: ${({ selected, theme }) => (selected ?
    theme.gradients.blueDiagonal : theme.colorsThemed.background.tertiary)};;

  padding: 32px 16px;

  ${({ selected }) => (selected && css`
    div {
      color: #FFF !important;
    }
  `)}

  cursor: pointer;
  transition: .2s linear;
`;

const SSelectLabel = styled(Text)`
  margin-top: 12px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
