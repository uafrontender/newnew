/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useAppSelector } from '../../../../../redux-store/store';

import { TAcOptionWithHighestField } from '../../../../organisms/decision/PostViewAC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import GradientMask from '../../../../atoms/GradientMask';
import AcOptionCardModeration from './AcOptionCardModeration';

import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

import NoContentYetImg from '../../../../../public/images/decision/no-content-yet-mock.png';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import { selectWinningOption } from '../../../../../api/endpoints/auction';
import { Mixpanel } from '../../../../../utils/mixpanel';

interface IAcOptionsTabModeration {
  postId: string;
  postStatus: TPostStatusStringified;
  options: newnewapi.Auction.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  winningOptionId?: number;
  handleLoadBids: (token?: string) => void;
  handleRemoveOption: (optionToDelete: newnewapi.Auction.Option) => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleUpdateWinningOption: (winningOption: newnewapi.Auction.Option) => void;
}

const AcOptionsTabModeration: React.FunctionComponent<IAcOptionsTabModeration> =
  ({
    postId,
    postStatus,
    options,
    optionsLoading,
    pagingToken,
    winningOptionId,
    handleLoadBids,
    handleRemoveOption,
    handleUpdatePostStatus,
    handleUpdateWinningOption,
  }) => {
    const theme = useTheme();
    const { t } = useTranslation('modal-Post');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    // Infinite load
    const { ref: loadingRef, inView } = useInView();

    const containerRef = useRef<HTMLDivElement>();
    const { showTopGradient, showBottomGradient } =
      useScrollGradients(containerRef);

    const mainContainer = useRef<HTMLDivElement>();

    const handleConfirmWinningOption = async (
      winningOption: newnewapi.Auction.Option
    ) => {
      try {
        const payload = new newnewapi.SelectWinningOptionRequest({
          postUuid: postId,
          winningOptionId: winningOption.id,
        });

        const res = await selectWinningOption(payload);

        if (res.data) {
          handleUpdatePostStatus(newnewapi.Auction.Status.WAITING_FOR_RESPONSE);
          handleUpdateWinningOption(winningOption);
        }
      } catch (err) {
        console.error(err);
      }
    };

    useEffect(() => {
      if (inView && !optionsLoading && pagingToken) {
        handleLoadBids(pagingToken);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, pagingToken, optionsLoading]);

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
          {options.length === 0 &&
          !optionsLoading &&
          postStatus !== 'failed' ? (
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
            >
              {!isMobile ? (
                <>
                  <GradientMask
                    gradientType={
                      theme.name === 'dark' ? 'secondary' : 'primary'
                    }
                    positionTop
                    active={showTopGradient}
                  />
                  <GradientMask
                    gradientType={
                      theme.name === 'dark' ? 'secondary' : 'primary'
                    }
                    positionBottom={0}
                    active={showBottomGradient}
                  />
                </>
              ) : null}
              {options.map((option, i) => (
                <AcOptionCardModeration
                  index={i}
                  key={option.id.toString()}
                  postStatus={postStatus}
                  option={option as TAcOptionWithHighestField}
                  isWinner={
                    winningOptionId?.toString() === option.id.toString()
                  }
                  handleRemoveOption={handleRemoveOption}
                  handleConfirmWinningOption={() =>
                    handleConfirmWinningOption(option)
                  }
                />
              ))}
              {!isMobile ? (
                <SLoaderDiv ref={loadingRef} />
              ) : pagingToken ? (
                <SLoadMoreBtn
                  view='secondary'
                  onClickCapture={() => {
                    Mixpanel.track('Click Load More', {
                      _stage: 'Post',
                      _postUuid: postId,
                      _component: 'AcOptionsTabModeration',
                    });
                  }}
                  onClick={() => handleLoadBids(pagingToken)}
                >
                  {t('loadMoreButton')}
                </SLoadMoreBtn>
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
  height: calc(100% - 56px);
`;

const SBidsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  padding-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    height: 100%;
    padding-top: 0px;
    padding-right: 12px;
    margin-right: -14px;
    width: calc(100% + 14px);

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
