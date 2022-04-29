import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../../redux-store/store';

import Text from '../../../atoms/Text';
import Headline from '../../../atoms/Headline';

import { formatNumber } from '../../../../utils/format';

import WinnerIcon from '../../../../public/images/decision/ac-select-winner-trophy-mock.png';

interface ICfCrowdfundingSuccess {
  post: newnewapi.Crowdfunding;
  currentNumBackers: number;
}

const CfCrowdfundingSuccess: React.FunctionComponent<ICfCrowdfundingSuccess> =
  ({ post, currentNumBackers }) => {
    const { t } = useTranslation('decision');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    return (
      <SSectionContainer>
        {!isMobile ? (
          <>
            <SProgressRingContainer>
              <STrophyImg src={WinnerIcon.src} />
              <STrophyGlow />
            </SProgressRingContainer>
          </>
        ) : null}
        <SCaptionSection>
          <SHeadlineNumBackers variant={3}>
            {currentNumBackers}
          </SHeadlineNumBackers>
          <STarget>
            {t('CfPost.BackersStatsSection.of_backers', {
              targetBackers: formatNumber(post.targetBackerCount, true),
            })}
          </STarget>
        </SCaptionSection>
        <SWinnerCard>
          <SOptionDetails>
            <SNumBidders variant={3}>
              <SSpanBold>{formatNumber(currentNumBackers, true)}</SSpanBold>{' '}
              <SSpanThin>
                {currentNumBackers > 1
                  ? t('CfPost.WinnerTab.WinnerOptionCard.backers_founded')
                  : t('CfPost.WinnerTab.WinnerOptionCard.backer_founded')}
              </SSpanThin>
            </SNumBidders>
            <SHeadline variant={4}>{post.title}</SHeadline>
          </SOptionDetails>
          {isMobile && <STrophyImgCard src={WinnerIcon.src} />}
        </SWinnerCard>
      </SSectionContainer>
    );
  };

export default CfCrowdfundingSuccess;

const SSectionContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SProgressRingContainer = styled.div`
  position: absolute;
  left: 24px;
  top: 24px;

  width: 180px;
  height: 180px;

  ${({ theme }) => theme.media.laptop} {
    width: 240px;
    height: 240px;
  }
`;

const STrophyImg = styled.img`
  position: absolute;
  left: calc(50% - 40px);
  top: calc(50% - 40px);

  width: 80px;

  ${({ theme }) => theme.media.laptop} {
    left: calc(50% - 65px);
    top: calc(30% - 65px);

    width: 130px;
  }
`;

const STrophyGlow = styled.div`
  position: absolute;
  left: calc(50% - 38px);
  top: calc(30% - 38px);

  width: 76px;
  height: 76px;

  z-index: 1;

  background: rgba(255, 230, 4, 0.6);
  filter: blur(50px);

  ${({ theme }) => theme.media.laptop} {
  }
`;

// Caption
const SCaptionSection = styled.div`
  text-align: center;

  margin-bottom: 70px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: 55%;
    margin-bottom: 0;

    text-align: left;

    height: 50%;

    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  ${({ theme }) => theme.media.laptop} {
    /* padding-top: 124px; */
    /* margin-bottom: 60px; */
  }
`;

const SHeadline = styled(Headline)`
  color: #ffffff;
`;

const SHeadlineNumBackers = styled(Headline)`
  margin-top: 48px;
  color: ${({ theme }) => theme.colorsThemed.accent.green};

  ${({ theme }) => theme.media.tablet} {
    margin-top: initial;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const STarget = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

// Winner card
const SWinnerCard = styled.div`
  height: 218px;

  padding: 16px;
  padding-right: 114px;

  background: linear-gradient(
    76.09deg,
    #00c291 2.49%,
    #07df74 50.67%,
    #0ff34f 102.41%
  );
  border-radius: 24px;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  ${({ theme }) => theme.media.tablet} {
    position: relative;

    height: 188px;

    padding: 24px;
  }
`;

// Option details
const SOptionDetails = styled.div`
  color: #ffffff;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SNumBidders = styled(Text)`
  color: #ffffff;
`;

const SSpanBold = styled.span`
  color: #ffffff;
`;

const SSpanThin = styled.span`
  color: #ffffff;

  opacity: 0.8;
`;

const STrophyImgCard = styled.img`
  position: absolute;
  right: 16px;
  bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`;
