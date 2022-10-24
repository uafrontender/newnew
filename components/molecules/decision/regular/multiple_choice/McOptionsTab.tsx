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
import {
  addNewOption,
  voteWithBundleVotes,
} from '../../../../../api/endpoints/multiple_choice';

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
import UseBundleVotesModal from './UseBundleVotesModal';
import { markTutorialStepAsCompleted } from '../../../../../api/endpoints/user';
import { Mixpanel } from '../../../../../utils/mixpanel';
import BuyBundleModal from '../../../bundles/BuyBundleModal';
import McConfirmUseFreeVoteModal from './McConfirmUseFreeVoteModal';
import HighlightedButton from '../../../../atoms/bundles/HighlightedButton';
import TicketSet from '../../../../atoms/bundles/TicketSet';

interface IMcOptionsTab {
  post: newnewapi.MultipleChoice;
  postLoading: boolean;
  postStatus: TPostStatusStringified;
  postCreatorName: string;
  postDeadline: string;
  options: newnewapi.MultipleChoice.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  hasVotedOptionId?: number;
  bundle?: newnewapi.IBundle;
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
  postCreatorName,
  postDeadline,
  options,
  optionsLoading,
  pagingToken,
  hasVotedOptionId,
  bundle,
  handleLoadOptions,
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
    !hasVotedOptionId &&
      postStatus === 'voting' &&
      (post.creator?.options?.isOfferingBundles || bundle)
      ? 58 + 72
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
  const [useBundleVotesModalOpen, setUseBundleVotesModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  // Bundle modal
  const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);

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

  const handleAddNewOption = useCallback(async () => {
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

      const res = await addNewOption(payload);

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
      handleAddOrUpdateOptionFromResponse(optionFromResponse);
      setNewOptionText('');
      setSuggestNewMobileOpen(false);
      setLoadingModalOpen(false);
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
    handleAddOrUpdateOptionFromResponse,
  ]);

  const handleVoteWithBundleVotes = useCallback(async () => {
    setUseBundleVotesModalOpen(false);
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

      const res = await voteWithBundleVotes(payload);

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
        setHeightDelta(size + 57);
      }
    });

    if (
      !postLoading &&
      !hasVotedOptionId &&
      postStatus === 'voting' &&
      (post.creator?.options?.isOfferingBundles || bundle) &&
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
    postStatus,
    isMobileOrTablet,
    bundle,
    post.creator?.options?.isOfferingBundles,
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
              postCreatorName={postCreatorName}
              postCreatorUuid={post.creator?.uuid ?? ''}
              postText={post.title}
              postId={post.postUuid}
              index={i}
              optionBeingSupported={optionBeingSupported}
              bundleVotesLeft={bundle ? bundle.votesLeft! : undefined}
              votingAllowed={postStatus === 'voting'}
              isCreatorsBid={
                !option.creator || option.creator?.uuid === post.creator?.uuid
              }
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
        {!hasVotedOptionId &&
          postStatus === 'voting' &&
          (post.creator?.options?.isOfferingBundles || bundle) && (
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
              <SAddOptionButton
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
                  // TODO: change event name?
                  Mixpanel.track('Click Add Free Option', {
                    _stage: 'Post',
                    _postUuid: post.postUuid,
                    _component: 'McOptionsTab',
                  });
                  if (bundle) {
                    setUseFreeVoteModalOpen(true);
                  } else {
                    setBuyBundleModalOpen(true);
                  }
                }}
              >
                {t('mcPost.optionsTab.actionSection.placeABidButton')}
              </SAddOptionButton>
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
        {post.creator?.options?.isOfferingBundles && (
          <SBundlesContainer highlighted={bundle?.votesLeft === 0}>
            {bundle?.votesLeft === 0 && (
              <STicketSet numberOFTickets={2} size={36} shift={11} />
            )}
            <SBundlesText>
              {t('mcPost.optionsTab.actionSection.offersBundles', {
                creator: postCreatorName,
              })}
            </SBundlesText>
            <SHighlightedButton
              size='small'
              onClick={() => {
                setBuyBundleModalOpen(true);
              }}
            >
              {t('mcPost.optionsTab.actionSection.viewBundles')}
            </SHighlightedButton>
          </SBundlesContainer>
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
      {isMobile &&
      !hasVotedOptionId &&
      (post.creator?.options?.isOfferingBundles || bundle) ? (
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
            <SAddOptionButton
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
                if (bundle) {
                  setUseFreeVoteModalOpen(true);
                } else {
                  setBuyBundleModalOpen(true);
                }
              }}
            >
              {t('mcPost.optionsTab.actionSection.placeABidButton')}
            </SAddOptionButton>
          </SSuggestNewContainer>
        </OptionActionMobileModal>
      ) : null}
      {/* Use Free vote modal */}
      <McConfirmUseFreeVoteModal
        isVisible={useFreeVoteModalOpen}
        handleMakeFreeVote={handleAddNewOption}
        closeModal={() => setUseFreeVoteModalOpen(false)}
      />
      {/* Use bundle vote modal */}
      {bundle && (
        <UseBundleVotesModal
          isVisible={useBundleVotesModalOpen}
          optionText={optionBeingSupported}
          bundleVotesLeft={bundle.votesLeft!}
          handleVoteWithBundleVotes={handleVoteWithBundleVotes}
          onClose={() => setUseBundleVotesModalOpen(false)}
        />
      )}
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* Payment success Modal */}
      <PaymentSuccessModal
        postType='mc'
        isVisible={paymentSuccessModalOpen}
        closeModal={() => setPaymentSuccessModalOpen(false)}
      >
        {t('paymentSuccessModal.mc', {
          postCreator: postCreatorName,
          postDeadline,
        })}
      </PaymentSuccessModal>
      {/* Mobile floating button */}
      {isMobile &&
      !suggestNewMobileOpen &&
      !hasVotedOptionId &&
      postStatus === 'voting' &&
      (post.creator?.options?.isOfferingBundles || bundle) ? (
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
      {buyBundleModalOpen && post.creator && (
        <BuyBundleModal
          show
          creator={post.creator}
          onClose={() => {
            setBuyBundleModalOpen(false);
          }}
        />
      )}
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

const SAddOptionButton = styled(Button)`
  width: 100%;

  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colorsThemed.accent.blue};

  &:active:enabled,
  &:hover:enabled,
  &:focus:enabled {
    background: ${({ theme }) => theme.colorsThemed.accent.blue};
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

    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colorsThemed.background.secondary
        : theme.colorsThemed.background.primary};

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

const SBundlesContainer = styled.div<{ highlighted: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme, highlighted }) =>
    highlighted
      ? theme.colorsThemed.accent.yellow
      : theme.colorsThemed.tag.color.primary};
  margin-top: 32px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    margin-top: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 32px;
  }
`;

const STicketSet = styled(TicketSet)`
  margin-right: 8px;
`;

const SBundlesText = styled.p`
  flex-grow: 1;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 600;
  text-align: center;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 16px;
  margin-right: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 0px;
    text-align: start;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const SHighlightedButton = styled(HighlightedButton)`
  width: auto;
`;
