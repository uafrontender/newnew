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
import { FetchNextPageOptions, InfiniteQueryObserverResult } from 'react-query';

import {
  useAppDispatch,
  useAppSelector,
} from '../../../../../redux-store/store';
import { validateText } from '../../../../../api/endpoints/infrastructure';
import { createCustomOption } from '../../../../../api/endpoints/multiple_choice';

import { TMcOptionWithHighestField } from '../../../../../utils/hooks/useMcOptions';
import useScrollGradients from '../../../../../utils/hooks/useScrollGradients';
import { usePushNotifications } from '../../../../../contexts/pushNotificationsContext';

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
import OptionActionMobileModal from '../../common/OptionActionMobileModal';
import Modal from '../../../../organisms/Modal';
import Headline from '../../../../atoms/Headline';
import InlineSvg from '../../../../atoms/InlineSVG';

import AddOptionIcon from '../../../../../public/images/svg/icons/filled/AddOption.svg';
import CloseIcon from '../../../../../public/images/svg/icons/outlined/Close.svg';
import useErrorToasts from '../../../../../utils/hooks/useErrorToasts';
import useBuyBundleAfterStripeRedirect from '../../../../../utils/hooks/useBuyBundleAfterStripeRedirect';
import { usePostInnerState } from '../../../../../contexts/postInnerContext';

const addOptionErrorMessage = (
  status?: newnewapi.CreateCustomMcOptionResponse.Status
) => {
  console.log(status);
  switch (status) {
    // TODO: Cover CANNOT_CREATE_MULTIPLE_OPTIONS = 3;
    case newnewapi.CreateCustomMcOptionResponse.Status
      .NOT_ALLOWED_TO_CREATE_NEW_OPTION:
      return 'errors.notAllowedToCreateNewOption';
    case newnewapi.CreateCustomMcOptionResponse.Status.NOT_UNIQUE:
      return 'errors.optionNotUnique';
    default:
      return 'errors.requestFailed';
  }
};

interface IMcOptionsTab {
  post: newnewapi.MultipleChoice;
  postStatus: TPostStatusStringified;
  postCreatorName: string;
  postDeadline: string;
  options: newnewapi.MultipleChoice.Option[];
  canAddCustomOption: boolean;
  bundle?: newnewapi.IBundle;
  hasNextPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<
    InfiniteQueryObserverResult<
      {
        mcOptions: newnewapi.MultipleChoice.IOption[];
        paging: newnewapi.IPagingResponse | null | undefined;
      },
      unknown
    >
  >;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.MultipleChoice.Option
  ) => void;
  handleRemoveOption: (optionToRemove: newnewapi.MultipleChoice.Option) => void;
}

