import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../../../redux-store/store';

import Headline from '../../../../atoms/Headline';
import Text from '../../../../atoms/Text';

import isBrowser from '../../../../../utils/isBrowser';
import { formatNumber } from '../../../../../utils/format';

import PostSuccessBoxModeration from '../../PostSuccessBoxModeration';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import getDisplayname from '../../../../../utils/getDisplayname';
import assets from '../../../../../constants/assets';
import { useGetAppConstants } from '../../../../../contexts/appConstantsContext';

interface MAcWinnerTabModeration {
  postId: string;
  postCreator: newnewapi.User;
  option: newnewapi.MultipleChoice.Option;
  postStatus: TPostStatusStringified;
}

const McWinnerTabModeration: React.FunctionComponent<MAcWinnerTabModeration> =
  ({ postId, postCreator, option, postStatus }) => {
    const { t } = useTranslation('decision');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const { appConstants } = useGetAppConstants();

    const isCreatorsBid = useMemo(
      () => option.creator?.uuid === postCreator.uuid,
      [option.creator?.uuid, postCreator.uuid]
    );

    const containerRef = useRef<HTMLDivElement>();
    const [isScrolledDown, setIsScrolledDown] = useState(false);

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
                        'mcPostModeration.winnerTab.winnerOptionCard.votersToldYou'
                      )
                    : t(
                        'mcPostModeration.winnerTab.winnerOptionCard.voterToldYou'
                      )}
                </SSpanThin>
              </SNumBidders>
              <SHeadline variant={4}>{option.text}</SHeadline>
              <SYouMade variant={3}>
                {t('mcPostModeration.winnerTab.winnerOptionCard.youMade')}
              </SYouMade>
              <SHeadline variant={5}>
                $
                {formatNumber(
                  option.voteCount * Math.round(appConstants.mcVotePrice / 100),
                  true
                )}
              </SHeadline>
              <SOptionCreator variant={3}>
                <SSpanThin>
                  {t('mcPostModeration.winnerTab.winnerOptionCard.createdBy')}
                </SSpanThin>{' '}
                <Link
                  href={
                    !isCreatorsBid
                      ? `/${option.creator?.username!!}`
                      : `/${postCreator.username!!}`
                  }
                >
                  <SSpanBold
                    style={{
                      ...(!isCreatorsBid
                        ? {
                            cursor: 'pointer',
                          }
                        : {}),
                    }}
                  >
                    {isCreatorsBid
                      ? t('mcPost.optionsTab.me')
                      : getDisplayname(option.creator!!)}
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

McWinnerTabModeration.defaultProps = {};

export default McWinnerTabModeration;

const STabContainer = styled(motion.div)`
  width: 100%;
  height: calc(100% - 112px);

  min-height: 300px;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SNumBidders = styled(Text)`
  color: #ffffff;
`;

const SHeadline = styled(Headline)`
  margin-bottom: 8px;
  color: #ffffff;
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
