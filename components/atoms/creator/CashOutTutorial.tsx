import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import Text from '../Text';
import InlineSvg from '../InlineSVG';
import infoIcon from '../../../public/images/svg/icons/filled/Info.svg';

const CashOutTutorial: React.FC = () => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();

  /* const handleClose = useCallback(() => {
    // TODO: what should we do on close? close forever?
  }, []); */

  return (
    <SContainer>
      <SImageWrapper>
        <InlineSvg
          svg={infoIcon}
          fill={theme.colors.white}
          width='20px'
          height='20px'
        />
      </SImageWrapper>
      <SStripeBlockText variant={2} weight={600}>
        {t('dashboard.earnings.cashOutTutorial.gracePeriod')}
      </SStripeBlockText>
      {/* TODO: add close icon */}
    </SContainer>
  );
};

export default CashOutTutorial;

const SContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  padding: 16px;

  background: ${({ theme }) => theme.colorsThemed.accent.success};
  border-radius: 16px;
  margin-bottom: 24px;

  ${(props) => props.theme.media.tablet} {
    padding: 24px;
  }
`;

const SImageWrapper = styled.div`
  margin-right: 8px;
`;

const SStripeBlockText = styled(Text)`
  color: #ffffff;
`;
