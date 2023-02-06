import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { formatNumber } from '../../../utils/format';

interface IVotesAmountInputModal {
  value: string;
  customPaymentWithFeeInCents: number;
  minAmount: number;
  disabled?: boolean;
  autofocus?: boolean;
  onChange: (newValue: string) => void;
}

const VotesAmountInputModal: React.FunctionComponent<
  IVotesAmountInputModal
> = ({
  value,
  customPaymentWithFeeInCents,
  minAmount,
  disabled,
  autofocus,
  onChange,
}) => {
  const { t } = useTranslation('page-Post');

  const inputRef = useRef<HTMLInputElement>();
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      value.length > 0
        ? e.target.value
            .split(',')
            .filter((v) => v !== ',')
            .join('')
        : e.target.value;
    if (/[^0-9]/.test(newValue)) return;

    if (newValue.length > 5) return;

    onChange(newValue);
  };

  useEffect(() => {
    if (autofocus) inputRef.current?.focus();
  }, [autofocus]);

  return (
    <SWrapper>
      <SInput
        id='custom-votes-input'
        ref={(el) => {
          inputRef.current = el!!;
        }}
        value={value ? `${formatNumber(parseInt(value), true)}` : value}
        disabled={disabled ?? false}
        inputMode='numeric'
        placeholder={t('mcPost.optionsTab.actionSection.votesAmount', {
          minAmount,
        })}
        onChange={handleOnChange}
      />
      <SBottomPlaceholder id='custom-votes-price'>
        {value && customPaymentWithFeeInCents
          ? `${t(
              'mcPost.optionsTab.actionSection.totalAmountCustomVotesPayment'
            )}: $${formatNumber(
              customPaymentWithFeeInCents / 100,
              customPaymentWithFeeInCents % 1 === 0
            )}`
          : '$--'}
      </SBottomPlaceholder>
    </SWrapper>
  );
};

VotesAmountInputModal.defaultProps = {
  disabled: undefined,
  autofocus: undefined,
};

export default VotesAmountInputModal;

const SWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;

  width: 100%;

  margin-top: 24px;
`;

const SInput = styled.input`
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  text-align: center;

  padding: 12.5px 16px;
  width: 100%;

  background-color: transparent;
  border: 1.5px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
  }

  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
`;

const SBottomPlaceholder = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
