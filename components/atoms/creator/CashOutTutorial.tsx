import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import Text from '../Text';
import InlineSvg from '../InlineSVG';
import infoIcon from '../../../public/images/svg/icons/filled/Info.svg';
import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';

const GRACE_PERIOD_TUTORIAL_DISMISSED_KEY = 'isGracePeriodTutorialDismissed';

const CashOutTutorial: React.FC = () => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();

  const [isTutorialVisible, setIsTutorialVisible] = useState(
    localStorage.getItem(GRACE_PERIOD_TUTORIAL_DISMISSED_KEY) !== 'true'
  );

  const handleClose = useCallback(() => {
    localStorage.setItem(GRACE_PERIOD_TUTORIAL_DISMISSED_KEY, 'true');
    setIsTutorialVisible(false);
  }, []);

  if (!isTutorialVisible) {
    return null;
  }

  return (
    <SContainer>
      <SLeftPartContainer>
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
      </SLeftPartContainer>
      <SRightInlineSVG
        clickable
        svg={closeIcon}
        fill={theme.colors.white}
        width='20px'
        height='20px'
        onClick={handleClose}
      />
    </SContainer>
  );
};

export default CashOutTutorial;

const SContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colorsThemed.accent.success};
  border-radius: 16px;

  padding: 16px;
  margin-bottom: 16px;

  ${(props) => props.theme.media.tablet} {
    padding: 24px;
    margin-bottom: 24px;
  }
`;

const SLeftPartContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  overflow: hidden;
`;

const SImageWrapper = styled.div`
  flex-shrink: 0;
  margin-right: 8px;
`;

const SStripeBlockText = styled(Text)`
  color: ${({ theme }) => theme.colors.white};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SRightInlineSVG = styled(InlineSvg)`
  flex-shrink: 0;
  margin-left:8px

  min-width: 20px;
  min-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    min-width: 20px;
    min-height: 20px;
  }
`;
