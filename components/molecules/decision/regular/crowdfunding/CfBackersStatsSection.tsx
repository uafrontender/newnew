import React, { useMemo, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../../redux-store/store';

import Text from '../../../../atoms/Text';
import Headline from '../../../../atoms/Headline';

import { formatNumber } from '../../../../../utils/format';

interface ICfBackersStatsSection {
  targetBackerCount: number;
  currentNumBackers: number;
  myPledgeAmount?: newnewapi.MoneyAmount | undefined;
}

const CfBackersStatsSection: React.FunctionComponent<
  ICfBackersStatsSection
> = ({ targetBackerCount, currentNumBackers, myPledgeAmount }) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isTablet = ['tablet'].includes(resizeMode);

  const percentage = useMemo(() => {
    const realPercentage = (currentNumBackers / targetBackerCount) * 100;

    if (currentNumBackers > 0 && realPercentage < 3) return 3;

    return realPercentage;
  }, [currentNumBackers, targetBackerCount]);

  const size = isTablet ? 240 : 280;
  const radius = (size - 12) / 2;

  const circumference = radius * Math.PI * 2;
  const dash =
    ((percentage - (percentage >= 100 ? 0 : 2.5)) * circumference) / 100;

  const circumferenceInverted = radius * Math.PI * 2;
  const dashInverted =
    ((100 - percentage - (percentage !== 0 ? 2 : 0)) * circumferenceInverted) /
    100;

  const progressRingCircleRef = useRef<SVGCircleElement>();
  const bgRingCircleRef = useRef<SVGCircleElement>();

  return (
    <>
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
            stroke={theme.colorsThemed.background.outlines1}
            strokeWidth='12px'
            strokeLinecap='round'
            fill='transparent'
            style={{
              transform: `rotate(${
                90 - (percentage !== 0 ? 4 : 0)
              }deg) scale(-1, 1)`,
              transformOrigin: 'center',
            }}
            r={radius}
            strokeDasharray={`${[dashInverted, circumference - dashInverted]}`}
            cx={size / 2}
            cy={size / 2}
          />
          <SProgressRingCircle
            ref={(el) => {
              progressRingCircleRef.current = el!!;
            }}
            stroke={
              percentage === 0 ? 'transparent' : theme.colorsThemed.accent.blue
            }
            strokeWidth='12px'
            strokeLinecap='round'
            fill='transparent'
            transform={`rotate(${percentage < 100 ? -86 : -90} ${size / 2} ${
              size / 2
            })`}
            strokeDasharray={`${[dash, circumference - dash]}`}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </SProgressRingSvg>
        <SCaptionSection>
          <SHeadline variant={3}>{currentNumBackers}</SHeadline>
          <STarget variant={2}>
            {t('cfPost.backersStatsSection.ofBackers', {
              targetBackers: formatNumber(targetBackerCount, true),
            })}
          </STarget>
          {myPledgeAmount && (
            <SMyPledgeAmountDiv>
              {t('cfPost.backersStatsSection.myBacking')}
              {` `}
              {`$${formatNumber(myPledgeAmount.usdCents / 100 ?? 0, true)}`}
            </SMyPledgeAmountDiv>
          )}
        </SCaptionSection>
      </SSectionContainer>
    </>
  );
};

CfBackersStatsSection.defaultProps = {
  myPledgeAmount: undefined,
};

export default CfBackersStatsSection;

const SSectionContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 420px;

  display: flex;
  justify-content: center;
  align-items: center;

  ${({ theme }) => theme.media.tablet} {
    height: 290px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 340px;
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

const SProgressRingCircle = styled.circle`
  transition: linear 0.2s;
`;

const SCaptionSection = styled.div`
  text-align: center;
`;

const SHeadline = styled(Headline)``;

const STarget = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SMyPledgeAmountDiv = styled.div`
  background-color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.background.secondary
      : 'rgba(255, 255, 255, 0.06)'};
  border-radius: 16px;
  padding: 12px 24px;

  margin-top: 8px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
