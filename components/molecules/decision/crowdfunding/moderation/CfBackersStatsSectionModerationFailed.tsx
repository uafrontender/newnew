import React, { useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../../../redux-store/store';

import Text from '../../../../atoms/Text';
import Headline from '../../../../atoms/Headline';

import { formatNumber } from '../../../../../utils/format';

interface ICfBackersStatsSectionModerationFailed {
  targetBackerCount: number;
  currentNumBackers: number;
}

const CfBackersStatsSectionModerationFailed: React.FunctionComponent<ICfBackersStatsSectionModerationFailed> =
  ({ targetBackerCount, currentNumBackers }) => {
    const theme = useTheme();
    const { t } = useTranslation('decision');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isTablet = ['tablet'].includes(resizeMode);
    const size = isTablet ? 240 : 280;
    const radius = (size - 12) / 2;
    const bgRingCircleRef = useRef<SVGCircleElement>();

    return (
      <SSectionContainer>
        <SProgressRingSvg
          key={`key_${isTablet ? 'tablet' : ''}`}
          width={size}
          height={size}
        >
          <SBgRingCircle
            ref={(el) => {
              bgRingCircleRef.current = el!!;
            }}
            stroke={theme.colorsThemed.accent.pink}
            strokeWidth='12px'
            strokeLinecap='round'
            fill='transparent'
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </SProgressRingSvg>
        <SCaptionSection>
          <SHeadline variant={3}>{currentNumBackers}</SHeadline>
          <STarget>
            {t('CfPost.BackersStatsSection.of_backers', {
              targetBackers: formatNumber(targetBackerCount, true),
            })}
          </STarget>
        </SCaptionSection>
      </SSectionContainer>
    );
  };

export default CfBackersStatsSectionModerationFailed;

const SSectionContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 420px;

  display: flex;
  justify-content: center;
  align-items: center;

  ${({ theme }) => theme.media.tablet} {
    height: 320px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 400px;
  }
`;

const SProgressRingSvg = styled.svg`
  position: absolute;
  top: calc(50% - 140px);
  left: calc(50% - 140px);

  ${({ theme }) => theme.media.tablet} {
    top: calc(50% - 120px);
    left: calc(50% - 120px);
  }

  ${({ theme }) => theme.media.laptop} {
    top: calc(50% - 140px);
    left: calc(50% - 140px);
  }
`;

const SBgRingCircle = styled.circle`
  transition: linear 0.2s;
`;

const SCaptionSection = styled.div`
  text-align: center;
`;

const SHeadline = styled(Headline)`
  color: ${({ theme }) => theme.colorsThemed.accent.pink};
`;

const STarget = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
