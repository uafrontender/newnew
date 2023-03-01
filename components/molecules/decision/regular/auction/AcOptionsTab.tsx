/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { FetchNextPageOptions, InfiniteQueryObserverResult } from 'react-query';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../redux-store/store';

import { TAcOptionWithHighestField } from '../../../../../utils/hooks/useAcOptions';
import { setUserTutorialsProgress } from '../../../../../redux-store/slices/userStateSlice';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import { markTutorialStepAsCompleted } from '../../../../../api/endpoints/user';
import { useGetAppConstants } from '../../../../../contexts/appConstantsContext';
import { Mixpanel } from '../../../../../utils/mixpanel';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import Lottie from '../../../../atoms/Lottie';
import GradientMask from '../../../../atoms/GradientMask';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../../atoms/decision/TutorialTooltip';
import AcOptionCard from './AcOptionCard';

import NoContentYetImg from '../../../../../public/images/decision/no-content-yet-mock.png';
import loadingAnimation from '../../../../../public/animations/logo-loading-blue.json';
import { useAppState } from '../../../../../contexts/appStateContext';

interface IAcOptionsTab {
  postUuid: string;
  postShortId: string;
  postCreatorName: string;
  postText: string;
  postDeadline: string;
  postStatus: TPostStatusStringified;
  options: newnewapi.Auction.Option[];
  optionsLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<
    InfiniteQueryObserverResult<
      {
        acOptions: newnewapi.MultipleChoice.IOption[];
        paging: newnewapi.IPagingResponse | null | undefined;
      },
      unknown
    >
  >;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.Auction.Option
  ) => void;
  handleRemoveOption: (optionToRemove: newnewapi.Auction.Option) => void;
}

