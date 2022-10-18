/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
import React, {
  useCallback,
  // useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../redux-store/store';
import { validateText } from '../../../../../api/endpoints/infrastructure';
// import { getSubscriptionStatus } from '../../../../../api/endpoints/subscription';
import { doFreeVote } from '../../../../../api/endpoints/multiple_choice';

import { TMcOptionWithHighestField } from '../../../../organisms/decision/regular/PostViewMC';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

import Button from '../../../../atoms/Button';
import McOptionCard from './McOptionCard';
import SuggestionTextArea from '../../../../atoms/decision/SuggestionTextArea';
// import VotesAmountTextInput from '../../../atoms/decision/VotesAmountTextInput';
import LoadingModal from '../../../LoadingModal';
import GradientMask from '../../../../atoms/GradientMask';
import OptionActionMobileModal from '../../common/OptionActionMobileModal';
import PaymentSuccessModal from '../../common/PaymentSuccessModal';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../../redux-store/slices/userStateSlice';
import { useGetAppConstants } from '../../../../../contexts/appConstantsContext';
import McConfirmUseFreeVoteModal from './McConfirmUseFreeVoteModal';
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
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { appConstants } = useGetAppConstants();

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  const [heightDelta, setHeightDelta] = useState(
    post.isSuggestionsAllowed && !hasVotedOptionId && postStatus === 'voting'
      ? 56
      : 0
  );
  const actionSectionContainer = useRef<HTMLDivElement>();

  const mainContainer = useRef<HTMLDivElement>();

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  // New option/bid
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionTextValid, setNewOptionTextValid] = useState(true);
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  // Mobile modal for new option
  const [suggestNewMobileOpen, setSuggestNewMobileOpen] = useState(false);
  // Payment modal
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [useFreeVoteModalOpen, setUseFreeVoteModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  // Handlers
  const validateTextViaAPI = useCallback(async (text: string) => {
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateTextRequest({
        // NB! temp
        kind: newnewapi.ValidateTextRequest.Kind.POST_OPTION,
        text,
      });

      const res = await validateText(payload);

      if (!res.data?.status) throw new Error('An error occurred');

      if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
        setNewOptionTextValid(false);
      } else {
        setNewOptionTextValid(true);
      }

      setIsAPIValidateLoading(false);
    } catch (err) {
      console.error(err);
      setIsAPIValidateLoading(false);
    }
  }, []);

  const validateTextViaAPIDebounced = useMemo(
    () =>
      debounce((text: string) => {
        validateTextViaAPI(text);
      }, 250),
    [validateTextViaAPI]
  );

  const handleUpdateNewOptionText = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewOptionText(e.target.value.trim() ? e.target.value : '');

      if (e.target.value.length > 0) {
        validateTextViaAPIDebounced(e.target.value);
      }
    },
    [setNewOptionText, validateTextViaAPIDebounced]
  );

  const handleVoteForFree = useCallback(async () => {
    setUseFreeVoteModalOpen(false);
    setLoadingModalOpen(true);
    Mixpanel.track('Vote For Free', {
      _stage: 'Post',
      _postUuid: post.postUuid,
      _component: 'McOptionsTab',
    });
    try {
      const payload = new newnewapi.VoteOnPostRequest({
        votesCount: appConstants.mcFreeVoteCount,
        optionText: newOptionText,
        postUuid: post.postUuid,
      });

      const res = await doFreeVote(payload);

      if (
        !res.data ||
        res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS ||
        res.error
      ) {
        throw new Error(res.error?.message ?? 'Request failed');
      }

      const optionFromResponse = (res.data
        .option as newnewapi.MultipleChoice.Option)!!;
      optionFromResponse.isSupportedByMe = true;
      // optionFromResponse.isCreatedBySubscriber = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);

      setNewOptionText('');
      setSuggestNewMobileOpen(false);
      setLoadingModalOpen(false);
      handleResetFreeVote();
      setPaymentSuccessModalOpen(true);
    } catch (err) {
      console.error(err);
      setLoadingModalOpen(false);
      toast.error('toastErrors.generic');
    }
  }, [
    newOptionText,
    post.postUuid,
    appConstants.mcFreeVoteCount,
    handleResetFreeVote,
    handleAddOrUpdateOptionFromResponse,
  ]);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadOptions(pagingToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entry: any) => {
      const size = entry[0]?.borderBoxSize
        ? entry[0]?.borderBoxSize[0]?.blockSize
        : entry[0]?.contentRect.height;
      if (size) {
        setHeightDelta(size);
      }
    });

    if (
      post.isSuggestionsAllowed &&
      !postLoading &&
      !hasVotedOptionId &&
      postStatus === 'voting' &&
      actionSectionContainer.current
    ) {
      resizeObserver.observe(actionSectionContainer.current!!);
    } else {
      setHeightDelta(0);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    hasVotedOptionId,
    postLoading,
    post.isSuggestionsAllowed,
    postStatus,
    isMobileOrTablet,
  ]);

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
        <SBidsContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
          heightDelta={heightDelta}
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
                positionBottom={heightDelta}
                active={showBottomGradient}
              />
            </>
          ) : null}
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
        {post.isSuggestionsAllowed &&
          !hasVotedOptionId &&
          canVoteForFree &&
          postStatus === 'voting' && (
            <SActionSection
              ref={(el) => {
                actionSectionContainer.current = el!!;
              }}
            >
              <SuggestionTextArea
                value={newOptionText}
                disabled={optionBeingSupported !== ''}
                placeholder={t(
                  'mcPost.optionsTab.actionSection.suggestionPlaceholder'
                )}
                onChange={handleUpdateNewOptionText}
              />
              <SAddFreeVoteButton
                size='sm'
                disabled={
                  !newOptionText ||
                  optionBeingSupported !== '' ||
                  !newOptionTextValid
                }
                style={{
                  ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
                }}
                onClick={() => {
                  Mixpanel.track('Click Add Free Option', {
                    _stage: 'Post',
                    _postUuid: post.postUuid,
                    _component: 'McOptionsTab',
                  });
                  setUseFreeVoteModalOpen(true);
                }}
              >
                {t('mcPost.optionsTab.actionSection.placeABidButton')}
              </SAddFreeVoteButton>
              {user.userTutorialsProgress.remainingMcSteps && (
                <STutorialTooltipTextAreaHolder>
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
                </STutorialTooltipTextAreaHolder>
              )}
            </SActionSection>
          )}
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
      {/* Suggest new Modal */}
      {isMobile && !hasVotedOptionId ? (
        <OptionActionMobileModal
          isOpen={suggestNewMobileOpen}
          onClose={() => setSuggestNewMobileOpen(false)}
          zIndex={12}
        >
          <SSuggestNewContainer>
            <SuggestionTextArea
              value={newOptionText}
              disabled={optionBeingSupported !== ''}
              autofocus={suggestNewMobileOpen}
              placeholder={t(
                'mcPost.optionsTab.actionSection.suggestionPlaceholderDesktop'
              )}
              onChange={handleUpdateNewOptionText}
            />
            <SAddFreeVoteButton
              size='sm'
              disabled={
                !newOptionText ||
                optionBeingSupported !== '' ||
                !newOptionTextValid
              }
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => {
                Mixpanel.track('Click Add Free Option', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTab',
                });
                setUseFreeVoteModalOpen(true);
              }}
            >
              {t('mcPost.optionsTab.actionSection.placeABidButton')}
            </SAddFreeVoteButton>
          </SSuggestNewContainer>
        </OptionActionMobileModal>
      ) : null}
      {/* Use Free vote modal */}
      <McConfirmUseFreeVoteModal
        isVisible={useFreeVoteModalOpen}
        handleMakeFreeVote={handleVoteForFree}
        closeModal={() => setUseFreeVoteModalOpen(false)}
      />
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
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
  /* height: calc(100% - 50px); */

  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.tablet} {
    display: initial;

    height: calc(100% - 56px);
    height: 100%;
  }
