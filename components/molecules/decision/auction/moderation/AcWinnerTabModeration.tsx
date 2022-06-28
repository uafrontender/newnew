import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { useAppSelector } from '../../../../../redux-store/store';

import isBrowser from '../../../../../utils/isBrowser';

import { formatNumber } from '../../../../../utils/format';
import Headline from '../../../../atoms/Headline';
import Text from '../../../../atoms/Text';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import PostSuccessBoxModeration from '../../PostSuccessBoxModeration';
import assets from '../../../../../constants/assets';
import { getMyEarningsByPosts } from '../../../../../api/endpoints/payments';

interface IAcWinnerTabModeration {
  postId: string;
  option: newnewapi.Auction.Option;
  postStatus: TPostStatusStringified;
}

const AcWinnerTabModeration: React.FunctionComponent<IAcWinnerTabModeration> =
  ({ postId, option, postStatus }) => {
    const { t } = useTranslation('modal-Post');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const containerRef = useRef<HTMLDivElement>();
    const [isScrolledDown, setIsScrolledDown] = useState(false);

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
        const url = `${window.location.origin}/post/${postId}`;

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
    }, [postId]);

    useEffect(() => {
      if (isBrowser()) {
        const container = document.getElementById('post-modal-container');
        if (container) {
          const currScroll = container.scrollTop;
          const targetScroll =
            (containerRef.current?.getBoundingClientRect().top ?? 500) - 218;

          setIsScrolledDown(currScroll >= targetScroll!!);
        }
      }
    }, []);

    useEffect(() => {
      async function loadEarnedAmount() {
        setEarnedAmountLoading(true);
        try {
          const payload = new newnewapi.GetMyEarningsByPostsRequest({
            postUuids: [postId],
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
    }, [postId, postStatus]);

    useEffect(() => {
      const handler = (e: Event) => {
        // @ts-ignore
        const currScroll = e?.currentTarget?.scrollTop!!;
        const targetScroll =
          (containerRef.current?.getBoundingClientRect().top ?? 500) - 218;

        if (currScroll >= targetScroll!!) {
          setIsScrolledDown(true);
        } else {
          setIsScrolledDown(false);
        }
      };

      if (isBrowser()) {
        document
          ?.getElementById('post-modal-container')
          ?.addEventListener('scroll', handler);
      }

      return () => {
        if (isBrowser()) {
          document
            ?.getElementById('post-modal-container')
            ?.removeEventListener('scroll', handler);
        }
      };
    }, [isMobile]);

    return (
      <>
        <STabContainer
          key='winner'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          ref={(el) => {
            containerRef.current = el!!;
          }}
        >
          <SWinnerOptionCard
            style={{
              ...(isMobile
                ? {
                    position: !isScrolledDown ? 'fixed' : 'relative',
                    bottom: !isScrolledDown ? '88px' : 'initial',
                    left: !isScrolledDown ? '16px' : 'initial',
                    width: !isScrolledDown ? 'calc(100% - 32px)' : '100%',
                  }
                : {}),
            }}
          >
            <SOptionDetails>
              <SNumBidders variant={3}>
                <SSpanBold>
                  {formatNumber(option.supporterCount, true)}
                </SSpanBold>{' '}
                <SSpanThin>
                  {option.supporterCount > 1
                    ? t(
                        'acPostModeration.winnerTab.winnerOptionCard.biddersToldYou'
                      )
                    : t(
                        'acPostModeration.winnerTab.winnerOptionCard.bidderToldYou'
                      )}
                </SSpanThin>
              </SNumBidders>
              <SHeadline variant={4}>{option.title}</SHeadline>
              {!earnedAmountLoading && earnedAmount && (
                <>
                  <SYouMade variant={3}>
                    {t('acPostModeration.winnerTab.winnerOptionCard.youMade')}
                  </SYouMade>
                  <SHeadline variant={5}>
                    ${formatNumber(earnedAmount.usdCents / 100, false)}
                  </SHeadline>
                </>
              )}
              <SOptionCreator variant={3}>
                <SSpanThin>
                  {t('acPostModeration.winnerTab.winnerOptionCard.createdBy')}
                </SSpanThin>{' '}
                <Link
                  href={`/${
                    option.creator?.username ? option.creator.username : ''
                  }`}
                >
                  <SSpanBold
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    {option.creator?.nickname ?? option.creator?.username}
                  </SSpanBold>
                </Link>
              </SOptionCreator>
            </SOptionDetails>
            <STrophyImg src={assets.decision.trophy} />
            {!isMobile && (
              <>
                <STrophyGlow />
                <SMainScoop />
                <STopScoop>
                  <mask id='mask-STopScoop'>
                    <svg>
                      <circle id='circle-STopScoop' r='50' fill='#0DEE59' />
                    </svg>
                  </mask>
                </STopScoop>
                <SBottomScoop>
                  <mask id='mask-SBottomScoop'>
                    <svg>
                      <circle id='circle-SBottomScoop' r='50' fill='#08e171' />
                    </svg>
                  </mask>
                </SBottomScoop>
              </>
            )}
          </SWinnerOptionCard>
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
        </STabContainer>
      </>
    );
  };

AcWinnerTabModeration.defaultProps = {};

export default AcWinnerTabModeration;

const STabContainer = styled(motion.div)`
  width: 100%;
  height: calc(100% - 112px);

  min-height: 300px;

  position: relative;
`;

const SWinnerOptionCard = styled.div`
  position: fixed;
  z-index: 10;

  width: calc(100% - 32px);
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

    height: fit-content;

    width: 100%;

    padding: 24px;
  }
`;

const STrophyImg = styled.img`
  position: absolute;
  right: 16px;
  bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    bottom: -30px;

    width: 130px;

    z-index: 2;
  }
`;

const STrophyGlow = styled.div`
  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    bottom: -16px;
    right: 16px;

    width: 100px;
    height: 100px;

    z-index: 1;

    background: rgba(255, 230, 4, 0.6);
    filter: blur(50px);
  }
`;

const SMainScoop = styled.div`
  position: absolute;
  right: -20px;
  bottom: -50px;

  width: 150px;
  height: 150px;
  border-radius: 50%;

  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : '#ffffff'};
`;

const STopScoop = styled.div`
  position: absolute;
  right: 0px;
  bottom: 70px;

  width: 50px;
  height: 80px;
  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : '#ffffff'};

  svg {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`;

const SBottomScoop = styled.div`
  position: absolute;
  right: 26px;
  bottom: 0px;

  width: 150px;
  height: 50px;
  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : '#ffffff'};

  svg {
    position: absolute;
    width: 100%;
    height: 100%;
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

const SHeadline = styled(Headline)`
  color: #ffffff;
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 12px;
  }
`;

const SYouMade = styled(Text)`
  color: #ffffff;
`;

const SOptionCreator = styled(Text)`
  color: #ffffff;
`;

const SSpanBold = styled.span`
  color: #ffffff;
`;

const SSpanThin = styled.span`
  color: #ffffff;
  opacity: 0.8;
`;