const AcOptionsTab: React.FunctionComponent<IAcOptionsTab> = ({
  postUuid,
  postShortId,
  postCreatorName,
  postText,
  postDeadline,
  postStatus,
  options,
  optionsLoading,
  hasNextPage,
  fetchNextPage,
  handleAddOrUpdateOptionFromResponse,
  handleRemoveOption,
}) => {
  const { t } = useTranslation('page-Post');
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { appConstants } = useGetAppConstants();

  // Scroll block
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(
    containerRef,
    options.length > 0
  );

  const mainContainer = useRef<HTMLDivElement>();

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  const goToNextStep = (currentStep: newnewapi.AcTutorialStep) => {
    if (user.userTutorialsProgress.remainingAcSteps && currentStep) {
      if (user.loggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          acCurrentStep: currentStep,
        });
        markTutorialStepAsCompleted(payload);
      }
      dispatch(
        setUserTutorialsProgress({
          remainingAcSteps: [
            ...user.userTutorialsProgress.remainingAcSteps,
          ].filter((el) => el !== currentStep),
        })
      );
    }
  };

  useEffect(() => {
    if (optionBeingSupported && containerRef.current && !isMobile) {
      let optIdx = options.findIndex(
        (o) => o.id.toString() === optionBeingSupported
      );
      optIdx += 2;
      const childDiv = containerRef.current.children[optIdx];

      if (childDiv) {
        childDiv.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [options, optionBeingSupported, isMobile]);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <>
      <STabContainer
        key='bids'
        ref={(el) => {
          mainContainer.current = el!!;
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, speed: 0.4 }}
        exit={{ opacity: 0 }}
      >
        {options.length === 0 && !optionsLoading && postStatus !== 'failed' ? (
          <SNoOptionsYet>
            <SNoOptionsImgContainer>
              <img src={NoContentYetImg.src} alt='No content yet' />
            </SNoOptionsImgContainer>
            <SNoOptionsCaption variant={3}>
              {t('acPost.optionsTab.noOptions.caption_1')}
            </SNoOptionsCaption>
            <SNoOptionsCaption variant={3}>
              {t('acPost.optionsTab.noOptions.caption_2')}
            </SNoOptionsCaption>
          </SNoOptionsYet>
        ) : null}
        {options.length === 0 && optionsLoading && postStatus !== 'failed' ? (
          <SNoOptionsYet>
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          </SNoOptionsYet>
        ) : null}
        {!isMobile && !optionBeingSupported ? (
          <>
            <GradientMask
              gradientType='primary'
              positionTop
              active={showTopGradient}
            />
            <GradientMask
              gradientType='primary'
              positionBottom={0}
              active={showBottomGradient}
            />
          </>
        ) : null}
        <SBidsContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
          style={{
            ...(isScrollBlocked
              ? {
                  overflow: 'hidden',
                  width:
                    options.length > 4
                      ? 'calc(100% + 10px)'
                      : 'calc(100% + 14px)',
                }
              : {}),
          }}
        >
          {options.map((option, i) => (
            <AcOptionCard
              key={option.id.toString()}
              option={option as TAcOptionWithHighestField}
              postUuid={postUuid}
              postShortId={postShortId}
              postCreatorName={postCreatorName}
              postDeadline={postDeadline}
              postText={postText}
              index={i}
              minAmount={parseInt((appConstants.minAcBid / 100).toFixed(0))}
              votingAllowed={postStatus === 'voting'}
              optionBeingSupported={optionBeingSupported}
              handleSetSupportedBid={(id: string) =>
                setOptionBeingSupported(id)
              }
              handleAddOrUpdateOptionFromResponse={
                handleAddOrUpdateOptionFromResponse
              }
              handleRemoveOption={() => {
                Mixpanel.track('Remove Option', {
                  _stage: 'Post',
                  _postUuid: postUuid,
                  _component: 'AcOptionsTab',
                });
                handleRemoveOption(option);
              }}
              handleSetScrollBlocked={() => setIsScrollBlocked(true)}
              handleUnsetScrollBlocked={() => setIsScrollBlocked(false)}
            />
          ))}
          {hasNextPage ? (
            !isMobile ? (
              <SLoaderDiv ref={loadingRef} />
            ) : (
              <SLoadMoreBtn
                view='secondary'
                onClick={() => {
                  Mixpanel.track('Click Load More', {
                    _stage: 'Post',
                    _postUuid: postUuid,
                    _component: 'AcOptionsTab',
                  });
                  fetchNextPage();
                }}
              >
                {t('loadMoreButton')}
              </SLoadMoreBtn>
            )
          ) : null}
        </SBidsContainer>
        {user?.userTutorialsProgress.remainingAcSteps &&
          postStatus === 'voting' && (
            <STutorialTooltipHolder>
              <TutorialTooltip
                isTooltipVisible={
                  options.length > 0 &&
                  user.userTutorialsProgress.remainingAcSteps[0] ===
                    newnewapi.AcTutorialStep.AC_ALL_BIDS
                }
                closeTooltip={() =>
                  goToNextStep(newnewapi.AcTutorialStep.AC_ALL_BIDS)
                }
                title={t('tutorials.ac.peopleBids.title')}
                text={t('tutorials.ac.peopleBids.text')}
                dotPosition={DotPositionEnum.BottomLeft}
              />
            </STutorialTooltipHolder>
          )}
      </STabContainer>
    </>
  );
};

AcOptionsTab.defaultProps = {};

export default AcOptionsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  ${({ theme }) => theme.media.tablet} {
    flex: 1 1 auto;
  }
`;

const SBidsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  padding-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;

    padding-top: 0px;
    padding-right: 12px;
    margin-right: -14px;
    width: calc(100% + 14px);
    height: initial;
    flex: 1 1 auto;

    // Scrollbar
    &::-webkit-scrollbar {
      width: 4px;
    }
    scrollbar-width: none;
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }
    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }

    &:hover {
      scrollbar-width: thin;
      &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colorsThemed.background.outlines1};
      }

      &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colorsThemed.background.outlines2};
      }
    }
  }
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;

const SLoadMoreBtn = styled(Button)`
  width: 100%;
  height: 56px;
`;

// No options yet
const SNoOptionsYet = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-height: 300px;

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
  }

  ${({ theme }) => theme.media.laptop} {
    min-height: 400px;
  }
`;

const SNoOptionsImgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  img {
    display: block;
    width: 100%;
    height: 100%;
  }

  margin-bottom: 16px;
`;

const SNoOptionsCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 60px;
  bottom: 90%;
  text-align: left;
  div {
    width: 190px;
  }
  ${({ theme }) => theme.media.tablet} {
    bottom: 97%;
  }
`;
