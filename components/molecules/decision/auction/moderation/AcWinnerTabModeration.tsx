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

interface IAcWinnerTabModeration {
  option: newnewapi.Auction.Option;
}

const AcWinnerTabModeration: React.FunctionComponent<IAcWinnerTabModeration> = ({
  option,
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
        </SWinnerOptionCard>
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

    padding: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: calc(100% - 16px);
  }
`;

const STrophyImg = styled.img`
  position: absolute;
  right: 16px;
  bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
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

`;

const SHeadline = styled(Headline)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const SYouMade = styled(Text)`

`;

const SOptionCreator = styled(Text)`

`;

const SSpanBold = styled.span`

`;

const SSpanThin = styled.span`
  opacity: 0.8;
`;
