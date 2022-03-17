import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import InlineSVG from '../InlineSVG';
import Button from '../Button';
import Text from '../Text';

import cashOutIcon from '../../../public/images/svg/icons/filled/CashOut.svg';

export const CashOut = () => {
  const { t } = useTranslation('creator');

  const handleSubmit = useCallback(() => {
    console.log('subscribe');
  }, []);
  return (
    <SCashOutContainer>
      <SCashOutTopBlock>
        <SInlineSVG svg={cashOutIcon} width="48px" height="48px" />
        <SDescriptionWrapper>
          <SDescription variant={3} weight={600}>
            {t('dashboard.earnings.cashOut.amount')}
          </SDescription>
          <SAmount variant={3} weight={600}>
            $456.98
          </SAmount>
          <SDescription variant={3} weight={600}>
            {t('dashboard.earnings.cashOut.date', { date: 'Nov 3, 2021' })}
          </SDescription>
        </SDescriptionWrapper>
      </SCashOutTopBlock>
      <SButton view="primaryGrad" onClick={handleSubmit}>
        {t('dashboard.earnings.cashOut.submit')}
      </SButton>
    </SCashOutContainer>
  );
};

export default CashOut;

const SCashOutContainer = styled.div`
  padding: 16px;
  display: flex;
  background: ${(props) => props.theme.colorsThemed.accent.blue};
  border-radius: 16px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SCashOutTopBlock = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SDescriptionWrapper = styled.div`
  p {
    display: inline;
  }
`;

const SAmount = styled(Text)`
  color: ${(props) => props.theme.colors.white};
  margin-left: 4px;
`;

const SDescription = styled(Text)`
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
`;

const SButton = styled(Button)`
  width: 100%;
  color: ${(props) => props.theme.colors.black};
  padding: 16px 20px;
  margin-top: 16px;
  background: ${(props) => props.theme.colors.white};

  &:after {
    display: none;
  }

  &:focus:enabled,
  &:hover:enabled {
    background: ${(props) => props.theme.colors.white};
  }

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: unset;
    margin-left: 16px;
  }
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 48px;
  min-height: 48px;
  margin-right: 8px;
`;
