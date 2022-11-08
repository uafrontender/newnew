/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
import React, {
  useCallback,
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
import { createCustomOption } from '../../../../../api/endpoints/multiple_choice';

import { TMcOptionWithHighestField } from '../../../../organisms/decision/regular/PostViewMC';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';

import Button from '../../../../atoms/Button';
import McOptionCard from './McOptionCard';
import SuggestionTextArea from '../../../../atoms/decision/SuggestionTextArea';
import LoadingModal from '../../../LoadingModal';
import GradientMask from '../../../../atoms/GradientMask';
import PaymentSuccessModal from '../../common/PaymentSuccessModal';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../../../api/endpoints/user';
import { Mixpanel } from '../../../../../utils/mixpanel';
import BuyBundleModal from '../../../bundles/BuyBundleModal';
import McConfirmCustomOptionModal from './McConfirmCustomOptionModal';
import HighlightedButton from '../../../../atoms/bundles/HighlightedButton';
import TicketSet from '../../../../atoms/bundles/TicketSet';
import OptionActionMobileModal from '../../common/OptionActionMobileModal';

interface IMcOptionsTab {
  post: newnewapi.MultipleChoice;
  postLoading: boolean;
  postStatus: TPostStatusStringified;
  postCreatorName: string;
  postDeadline: string;
  options: newnewapi.MultipleChoice.Option[];
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
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
  bundle,
  handleLoadOptions,
  handleRemoveOption,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
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

  const optionCreatedByMe = useMemo(
    () =>
      options.find(
        (option) => option.creator?.uuid === user.userData?.userUuid
      ),
    [options, user.userData?.userUuid]
  );

  const mainContainer = useRef<HTMLDivElement>();

  // New option/bid
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionTextValid, setNewOptionTextValid] = useState(true);
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);

  // Mobile modal for new option
  const [suggestNewMobileOpen, setSuggestNewMobileOpen] = useState(false);
  // Payment modal
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [confirmCustomOptionModalOpen, setConfirmCustomOptionModalOpen] =
    useState(false);
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
    setConfirmCustomOptionModalOpen(false);
    setLoadingModalOpen(true);
    Mixpanel.track('Add Free Option', {
      _stage: 'Post',
      _postUuid: post.postUuid,
      _component: 'McOptionsTab',
    });
    try {
      const payload = new newnewapi.CreateCustomMcOptionRequest({
        postUuid: post.postUuid,
        optionText: newOptionText,
      });

      const res = await createCustomOption(payload);

      if (
        !res.data ||
        res.data.status !==
          newnewapi.CreateCustomMcOptionResponse.Status.SUCCESS ||
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
  }, [newOptionText, post.postUuid, handleAddOrUpdateOptionFromResponse]);

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
              postCreatorName={postCreatorName}
              postText={post.title}
              postId={post.postUuid}
              index={i}
              bundle={bundle}
              isCreatorsBid={
                !option.creator || option.creator?.uuid === post.creator?.uuid
              }
              noAction={postStatus === 'failed'}
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
      </STabContainer>
      {/* Suggest new form */}
      {!optionCreatedByMe &&
        postStatus === 'voting' &&
        (post.creator?.options?.isOfferingBundles || bundle) && (
          <SActionSection>
            <SuggestionTextArea
              value={newOptionText}
              placeholder={t(
                'mcPost.optionsTab.actionSection.suggestionPlaceholder'
              )}
              onChange={handleUpdateNewOptionText}
            />
            <SAddOptionButton
              size='sm'
              disabled={!newOptionText || !newOptionTextValid}
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
                  setConfirmCustomOptionModalOpen(true);
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
            <STicketSet numberOFTickets={3} size={36} shift={11} />
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
      {/* Suggest new Modal */}
      {isMobile &&
      !optionCreatedByMe &&
      postStatus === 'voting' &&
      (post.creator?.options?.isOfferingBundles || bundle) ? (
        <OptionActionMobileModal
          isOpen={suggestNewMobileOpen}
          onClose={() => setSuggestNewMobileOpen(false)}
          zIndex={12}
        >
          <SSuggestNewContainer>
            <SuggestionTextArea
              value={newOptionText}
              autofocus={suggestNewMobileOpen}
              placeholder={t(
                'mcPost.optionsTab.actionSection.suggestionPlaceholderDesktop'
              )}
              onChange={handleUpdateNewOptionText}
            />
            <SAddOptionButton
              size='sm'
              disabled={!newOptionText || !newOptionTextValid}
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
                  setConfirmCustomOptionModalOpen(true);
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
      {/* Add a custom option Modal */}
      <McConfirmCustomOptionModal
        isVisible={confirmCustomOptionModalOpen}
        handleAddCustomOption={handleAddNewOption}
        closeModal={() => setConfirmCustomOptionModalOpen(false)}
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
          postCreator: postCreatorName,
          postDeadline,
        })}
      </PaymentSuccessModal>
      {/* Mobile floating button */}
      {isMobile &&
      !suggestNewMobileOpen &&
      !optionCreatedByMe &&
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
      : // TODO: standardize color
      theme.name === 'light'
      ? '#E5E9F1'
      : '#2C2C33'};
  margin-top: 32px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    margin-top: initial;
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
