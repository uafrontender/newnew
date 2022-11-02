/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../redux-store/store';

import { TMcOptionWithHighestField } from '../../../../organisms/decision/regular/PostViewMC';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

import Button from '../../../../atoms/Button';
import McOptionCard from './McOptionCard';
import GradientMask from '../../../../atoms/GradientMask';
import PaymentSuccessModal from '../../common/PaymentSuccessModal';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../../api/endpoints/user';
import { Mixpanel } from '../../../../../utils/mixpanel';

interface IMcOptionsTab {
  post: newnewapi.MultipleChoice;
  postLoading: boolean;
  postStatus: TPostStatusStringified;
  postCreator: string;
  postDeadline: string;
  options: newnewapi.MultipleChoice.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  votePrice: number;
  canVoteForFree: boolean;
  hasVotedOptionId?: number;
  canSubscribe: boolean;
  handleResetFreeVote: () => void;
  handleLoadOptions: (token?: string) => void;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.MultipleChoice.Option
  ) => void;
  handleRemoveOption: (optionToRemove: newnewapi.MultipleChoice.Option) => void;
}

const McOptionsTab: React.FunctionComponent<IMcOptionsTab> = ({
  post,
  postLoading,
  postStatus,
  postCreator,
  postDeadline,
  options,
  optionsLoading,
  pagingToken,
  minAmount,
  votePrice,
  canVoteForFree,
  hasVotedOptionId,
  canSubscribe,
  handleLoadOptions,
  handleResetFreeVote,
  handleRemoveOption,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
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

  const mainContainer = useRef<HTMLDivElement>();

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  // Mobile modal for new option
  const [suggestNewMobileOpen, setSuggestNewMobileOpen] = useState(false);
  // Payment success modal
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadOptions(pagingToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  const goToNextStep = () => {
    if (
      user.userTutorialsProgress.remainingMcSteps &&
      user.userTutorialsProgress.remainingMcSteps[0]
    ) {
      if (user.loggedIn) {
        const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
          mcCurrentStep: user.userTutorialsProgress.remainingMcSteps[0],
        });
        markTutorialStepAsCompleted(payload);
      }
      dispatch(
        setUserTutorialsProgress({
          remainingMcSteps: [
            ...user.userTutorialsProgress.remainingMcSteps,
          ].slice(1),
        })
      );
    }
  };

  return (
    <>
      <STabContainer
        key='options'
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
              gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
              positionTop
              active={showTopGradient}
            />
            <GradientMask
              gradientType={theme.name === 'dark' ? 'secondary' : 'primary'}
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
            <McOptionCard
              key={option.id.toString()}
              option={option as TMcOptionWithHighestField}
              creator={option.creator ?? post.creator!!}
              postCreator={postCreator}
              postCreatorUuid={post.creator?.uuid ?? ''}
              postText={post.title}
              postId={post.postUuid}
              index={i}
              optionBeingSupported={optionBeingSupported}
              votingAllowed={postStatus === 'voting'}
              canVoteForFree={canVoteForFree}
              isCreatorsBid={
                !option.creator || option.creator?.uuid === post.creator?.uuid
              }
              handleResetFreeVote={handleResetFreeVote}
              noAction={
                (hasVotedOptionId !== undefined &&
                  hasVotedOptionId !== option.id) ||
                postStatus === 'failed'
              }
              handleSetSupportedBid={(id: string) =>
                setOptionBeingSupported(id)
              }
              handleSetPaymentSuccessModalOpen={(newValue: boolean) =>
                setPaymentSuccessModalOpen(newValue)
              }
              handleAddOrUpdateOptionFromResponse={
                handleAddOrUpdateOptionFromResponse
              }
              handleRemoveOption={() => {
                Mixpanel.track('Removed Option', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTab',
                });
                handleRemoveOption(option);
              }}
              handleSetScrollBlocked={() => setIsScrollBlocked(true)}
              handleUnsetScrollBlocked={() => setIsScrollBlocked(false)}
            />
          ))}
          {!isMobile ? (
            <SLoaderDiv ref={loadingRef} />
          ) : pagingToken ? (
            <SLoadMoreBtn
              onClick={() => {
                Mixpanel.track('Click Load More', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTab',
                });
                handleLoadOptions(pagingToken);
              }}
            >
              {t('loadMoreButton')}
            </SLoadMoreBtn>
          ) : null}
        </SBidsContainer>
        {user.userTutorialsProgress.remainingMcSteps && (
          <STutorialTooltipHolder>
            <TutorialTooltip
              isTooltipVisible={
                user.userTutorialsProgress.remainingMcSteps[0] ===
                newnewapi.McTutorialStep.MC_ALL_OPTIONS
              }
              closeTooltip={goToNextStep}
              title={t('tutorials.mc.peopleBids.title')}
              text={t('tutorials.mc.peopleBids.text')}
              dotPosition={DotPositionEnum.BottomLeft}
            />
          </STutorialTooltipHolder>
        )}
      </STabContainer>
      {/* Payment success Modal */}
      <PaymentSuccessModal
        postType='mc'
        isVisible={paymentSuccessModalOpen}
        closeModal={() => setPaymentSuccessModalOpen(false)}
      >
        {t('paymentSuccessModal.mc', {
          postCreator,
          postDeadline,
        })}
      </PaymentSuccessModal>
      {/* Mobile floating button */}
      {isMobile &&
      !suggestNewMobileOpen &&
      !hasVotedOptionId &&
      postStatus === 'voting' &&
      post.isSuggestionsAllowed &&
      canVoteForFree ? (
        <>
          <SActionButton
            id='action-button-mobile'
            view='primaryGrad'
            onClick={() => setSuggestNewMobileOpen(true)}
            onClickCapture={() =>
              Mixpanel.track('SuggestNewMobile', {
                _stage: 'Post',
                _postUuid: post.postUuid,
                _component: 'McOptionsTab',
              })
            }
          >
            {t('mcPost.floatingActionButton.suggestNewButton')}
          </SActionButton>
          {user.userTutorialsProgress.remainingMcSteps && (
            <STutorialTooltipHolderMobile>
              <TutorialTooltip
                isTooltipVisible={
                  user.userTutorialsProgress.remainingMcSteps[0] ===
                  newnewapi.McTutorialStep.MC_TEXT_FIELD
                }
                closeTooltip={goToNextStep}
                title={t('tutorials.mc.createYourBid.title')}
                text={t('tutorials.mc.createYourBid.text')}
                dotPosition={DotPositionEnum.BottomRight}
              />
            </STutorialTooltipHolderMobile>
          )}
        </>
      ) : null}
    </>
  );
};

McOptionsTab.defaultProps = {};

export default McOptionsTab;

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

const SActionButton = styled(Button)`
  position: fixed;
  z-index: 2;

  width: calc(100% - 32px);
  bottom: 16px;
  left: 16px;
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 40%;
  bottom: 90%;
  text-align: left;
  div {
    width: 190px;
  }
`;

const STutorialTooltipHolderMobile = styled.div`
  position: fixed;
  left: 20%;
  bottom: 82px;
  text-align: left;
  z-index: 999;
  div {
    width: 190px;
  }
`;
