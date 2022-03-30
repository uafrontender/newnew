import React, {
  useMemo,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../../../redux-store/store';

import Text from '../../../../atoms/Text';
import Headline from '../../../../atoms/Headline';

import { formatNumber } from '../../../../../utils/format';

import WinnerIcon from '../../../../../public/images/decision/ac-select-winner-trophy-mock.png';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import PostSuccessBoxModeration from '../../PostSuccessBoxModeration';

interface ICfCrowdfundingSuccessModeration {
  post: newnewapi.Crowdfunding;
  postStatus: TPostStatusStringified;
  currentNumBackers: number;
}

const CfCrowdfundingSuccessModeration: React.FunctionComponent<ICfCrowdfundingSuccessModeration> = ({
  post,
  postStatus,
  currentNumBackers,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);

  const percentage = (currentNumBackers / post.targetBackerCount) * 100;
  const size = useMemo(() => (
    isTablet ? 180 : 240
  ), [isTablet]);
  const radius = (size - 12) / 2;

  return (
    <SSectionContainer>
      {!isMobile ? (
        <>
          <SProgressRingContainer>
            {isTablet ? (
              <SProgressRingSvg
                width={size}
                height={size}
              >
                <SBgRingCircle
                  stroke={theme.colorsThemed.accent.green}
                  strokeWidth="12px"
                  strokeLinecap="round"
                  fill="transparent"
                  style={{
                    transform: `rotate(${90 - (percentage !== 0 ? 4 : 0)}deg) scale(-1, 1)`,
                    transformOrigin: 'center',
                  }}
                  r={radius}
                  cx={size / 2}
                  cy={size / 2}
                />
              </SProgressRingSvg>

            ) : null}
            <STrophyImg
              src={WinnerIcon.src}
            />
            <STrophyGlow />
          </SProgressRingContainer>
        </>
      ) : null}
      <SCaptionSection>
        <SHeadlineNumBackers
          variant={3}
        >
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
          <SNumBidders
            variant={3}
          >
            <SSpanBold>
              {formatNumber(
                currentNumBackers,
                true,
              )}
            </SSpanBold>
            {' '}
            <SSpanThin>
              {currentNumBackers > 1
                ? t('CfPostModeration.WinnerTab.WinnerOptionCard.backers_told_you')
                : t('CfPostModeration.WinnerTab.WinnerOptionCard.backer_told_you')
              }
            </SSpanThin>
          </SNumBidders>
          <SDetailsHeadline
            variant={4}
          >
            { post.title }
          </SDetailsHeadline>
          <SYouMade
            variant={3}
          >
            { t('CfPostModeration.WinnerTab.WinnerOptionCard.you_made') }
          </SYouMade>
          <SDetailsHeadline
            variant={4}
          >
            $
            {formatNumber(
              post.totalAmount?.usdCents ? (post.totalAmount.usdCents!! / 100) : 100,
              true,
            )}
          </SDetailsHeadline>
        </SOptionDetails>
        {isMobile && (
          <STrophyImgCard
            src={WinnerIcon.src}
          />
        )}
      </SWinnerCard>
      {postStatus === 'succeeded' ? (
        <PostSuccessBoxModeration
          title={t('PostSuccessModeration.title')}
          body={t('PostSuccessModeration.body')}
          buttonCaption={t('PostSuccessModeration.ctaButton')}
          style={{
            marginTop: '24px',
          }}
          handleButtonClick={() => {
            console.log('Share')
          }}
        />
      ) : null}
    </SSectionContainer>
  );
};

export default CfCrowdfundingSuccessModeration;

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

const SProgressRingSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
`;

const SBgRingCircle = styled.circle`

`;


const STrophyImg = styled.img`
  position: absolute;
  left: calc(50% - 40px);
  top: calc(50% - 40px);

  width: 80px;

  ${({ theme }) => theme.media.laptop} {
    left: calc(50% - 65px);
    top: calc(50% - 65px);

    width: 130px;
  }
`;

const STrophyGlow = styled.div`
  position: absolute;
  left: calc(50% - 38px);
  top: calc(50% - 38px);

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

    margin-bottom: 16px;

    text-align: left;

    height: 150px;
  }

  ${({ theme }) => theme.media.laptop} {
    /* margin-top: 124px; */
  }
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

  background: linear-gradient(76.09deg, #00C291 2.49%, #07DF74 50.67%, #0FF34F 102.41%);
  border-radius: 24px;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  ${({ theme }) => theme.media.tablet} {
    position: relative;

    height: fit-content;

    padding: 24px;
  }
`;


// Option details
const SOptionDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SDetailsHeadline = styled(Headline)`
  color: #FFFFFF;
`;

const SNumBidders = styled(Text)`
  color: #FFFFFF;
`;

const SYouMade = styled(Text)`
  color: #FFFFFF;
`;

const SSpanBold = styled.span`
  color: #FFFFFF;
`;

const SSpanThin = styled.span`
  color: #FFFFFF;
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