const McOptionsTab: React.FunctionComponent<IMcOptionsTab> = ({
  post,
  postStatus,
  postCreatorName,
  postDeadline,
  options,
  canAddCustomOption,
  bundle,
  hasNextPage,
  fetchNextPage,
  handleRemoveOption,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { showErrorToastCustom } = useErrorToasts();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const {
    saveCard,
    bundleStripeSetupIntentClientSecret,
    customOptionTextFromRedirect,
    resetBundleSetupIntentClientSecret,
  } = usePostInnerState();

  const onBundlePurchasedAfterRedirect = useCallback(async () => {
    // Showing bundle purchased modal here would be nice, but we have no idea what offer user purchased.
    // So, just adding an option and showing a success modal here.
    // Also confirm custom vote modal is unnecessary as the user literally just payed for it.

    if (!customOptionTextFromRedirect) {
      return;
    }

    try {
      const payload = new newnewapi.CreateCustomMcOptionRequest({
        postUuid: post.postUuid,
        optionText: customOptionTextFromRedirect,
      });

      const res = await createCustomOption(payload);

      if (
        !res.data ||
        res.data.status !==
          newnewapi.CreateCustomMcOptionResponse.Status.SUCCESS ||
        res.error
      ) {
        throw new Error(t(addOptionErrorMessage(res.data?.status)));
      }

      const optionFromResponse = (res.data
        .option as newnewapi.MultipleChoice.Option)!!;
      optionFromResponse.isSupportedByMe = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);
      setPaymentSuccessValue(1);
    } catch (err: any) {
      console.error(err);
      showErrorToastCustom(err.message);
    }

    resetBundleSetupIntentClientSecret();
  }, [
    customOptionTextFromRedirect,
    post.postUuid,
    handleAddOrUpdateOptionFromResponse,
    resetBundleSetupIntentClientSecret,
    showErrorToastCustom,
    t,
  ]);

  useBuyBundleAfterStripeRedirect(
    bundleStripeSetupIntentClientSecret,
    saveCard,
    onBundlePurchasedAfterRedirect
  );

  // Scroll block
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);

  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

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

  // Modal for new option
  const [suggestNewOptionModalOpen, setSuggestNewOptionModalOpen] =
    useState(false);
  // Payment modal
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [confirmCustomOptionModalOpen, setConfirmCustomOptionModalOpen] =
    useState(false);
  const [paymentSuccessValue, setPaymentSuccessValue] = useState<
    number | undefined
  >(undefined);

  // Bundle modal
  const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);

  // Handlers
  const validateTextAbortControllerRef = useRef<AbortController | undefined>();
  const validateTextViaAPI = useCallback(async (text: string) => {
    if (validateTextAbortControllerRef.current) {
      validateTextAbortControllerRef.current?.abort();
    }
    validateTextAbortControllerRef.current = new AbortController();
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateTextRequest({
        // NB! temp
        kind: newnewapi.ValidateTextRequest.Kind.POST_OPTION,
        text,
      });

      const res = await validateText(
        payload,
        validateTextAbortControllerRef?.current?.signal
      );

      if (!res.data?.status) throw new Error('An error occurred');

      if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
        setNewOptionTextValid(false);
      } else {
        setNewOptionTextValid(true);
      }

      setIsAPIValidateLoading(false);

      return res.data?.status === newnewapi.ValidateTextResponse.Status.OK;
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

  const handleSuggestNewOptionModalClosed = useCallback(() => {
    setNewOptionText('');
    setSuggestNewOptionModalOpen(false);
  }, []);

  const handleAddNewOption = useCallback(async () => {
    setConfirmCustomOptionModalOpen(false);
    setLoadingModalOpen(true);

    Mixpanel.track('Custom Option Used', {
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
        throw new Error(t(addOptionErrorMessage(res.data?.status)));
      }

      const optionFromResponse = (res.data
        .option as newnewapi.MultipleChoice.Option)!!;
      optionFromResponse.isSupportedByMe = true;
      handleAddOrUpdateOptionFromResponse(optionFromResponse);
      setPaymentSuccessValue(1);
    } catch (err: any) {
      console.error(err);
      showErrorToastCustom(err.message);
    } finally {
      handleSuggestNewOptionModalClosed();
      setLoadingModalOpen(false);
    }
  }, [
    post.postUuid,
    newOptionText,
    t,
    handleAddOrUpdateOptionFromResponse,
    handleSuggestNewOptionModalClosed,
    showErrorToastCustom,
  ]);

  const customOptionExists = useMemo(
    () => options.findIndex((option) => option.text === newOptionText) > -1,
    [newOptionText, options]
  );

  const handleAddOptionButtonClicked = useCallback(() => {
    if (canAddCustomOption) {
      setConfirmCustomOptionModalOpen(true);
    } else {
      if (customOptionExists) {
        return;
      }

      // Make sure user can add the option before selling a bundle
      validateTextViaAPI(newOptionText).then(() => {
        setBuyBundleModalOpen(true);
      });
    }
  }, [
    customOptionExists,
    canAddCustomOption,
    newOptionText,
    validateTextViaAPI,
  ]);

  const handleAddOptionButtonClickCaptured = useCallback(() => {
    Mixpanel.track('Click Add Custom Option', {
      _stage: 'Post',
      _postUuid: post.postUuid,
      _component: 'McOptionsTab',
    });
  }, [post.postUuid]);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

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

  const successPath = useMemo(
    () =>
      newOptionText && newOptionTextValid
        ? `/p/${post.postShortId}?custom_option_text=${encodeURIComponent(
            newOptionText
          )}`
        : `/p/${post.postShortId}`,
    [newOptionText, newOptionTextValid, post.postShortId]
  );

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
                    options.length >= 4
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
              postUuid={post.postUuid}
              postShortId={post.postShortId ?? ''}
              index={i}
              bundle={bundle}
              isCreatorsBid={
                !option.creator || option.creator?.uuid === post.creator?.uuid
              }
              noAction={postStatus === 'failed'}
              handleSetPaymentSuccessValue={(newValue: number) =>
                setPaymentSuccessValue(newValue)
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
          {hasNextPage ? (
            !isMobile ? (
              <SLoaderDiv ref={loadingRef} />
            ) : (
              <SLoadMoreBtn
                onClick={() => {
                  Mixpanel.track('Click Load More', {
                    _stage: 'Post',
                    _postUuid: post.postUuid,
                    _component: 'McOptionsTab',
                  });
                  fetchNextPage();
                }}
              >
                {t('loadMoreButton')}
              </SLoadMoreBtn>
            )
          ) : null}
        </SBidsContainer>
        {user.userTutorialsProgress.remainingMcSteps &&
          postStatus === 'voting' && (
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
      {/* Suggest new form */}
      {!optionCreatedByMe &&
        postStatus === 'voting' &&
        (post.creator?.options?.isOfferingBundles || bundle) && (
          <SActionSection>
            <SAddOptionButtonDesktop
              id='add-option-button'
              onClickCapture={() => {
                Mixpanel.track('Click Add Own Option Button', {
                  _stage: 'Post',
                  _postUuid: post.postUuid,
                  _component: 'McOptionsTab',
                });
              }}
              onClick={() => setSuggestNewOptionModalOpen(true)}
            >
              <InlineSvg
                svg={AddOptionIcon}
                width='24px'
                height='24px'
                fill='none'
              />
              {t('mcPost.optionsTab.actionSection.suggestionPlaceholder')}
            </SAddOptionButtonDesktop>
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
      {/* Suggest new Modal */}
      {!optionCreatedByMe &&
      postStatus === 'voting' &&
      (post.creator?.options?.isOfferingBundles || bundle) ? (
        isMobile ? (
          <OptionActionMobileModal
            show={suggestNewOptionModalOpen}
            modalType={confirmCustomOptionModalOpen ? 'covered' : 'initial'}
            onClose={handleSuggestNewOptionModalClosed}
            zIndex={12}
          >
            <SSuggestNewContainer>
              <SuggestionTextArea
                value={newOptionText}
                autofocus={suggestNewOptionModalOpen}
                placeholder={t(
                  'mcPost.optionsTab.actionSection.suggestionPlaceholderDesktop'
                )}
                onChange={handleUpdateNewOptionText}
              />
              <SAddOptionButton
                size='sm'
                disabled={
                  !newOptionText || !newOptionTextValid || customOptionExists
                }
                style={{
                  ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
                }}
                onClick={handleAddOptionButtonClicked}
                onClickCapture={handleAddOptionButtonClickCaptured}
              >
                {t('mcPost.optionsTab.actionSection.placeABidButton')}
              </SAddOptionButton>
            </SSuggestNewContainer>
          </OptionActionMobileModal>
        ) : (
          <Modal
            show={suggestNewOptionModalOpen}
            modalType={confirmCustomOptionModalOpen ? 'covered' : 'initial'}
            onClose={handleSuggestNewOptionModalClosed}
            additionalz={12}
          >
            <SSuggestNewContainer>
              <SCloseButton onClick={handleSuggestNewOptionModalClosed}>
                <InlineSvg
                  svg={CloseIcon}
                  fill={theme.colorsThemed.text.primary}
                  width='24px'
                  height='24px'
                />
              </SCloseButton>
              <SHeadlineSuggestNew variant={5}>
                {t('mcPost.optionsTab.actionSection.suggestionPlaceholder')}
              </SHeadlineSuggestNew>
              <SuggestionTextArea
                id='add-option-input'
                value={newOptionText}
                autofocus={suggestNewOptionModalOpen}
                placeholder={t(
                  'mcPost.optionsTab.actionSection.suggestionPlaceholder'
                )}
                onChange={handleUpdateNewOptionText}
              />
              <SAddOptionButton
                id='add-option-submit'
                size='sm'
                disabled={
                  !newOptionText || !newOptionTextValid || customOptionExists
                }
                style={{
                  ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
                }}
                onClick={handleAddOptionButtonClicked}
                onClickCapture={handleAddOptionButtonClickCaptured}
              >
                {t('mcPost.optionsTab.optionCard.placeABidButton')}
              </SAddOptionButton>
            </SSuggestNewContainer>
          </Modal>
        )
      ) : null}
      {/* Add a custom option Modal */}
      <McConfirmCustomOptionModal
        show={confirmCustomOptionModalOpen}
        modalType='following'
        handleAddCustomOption={handleAddNewOption}
        closeModal={() => setConfirmCustomOptionModalOpen(false)}
      />
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* Payment success Modal */}
      <PaymentSuccessModal
        postType='mc'
        show={paymentSuccessValue !== undefined}
        value={paymentSuccessValue}
        modalType='following'
        closeModal={() => {
          setPaymentSuccessValue(undefined);
          promptUserWithPushNotificationsPermissionModal();
        }}
      >
        {t('paymentSuccessModal.mc', {
          postCreator: postCreatorName,
          postDeadline,
        })}
      </PaymentSuccessModal>
      {/* Mobile floating button */}
      {isMobile &&
      !suggestNewOptionModalOpen &&
      !optionCreatedByMe &&
      postStatus === 'voting' &&
      (post.creator?.options?.isOfferingBundles || bundle) ? (
        <>
          <SActionButton
            id='action-button-mobile'
            view='primaryGrad'
            onClick={() => setSuggestNewOptionModalOpen(true)}
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
          modalType='following'
          creator={post.creator}
          successPath={successPath}
          additionalZ={13}
          onSuccess={() => {
            if (newOptionText && newOptionTextValid) {
              handleAddNewOption();
            }
          }}
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

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: calc(50% - 160px);
    left: calc(50% - 220px);
    width: 440px;

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
    padding: 72px 40px 40px 40px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;

const SHeadlineSuggestNew = styled(Headline)`
  text-align: center;
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
  }
`;

const SCloseButton = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  cursor: pointer;
`;

const SAddOptionButtonDesktop = styled.button`
  width: 100%;
  height: 84px;
  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  cursor: pointer;
  transition: 0.1s linear;

  &:hover:enabled,
  &:focus:enabled,
  &:active:enabled {
    outline: none;
  }

  &:hover:enabled,
  &:focus:enabled {
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 25%;
  bottom: 110%;
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