`;

const SBidsContainer = styled.div<{
  heightDelta: number;
}>`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  padding-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px)`};
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

const SSuggestNewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 16px;

  textarea {
    width: 100%;
  }
`;

const SAddFreeVoteButton = styled(Button)`
  width: 100%;

  color: ${({ theme }) => theme.colors.dark};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};

  &:active:enabled,
  &:hover:enabled,
  &:focus:enabled {
    background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  }
`;

const SActionSection = styled.div`
  display: none;
  position: relative;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;

    min-height: 50px;
    width: 100%;
    z-index: 5;

    padding-top: 8px;

    border-top: 1.5px solid
      ${({ theme }) => theme.colorsThemed.background.outlines1};

    textarea {
      width: 100%;
    }
  }
`;

// const SBottomPlaceholder = styled.div`
//   display: none;

//   ${({ theme }) => theme.media.laptop} {
//     display: block;

//     position: absolute;
//     bottom: 0px;

//     font-weight: 600;
//     font-size: 12px;
//     line-height: 16px;
//     color: ${({ theme }) => theme.colorsThemed.text.tertiary};
//     width: max-content;
//   }
// `;

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

const STutorialTooltipTextAreaHolder = styled.div`
  position: absolute;
  left: -140px;
  bottom: 94%;
  text-align: left;
  div {
    width: 190px;
  }
`;
