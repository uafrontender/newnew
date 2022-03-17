import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../../../redux-store/store';

import isBrowser from '../../../../../utils/isBrowser';

import WinnerIcon from '../../../../../public/images/decision/ac-select-winner-trophy-mock.png';
import { formatNumber } from '../../../../../utils/format';
import Headline from '../../../../atoms/Headline';
import Text from '../../../../atoms/Text';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import PostSuccessBoxModeration from '../../PostSuccessBoxModeration';

interface IAcWinnerTabModeration {
  option: newnewapi.Auction.Option;
  postStatus: TPostStatusStringified;
}

const AcWinnerTabModeration: React.FunctionComponent<IAcWinnerTabModeration> = ({
  option,
  postStatus,
}) => {
  const { t } = useTranslation('decision');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const containerRef = useRef<HTMLDivElement>();
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const handleRedirectToUser = () => {
    router.push(`/u/${option.creator?.username!!}`);
  };

  useEffect(() => {
    if (isBrowser()) {
      const currScroll = document.getElementById('post-modal-container')!!.scrollTop!!;
      const targetScroll = (containerRef.current?.getBoundingClientRect().top ?? 500) - 218;

      setIsScrolledDown(currScroll >= targetScroll!!);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      // @ts-ignore
      const currScroll = e?.currentTarget?.scrollTop!!;
      const targetScroll = (containerRef.current?.getBoundingClientRect().top ?? 500) - 218;

      if (currScroll >= targetScroll!!) {
        setIsScrolledDown(true);
      } else {
        setIsScrolledDown(false);
      }
    }

    if (isBrowser()) {
      document?.getElementById('post-modal-container')?.addEventListener('scroll', handler);
    }

    return () => {
      if (isBrowser()) {
        document?.getElementById('post-modal-container')?.removeEventListener('scroll', handler);
      }
    }
  }, [isMobile]);

  return (
    <>
      <STabContainer
        key="winner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={(el) => {
          containerRef.current = el!!;
        }}
      >
        <SWinnerOptionCard
          style={{
            ...(isMobile ? {
              position: !isScrolledDown ? 'fixed' : 'relative',
              bottom: !isScrolledDown ? '88px' : 'initial',
              left: !isScrolledDown ? '16px' : 'initial',
              width: !isScrolledDown ? 'calc(100% - 32px)' : '100%',
            } : {}),
          }}
        >
          <SOptionDetails>
            <SNumBidders
              variant={3}
            >
              <SSpanBold>
                {formatNumber(
                  option.supporterCount,
                  true,
                )}
              </SSpanBold>
              {' '}
              <SSpanThin>
                {option.supporterCount > 1
                  ? t('AcPostModeration.WinnerTab.WinnerOptionCard.bidders_told_you')
                  : t('AcPostModeration.WinnerTab.WinnerOptionCard.bidder_told_you')
                }
              </SSpanThin>
            </SNumBidders>
            <SHeadline
              variant={4}
            >
              { option.title }
            </SHeadline>
            <SYouMade
              variant={3}
            >
              { t('AcPostModeration.WinnerTab.WinnerOptionCard.you_made') }
            </SYouMade>
            <SHeadline
              variant={4}
            >
              $
              {formatNumber(
                option.totalAmount!!.usdCents!! / 100,
                true,
              )}
            </SHeadline>
            <SOptionCreator
              variant={3}
            >
              <SSpanThin>
                { t('AcPostModeration.WinnerTab.WinnerOptionCard.created_by') }
              </SSpanThin>
              {' '}
              <SSpanBold
                onClick={() => handleRedirectToUser()}
                style={{
                  cursor: 'pointer',
                }}
              >
                {option.creator?.nickname ?? option.creator?.username}
              </SSpanBold>
            </SOptionCreator>
          </SOptionDetails>
          <STrophyImg
            src={WinnerIcon.src}
          />
          {!isMobile && (
            <>
              <STrophyGlow />
              <SMainScoop />
              <STopScoop>
                <mask id='mask-STopScoop'>
                  <svg>
                    <circle id='circle-STopScoop' r='50' fill='#0DEE59'/>
                  </svg>
                </mask>
              </STopScoop>
              <SBottomScoop>
                <mask id='mask-SBottomScoop'>
                  <svg>
                    <circle id='circle-SBottomScoop' r='50' fill='#08e171'/>
                  </svg>
                </mask>
              </SBottomScoop>
            </>
          )}
        </SWinnerOptionCard>
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
      </STabContainer>
    </>
  );
};

AcWinnerTabModeration.defaultProps = {};

export default AcWinnerTabModeration;

const STabContainer = styled(motion.div)`
  width: 100%;
  height: calc(100% - 112px);
`;

const SWinnerOptionCard = styled.div`
  position: fixed;
  z-index: 10;

  width: calc(100% - 32px);
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

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
`;

const STopScoop = styled.div`
  position: absolute;
  right: 0px;
  bottom: 70px;

	width: 50px;
	height: 80px;
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  svg {
    position: absolute;
    width: 100%; height: 100%;
  }
`;

const SBottomScoop = styled.div`
  position: absolute;
  right: 26px;
  bottom: 0px;

	width: 150px;
	height: 50px;
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  svg {
    position: absolute;
    width: 100%; height: 100%;
  }
`;

// Option details
const SOptionDetails = styled.div`
  color: #FFFFFF;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SNumBidders = styled(Text)`
  color: #FFFFFF;
`;

const SHeadline = styled(Headline)`
  color: #FFFFFF;
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 12px;
  }
`;

const SYouMade = styled(Text)`
  color: #FFFFFF;
`;

const SOptionCreator = styled(Text)`
  color: #FFFFFF;
`;

const SSpanBold = styled.span`
  color: #FFFFFF;
`;

const SSpanThin = styled.span`
  color: #FFFFFF;
  opacity: 0.8;
`;
