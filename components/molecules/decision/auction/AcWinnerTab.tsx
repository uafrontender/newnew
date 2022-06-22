import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../../redux-store/store';

import isBrowser from '../../../../utils/isBrowser';

import { formatNumber } from '../../../../utils/format';
import Headline from '../../../atoms/Headline';
import Text from '../../../atoms/Text';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';
import PostWaitingForResponseBox from '../PostWaitingForResponseBox';
import { markPost } from '../../../../api/endpoints/post';
import PostSuccessBox from '../PostSuccessBox';
import assets from '../../../../constants/assets';

interface IAcWinnerTab {
  postId: string;
  option: newnewapi.Auction.Option;
  postStatus: TPostStatusStringified;
}

const AcWinnerTab: React.FunctionComponent<IAcWinnerTab> = ({
  postId,
  option,
  postStatus,
}) => {
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isMySuggestion = useMemo(
    () => option.creator?.uuid === user.userData?.userUuid,
    [option.creator?.uuid, user.userData?.userUuid]
  );

  const containerRef = useRef<HTMLDivElement>();
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const handleFollowDecision = useCallback(async () => {
    try {
      if (!user.loggedIn) {
        router.push(
          `/sign-up?reason=follow-decision&redirect=${encodeURIComponent(
            window.location.href
          )}`
        );
        return;
      }
      const markAsFavoritePayload = new newnewapi.MarkPostRequest({
        markAs: newnewapi.MarkPostRequest.Kind.FAVORITE,
        postUuid: postId,
      });

      const res = await markPost(markAsFavoritePayload);

      console.log(res);
    } catch (err) {
      console.error(err);
    }
  }, [postId, router, user.loggedIn]);

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
              <SSpanBold>{formatNumber(option.supporterCount, true)}</SSpanBold>{' '}
              <SSpanThin>
                {option.supporterCount > 1
                  ? t('acPost.winnerTab.winnerOptionCard.biddersBidAmount')
                  : t('acPost.winnerTab.winnerOptionCard.bidderBidAmount')}
              </SSpanThin>
            </SNumBidders>
            {option.totalAmount?.usdCents && (
              <SHeadline variant={4}>
                ${formatNumber(option.totalAmount.usdCents / 100, false)}
              </SHeadline>
            )}
            <SOptionCreator variant={3}>
              <SSpanThin>{t('acPost.winnerTab.winnerOptionCard.on')}</SSpanThin>{' '}
              <Link
                href={`/${
                  option.creator?.username ? option.creator?.username : '/'
                }`}
              >
                <SSpanBold
                  style={{
                    cursor: !isMySuggestion ? 'pointer' : 'default',
                  }}
                >
                  {isMySuggestion
                    ? t('acPost.winnerTab.winnerOptionCard.suggestedByMe')
                    : t('acPost.winnerTab.winnerOptionCard.suggestedByUser', {
                        username:
                          option.creator?.nickname ?? option.creator?.username,
                      })}
                </SSpanBold>
              </Link>{' '}
              <SSpanThin>
                {t('acPost.winnerTab.winnerOptionCard.bidTo')}
              </SSpanThin>{' '}
            </SOptionCreator>
            <SHeadline variant={4}>{option.title}</SHeadline>
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
        {postStatus === 'waiting_for_response' && (
          <PostWaitingForResponseBox
            title={t('postWaitingForResponse.title')}
            body={t('postWaitingForResponse.body')}
            buttonCaption={t('postWaitingForResponse.buttonText')}
            style={{
              marginTop: '24px',
            }}
            handleButtonClick={() => {
              handleFollowDecision();
            }}
          />
        )}
        {postStatus === 'succeeded' && (
          <PostSuccessBox
            title={t('postSuccess.title', { postType: t(`postType.ac`) })}
            body={t('postSuccess.body')}
            buttonCaption={t('postSuccess.buttonText')}
            style={{
              marginTop: '24px',
            }}
            handleButtonClick={() => {
              document.getElementById('post-modal-container')?.scrollTo({
                top: document.getElementById('recommendations-section-heading')
                  ?.offsetTop,
                behavior: 'smooth',
              });
            }}
          />
        )}
      </STabContainer>
    </>
  );
};

AcWinnerTab.defaultProps = {};

export default AcWinnerTab;

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
