/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../../redux-store/store';
import useAcOptions, {
  TAcOptionWithHighestField,
} from '../../../../../utils/hooks/useAcOptions';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import { Mixpanel } from '../../../../../utils/mixpanel';

import Button from '../../../../atoms/Button';
import Lottie from '../../../../atoms/Lottie';
import AcOptionCard from '../../regular/auction/AcOptionCard';
import GradientMask from '../../../../atoms/GradientMask';

import loadingAnimation from '../../../../../public/animations/logo-loading-blue.json';
import { useAppState } from '../../../../../contexts/appStateContext';

interface IAcWaitingOptionsSection {
  post: newnewapi.Auction;
}

const AcWaitingOptionsSection: React.FunctionComponent<
  IAcWaitingOptionsSection
> = ({ post }) => {
  const { t } = useTranslation('page-Post');
  const { user } = useAppSelector((state) => state);
  const { resizeMode, userLoggedIn } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Options
  const {
    processedOptions: options,
    hasNextPage: hasNextOptionsPage,
    fetchNextPage: fetchNextOptionsPage,
    isLoading: isOptionsLoading,
    removeAcOptionMutation,
  } = useAcOptions(
    {
      postUuid: post.postUuid,
      userUuid: user.userData?.userUuid,
      loggedInUser: userLoggedIn,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Scroll block
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(
    containerRef,
    options.length > 0
  );

  const handleRemoveOption = useCallback(
    async (optionToRemove: newnewapi.Auction.Option) => {
      removeAcOptionMutation?.mutate(optionToRemove);
    },
    [removeAcOptionMutation]
  );

  useEffect(() => {
    if (inView) {
      fetchNextOptionsPage();
    }
  }, [inView, fetchNextOptionsPage]);

  return (
    <SWrapper>
      {options.length === 0 && isOptionsLoading && (
        <SLoadingSpinnerDiv>
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        </SLoadingSpinnerDiv>
      )}
      {!isMobile ? (
        <>
          <GradientMask
            gradientType='secondary'
            positionTop
            active={showTopGradient}
          />
          <GradientMask
            gradientType='secondary'
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
            optionBeingSupported=''
            postUuid={post.postUuid}
            postShortId={post.postShortId ?? ''}
            postCreator={post.creator}
            postText=''
            index={i}
            minAmount={0}
            votingAllowed={false}
            handleSetSupportedBid={() => {}}
            handleUpdateOptionFromResponse={() => {}}
            handleRemoveOption={() => {
              Mixpanel.track('Removed Option', {
                _stage: 'Post',
                _postUuid: post.postUuid,
                _component: 'AcOptionsTab',
              });
              handleRemoveOption(option);
            }}
            handleSetScrollBlocked={() => setIsScrollBlocked(true)}
            handleUnsetScrollBlocked={() => setIsScrollBlocked(false)}
          />
        ))}
        {hasNextOptionsPage ? (
          !isMobile ? (
            <SLoaderDiv ref={loadingRef} />
          ) : (
            <SLoadMoreBtn
              view='secondary'
              onClickCapture={() => {
                Mixpanel.track('Click Load More', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'AcWaitingOptionsTab',
                });
              }}
              onClick={() => fetchNextOptionsPage()}
            >
              {t('loadMoreButton')}
            </SLoadMoreBtn>
          )
        ) : null}
      </SBidsContainer>
    </SWrapper>
  );
};

export default AcWaitingOptionsSection;

const SWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  ${({ theme }) => theme.media.tablet} {
    flex: 1 1 auto;
  }
`;

const SBidsContainer = styled.div`
  position: relative;

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

const SLoadingSpinnerDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  top: calc(50% - 32px);
  left: calc(50% - 32px);
`;
