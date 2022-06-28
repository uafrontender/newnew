import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../../../redux-store/store';

import Text from '../../../../atoms/Text';
import Headline from '../../../../atoms/Headline';

import { formatNumber } from '../../../../../utils/format';

import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import PostSuccessBoxModeration from '../../PostSuccessBoxModeration';
import assets from '../../../../../constants/assets';
import { getMyEarningsByPosts } from '../../../../../api/endpoints/payments';

interface ICfCrowdfundingSuccessModeration {
  post: newnewapi.Crowdfunding;
  postStatus: TPostStatusStringified;
  currentNumBackers: number;
}

const CfCrowdfundingSuccessModeration: React.FunctionComponent<ICfCrowdfundingSuccessModeration> =
  ({ post, postStatus, currentNumBackers }) => {
    const theme = useTheme();
    const { t } = useTranslation('modal-Post');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isTablet = ['tablet'].includes(resizeMode);

    // Earned amount
    const [earnedAmount, setEarnedAmount] =
      useState<newnewapi.MoneyAmount | undefined>(undefined);
    const [earnedAmountLoading, setEarnedAmountLoading] = useState(false);

    // Share
    const [isCopiedUrl, setIsCopiedUrl] = useState(false);

    async function copyPostUrlToClipboard(url: string) {
      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(url);
      } else {
        document.execCommand('copy', true, url);
      }
    }

    const handleCopyLink = useCallback(() => {
      if (window) {
        const url = `${window.location.origin}/post/${post.postUuid}`;

        copyPostUrlToClipboard(url)
          .then(() => {
            setIsCopiedUrl(true);
            setTimeout(() => {
              setIsCopiedUrl(false);
            }, 1500);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, [post.postUuid]);

    const percentage = (currentNumBackers / post.targetBackerCount) * 100;
    const size = useMemo(() => 130, []);
    const radius = (size - 12) / 2;

    useEffect(() => {
      async function loadEarnedAmount() {
        setEarnedAmountLoading(true);
        try {
          const payload = new newnewapi.GetMyEarningsByPostsRequest({
            postUuids: [post.postUuid],
          });

          const res = await getMyEarningsByPosts(payload);

          if (!res.data || !res.data?.earningsByPosts[0]?.earnings || res.error)
            throw new Error('Request failed');

          setEarnedAmount(
            res.data.earningsByPosts[0].earnings as newnewapi.MoneyAmount
          );
        } catch (err) {
          console.error(err);
        } finally {
          setEarnedAmountLoading(false);
        }
      }

      loadEarnedAmount();
    }, [post.postUuid]);

    return (
      <SSectionContainer>
        <STopSectionWrapper>
          {!isMobile ? (
            <>
              <SProgressRingContainer>
                {isTablet ? (
                  <SProgressRingSvg width={size} height={size}>
                    <SBgRingCircle
                      stroke={theme.colorsThemed.accent.green}
                      strokeWidth='6px'
                      strokeLinecap='round'
                      fill='transparent'
                      style={{
                        transform: `rotate(${
                          90 - (percentage !== 0 ? 4 : 0)
                        }deg) scale(-1, 1)`,
                        transformOrigin: 'center',
                      }}
                      r={radius}
                      cx={size / 2}
                      cy={size / 2}
                    />
                  </SProgressRingSvg>
                ) : null}
                <STrophyImg src={assets.decision.trophy} />
                <STrophyGlow />
              </SProgressRingContainer>
            </>
          ) : null}
          <SCaptionSection>
            <SHeadlineNumBackers variant={3}>
              {currentNumBackers}
            </SHeadlineNumBackers>
            <STarget weight={600}>
              {t('cfPost.backersStatsSection.ofBackers', {
                targetBackers: formatNumber(post.targetBackerCount, true),
              })}
            </STarget>
          </SCaptionSection>
        </STopSectionWrapper>
        <SWinnerCard>
          <SOptionDetails>
            <SNumBidders variant={3}>
              <SSpanBold>{formatNumber(currentNumBackers, true)}</SSpanBold>{' '}
              <SSpanThin>
                {currentNumBackers > 1
                  ? t(
                      'cfPostModeration.winnerTab.winnerOptionCard.backersToldYou'
                    )
                  : t(
                      'cfPostModeration.winnerTab.winnerOptionCard.backerToldYou'
                    )}
              </SSpanThin>
            </SNumBidders>
            <SDetailsHeadline variant={4}>{post.title}</SDetailsHeadline>
            {!earnedAmountLoading && earnedAmount && (
              <>
                <SYouMade variant={3}>
                  {t('cfPostModeration.winnerTab.winnerOptionCard.youMade')}
                </SYouMade>
                <SDetailsHeadline variant={5}>
                  ${formatNumber(earnedAmount.usdCents / 100, false)}
                </SDetailsHeadline>
              </>
            )}
          </SOptionDetails>
          {isMobile && <STrophyImgCard src={assets.decision.trophy} />}
        </SWinnerCard>
        {postStatus === 'succeeded' ? (
          <PostSuccessBoxModeration
            title={t('postSuccessModeration.title')}
            body={t('postSuccessModeration.body')}
            buttonCaption={
              isCopiedUrl
                ? t('postSuccessModeration.linkCopiedButtonText')
                : t('postSuccessModeration.buttonText')
            }
            style={{
              marginTop: '24px',
            }}
            handleButtonClick={() => {
              handleCopyLink();
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

  padding-bottom: 64px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 0;
  }
`;

const STopSectionWrapper = styled.div`
  ${({ theme }) => theme.media.tablet} {
    margin-top: auto;
    margin-bottom: auto;

    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
  }
`;

const SProgressRingContainer = styled.div`
  /* position: absolute; */
  left: 24px;
  top: 24px;

  ${({ theme }) => theme.media.laptop} {
  }
`;

const SProgressRingSvg = styled.svg`
  position: absolute;
  top: 24px;
  left: 48px;
`;

const SBgRingCircle = styled.circle``;

const STrophyImg = styled.img`
  position: absolute;
  top: 56px;
  left: 86px;

  width: 60px;

  ${({ theme }) => theme.media.laptop} {
    position: static;
    width: 130px;
  }
`;

const STrophyGlow = styled.div`
  position: absolute;
  top: 34px;
  left: 58px;

  width: 76px;
  height: 76px;

  z-index: 1;

  background: rgba(255, 230, 4, 0.6);
  filter: blur(50px);

  ${({ theme }) => theme.media.laptop} {
    top: 24px;
    left: 144px;
  }
`;

// Caption
const SCaptionSection = styled.div`
  text-align: center;

  margin-bottom: 70px;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: column;
    justify-content: center;

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

  font-weight: 700;

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
  position: relative;
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
    height: fit-content;

    padding: 24px;

    z-index: 10;
  }
`;

// Option details
const SOptionDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SDetailsHeadline = styled(Headline)`
  color: #ffffff;
`;

const SNumBidders = styled(Text)`
  color: #ffffff;
`;

const SYouMade = styled(Text)`
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
