/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FetchNextPageOptions, InfiniteQueryObserverResult } from 'react-query';

import { TAcOptionWithHighestField } from '../../../../../utils/hooks/useAcOptions';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import AcOptionCardModeration from './AcOptionCardModeration';

import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

import NoContentYetImg from '../../../../../public/images/decision/no-content-yet-mock.png';
import { selectWinningOption } from '../../../../../api/endpoints/auction';
import { Mixpanel } from '../../../../../utils/mixpanel';
import useErrorToasts from '../../../../../utils/hooks/useErrorToasts';
import { usePostInnerState } from '../../../../../contexts/postInnerContext';
import { usePostModerationResponsesContext } from '../../../../../contexts/postModerationResponsesContext';
import { useAppState } from '../../../../../contexts/appStateContext';

interface IAcOptionsTabModeration {
  postUuid: string;
  options: newnewapi.Auction.Option[];
  winningOptionId?: number;
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
  handleRemoveOption: (optionToDelete: newnewapi.Auction.Option) => void;
  handleUpdateWinningOption: (winningOption: newnewapi.Auction.Option) => void;
}

const AcOptionsTabModeration: React.FunctionComponent<
  IAcOptionsTabModeration
> = ({
  postUuid,
  options,
  optionsLoading,
  winningOptionId,
  hasNextPage,
  fetchNextPage,
  handleRemoveOption,
  handleUpdateWinningOption,
}) => {
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { showErrorToastPredefined } = useErrorToasts();

  const { postStatus, refetchPost } = usePostInnerState();
  const { handleChangeTab } = usePostModerationResponsesContext();

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  // Scroll block
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } = useScrollGradients(
    containerRef,
    options.length > 0
  );

  const mainContainer = useRef<HTMLDivElement>();

  const handleConfirmWinningOption = async (
    winningOption: newnewapi.Auction.Option
  ) => {
    try {
      const payload = new newnewapi.SelectWinningOptionRequest({
        postUuid,
        winningOptionId: winningOption.id,
      });

      const res = await selectWinningOption(payload);

      if (res.data) {
        await refetchPost();
        handleUpdateWinningOption(winningOption);
        handleChangeTab('response');
      }
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    }
  };

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
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {!isMobile ? (
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
        {options.length === 0 && !optionsLoading && postStatus !== 'failed' ? (
          <SNoOptionsYet>
            <SNoOptionsImgContainer>
              <img src={NoContentYetImg.src} alt='No content yet' />
            </SNoOptionsImgContainer>
            <SNoOptionsCaption variant={3}>
              {t('acPostModeration.optionsTab.noOptions.caption_1')}
            </SNoOptionsCaption>
          </SNoOptionsYet>
        ) : (
          <SBidsContainer
            id='acOptionsTabModeration__bidsContainer'
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
              <AcOptionCardModeration
                index={i}
                key={option.id.toString()}
                postStatus={postStatus}
                option={option as TAcOptionWithHighestField}
                isWinner={winningOptionId?.toString() === option.id.toString()}
                handleRemoveOption={handleRemoveOption}
                handleConfirmWinningOption={() =>
                  handleConfirmWinningOption(option)
                }
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
                  onClickCapture={() => {
                    Mixpanel.track('Click Load More', {
                      _stage: 'Post',
                      _postUuid: postUuid,
                      _component: 'AcOptionsTabModeration',
                    });
                  }}
                  onClick={() => fetchNextPage()}
                >
                  {t('loadMoreButton')}
                </SLoadMoreBtn>
              )
            ) : null}
          </SBidsContainer>
        )}
      </STabContainer>
    </>
  );
};

AcOptionsTabModeration.defaultProps = {};

export default AcOptionsTabModeration;

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
  width: calc(100% - 16px);
  height: 56px;
`;

// No options yet
const SNoOptionsYet = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-height: 400px;
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
