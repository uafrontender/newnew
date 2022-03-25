import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../../redux-store/store';

import isBrowser from '../../../../utils/isBrowser';

import WinnerIcon from '../../../../public/images/decision/ac-select-winner-trophy-mock.png';
import { formatNumber } from '../../../../utils/format';
import Headline from '../../../atoms/Headline';
import Text from '../../../atoms/Text';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';
import PostWaitingForResponseBox from '../PostWaitingForResponseBox';
import { markPost } from '../../../../api/endpoints/post';
import PostSuccessBox from '../PostSuccessBox';

interface IMcWinnerTab {
  postId: string;
  option: newnewapi.MultipleChoice.Option;
  postStatus: TPostStatusStringified;
}

const McWinnerTab: React.FunctionComponent<IMcWinnerTab> = ({
  postId,
  option,
  postStatus,
}) => {
  const router = useRouter();
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const isMySuggestion = useMemo(() => (
    user.loggedIn && option.creator?.uuid === user.userData?.userUuid
  ), [user.loggedIn, option.creator?.uuid, user.userData?.userUuid]);

  const containerRef = useRef<HTMLDivElement>();
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const handleRedirectToUser = () => {
    window?.history.replaceState({
      fromPost: true,
    }, '', '');
    router.push(`/${option.creator?.username!!}`);
  };

  const handleFollowDecision = useCallback(async () => {
    try {
      if (!user.loggedIn) {
        router.push('/sign-up?reason=follow-decision');
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
                  ? t('McPost.WinnerTab.WinnerOptionCard.voters_told_you')
                  : t('McPost.WinnerTab.WinnerOptionCard.voter_told_you')
                }
              </SSpanThin>
            </SNumBidders>
            <SHeadline
              variant={4}
            >
              { option.text }
            </SHeadline>
            <SHeadline
              variant={4}
            >
              $
              {formatNumber(
                option.voteCount * 5,
                true,
              )}
            </SHeadline>
            <SOptionCreator
              variant={3}
            >
              <SSpanThin>
                { t('McPost.WinnerTab.WinnerOptionCard.created_by') }
              </SSpanThin>
              {' '}
              <SSpanBold
                onClick={() => {
                  if (isMySuggestion) return;
                  handleRedirectToUser();
                }}
                style={{
                  ...(!isMySuggestion ? {
                    cursor: 'pointer',
                  } : {}),
                }}
              >
                {isMySuggestion ? t('McPost.OptionsTab.me') : (option.creator?.nickname ?? option.creator?.username)}
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
                    <circle id='circle-STopScoop' r='50' fill='#07e071' x='100%' y='100%'/>
                  </svg>
                </mask>
              </STopScoop>
              <SBottomScoop>
                <mask id='mask-SBottomScoop'>
                  <svg>
                    <circle id='circle-SBottomScoop' r='30' fill='#0ae46a'/>
                  </svg>
                </mask>
              </SBottomScoop>
            </>
          )}
        </SWinnerOptionCard>
        {postStatus === 'waiting_for_response' && (
          <PostWaitingForResponseBox
            title={t('PostWaitingForResponse.title')}
            body={t('PostWaitingForResponse.body')}
            buttonCaption={t('PostWaitingForResponse.ctaButton')}
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
            title={t('PostSuccess.title')}
            body={t('PostSuccess.body')}
            buttonCaption={t('PostSuccess.ctaButton')}
            style={{
              marginTop: '24px',
            }}
            handleButtonClick={() => {
              document.getElementById('post-modal-container')?.scrollTo({
                top: document.getElementById('recommendations-section-heading')?.offsetTop,
                behavior: 'smooth',
              })
            }}
          />
        )}
      </STabContainer>
    </>
  );
};

McWinnerTab.defaultProps = {};

export default McWinnerTab;

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
  padding-right: 164px;

  background: linear-gradient(211.77deg, #0FF34F 0%, #07DF74 33.86%, #00C291 76.49%);
  border-radius: 24px;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  div, h4, span {
    color: #FFFFFF;
  }

  ${({ theme }) => theme.media.tablet} {
    position: relative;

    margin-top: 56px;

    height: fit-content;

    padding: 24px;
  }
`;

const STrophyImg = styled.img`
  position: absolute;
  right: 16px;
  bottom: 16px;

  transform: rotate(-45deg);

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: -40px;
    right: 32px;

    width: 130px;

    z-index: 2;
  }
`;

const STrophyGlow = styled.div`
  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: 0px;
    right: 64px;

    width: 60px;
    height: 60px;

    z-index: 1;

    background: rgba(255, 230, 4, 0.6);
    filter: blur(50px);
  }
`;

const SMainScoop = styled.div`
  position: absolute;
  right: -30px;
  top: -60px;

  width: 220px;
  height: 180px;
  border-radius: 50%;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
`;

const STopScoop = styled.div`
  position: absolute;
  right: 172.5px;
  top: -15px;

  transform: rotate(-90deg);

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
  right: -2px;
  top: 72px;

  transform: rotate(214deg);

	width: 50px;
	height: 50px;
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: 48%;

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

`;

const SHeadline = styled(Headline)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 12px;

    padding-right: 50px;
  }
`;

const SOptionCreator = styled(Text)`

`;

const SSpanBold = styled.span`

`;

const SSpanThin = styled.span`
  opacity: 0.8;
`;
