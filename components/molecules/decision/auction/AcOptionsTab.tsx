/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useInView } from 'react-intersection-observer';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { WalletContext } from '../../../../contexts/walletContext';
import { placeBidWithWallet } from '../../../../api/endpoints/auction';
import {
  createPaymentSession,
  getTopUpWalletWithPaymentPurposeUrl,
} from '../../../../api/endpoints/payments';
import { validateText } from '../../../../api/endpoints/infrastructure';

import { TAcOptionWithHighestField } from '../../../organisms/decision/PostViewAC';
import { TPostStatusStringified } from '../../../../utils/switchPostStatus';
import useScrollGradients from '../../../../utils/hooks/useScrollGradients';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import AcOptionCard from './AcOptionCard';
import SuggestionTextArea from '../../../atoms/decision/SuggestionTextArea';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import GradientMask from '../../../atoms/GradientMask';
import OptionActionMobileModal from '../OptionActionMobileModal';

import NoContentYetImg from '../../../../public/images/decision/no-content-yet-mock.png';
import MakeFirstBidArrow from '../../../../public/images/svg/icons/filled/MakeFirstBidArrow.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import PaymentSuccessModal from '../PaymentSuccessModal';
import TutorialTooltip, {
  DotPositionEnum,
} from '../../../atoms/decision/TutorialTooltip';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import { setTutorialStatus } from '../../../../api/endpoints/user';

interface IAcOptionsTab {
  postId: string;
  postCreator: string;
  postDeadline: string;
  postStatus: TPostStatusStringified;
  options: newnewapi.Auction.Option[];
  // optionToAnimate?: string;
  optionsLoading: boolean;
  pagingToken: string | undefined | null;
  minAmount: number;
  handleLoadBids: (token?: string) => void;
  handleAddOrUpdateOptionFromResponse: (
    newOption: newnewapi.Auction.Option
  ) => void;
}

const AcOptionsTab: React.FunctionComponent<IAcOptionsTab> = ({
  postId,
  postCreator,
  postDeadline,
  postStatus,
  options,
  // optionToAnimate,
  optionsLoading,
  pagingToken,
  minAmount,
  handleLoadBids,
  handleAddOrUpdateOptionFromResponse,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isTablet = ['tablet'].includes(resizeMode);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { walletBalance } = useContext(WalletContext);

  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>();
  const { showTopGradient, showBottomGradient } =
    useScrollGradients(containerRef);

  const [heightDelta, setHeightDelta] = useState(
    postStatus === 'voting' ? 56 : 0
  );
  const gradientMaskBottomPosition = useMemo(
    () => (isTablet ? heightDelta - 12 : heightDelta),
    [heightDelta, isTablet]
  );

  const actionSectionContainer = useRef<HTMLDivElement>();

  const mainContainer = useRef<HTMLDivElement>();

  const [optionBeingSupported, setOptionBeingSupported] = useState<string>('');

  // New option/bid
  const [newBidText, setNewBidText] = useState('');
  const [newBidTextValid, setNewBidTextValid] = useState(true);
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);
  const [newBidAmount, setNewBidAmount] = useState('');
  // Mobile modal for new option
  const [suggestNewMobileOpen, setSuggestNewMobileOpen] = useState(false);
  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccesModalOpen, setPaymentSuccesModalOpen] = useState(false);

  const goToNextStep = () => {
    if (user.loggedIn) {
      const payload = new newnewapi.SetTutorialStatusRequest({
        acCurrentStep: user.userTutorialsProgress.remainingAcSteps!![1],
      });
      setTutorialStatus(payload);
    }
    dispatch(
      setUserTutorialsProgress({
        remainingAcSteps: [
          ...user.userTutorialsProgress.remainingAcSteps!!,
        ].slice(1),
      })
    );
  };

  // Handlers
  const handleTogglePaymentModalOpen = () => {
    if (isAPIValidateLoading) return;
    setPaymentModalOpen(true);
  };

  const validateTextViaAPI = useCallback(async (text: string) => {
    setIsAPIValidateLoading(true);
    try {
      const payload = new newnewapi.ValidateTextRequest({
        // NB! temp
        kind: newnewapi.ValidateTextRequest.Kind.POST_OPTION,
        text,
      });

      const res = await validateText(payload);

      if (!res.data?.status) throw new Error('An error occured');

      if (res.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
        setNewBidTextValid(false);
      } else {
        setNewBidTextValid(true);
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
      setNewBidText(e.target.value);

      if (e.target.value.length > 0) {
        validateTextViaAPIDebounced(e.target.value);
      }
    },
    [setNewBidText, validateTextViaAPIDebounced]
  );

  const handleSubmitNewOptionWallet = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      // Check if user is logged and if the wallet balance is sufficient
      if (
        !user.loggedIn ||
        (walletBalance &&
          walletBalance?.usdCents < parseInt(newBidAmount) * 100)
      ) {
        const getTopUpWalletWithPaymentPurposeUrlPayload =
          new newnewapi.TopUpWalletWithPurposeRequest({
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
              router.locale !== 'en-US' ? `${router.locale}/` : ''
            }post/${postId}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
              router.locale !== 'en-US' ? `${router.locale}/` : ''
            }post/${postId}`,
            ...(!user.loggedIn
              ? {
                  nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
                }
              : {}),
            acBidRequest: {
              amount: new newnewapi.MoneyAmount({
                usdCents: parseInt(newBidAmount) * 100,
              }),
              optionTitle: newBidText,
              postUuid: postId,
            },
          });

        const res = await getTopUpWalletWithPaymentPurposeUrl(
          getTopUpWalletWithPaymentPurposeUrlPayload
        );

        if (!res.data || !res.data.sessionUrl || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        window.location.href = res.data.sessionUrl;
      } else {
        const makeBidPayload = new newnewapi.PlaceBidRequest({
          amount: new newnewapi.MoneyAmount({
            usdCents: parseInt(newBidAmount) * 100,
          }),
          optionTitle: newBidText,
          postUuid: postId,
        });

        const res = await placeBidWithWallet(makeBidPayload);

        // Additional handler if balance turned out to be insufficient
        if (
          res.data &&
          res.data.status ===
            newnewapi.PlaceBidResponse.Status.INSUFFICIENT_WALLET_BALANCE
        ) {
          const getTopUpWalletWithPaymentPurposeUrlPayload =
            new newnewapi.TopUpWalletWithPurposeRequest({
              successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
                router.locale !== 'en-US' ? `${router.locale}/` : ''
              }post/${postId}`,
              cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
                router.locale !== 'en-US' ? `${router.locale}/` : ''
              }post/${postId}`,
              acBidRequest: {
                amount: new newnewapi.MoneyAmount({
                  usdCents: parseInt(newBidAmount) * 100,
                }),
                optionTitle: newBidText,
                postUuid: postId,
              },
            });

          const resStripeRedirect = await getTopUpWalletWithPaymentPurposeUrl(
            getTopUpWalletWithPaymentPurposeUrlPayload
          );

          if (
            !resStripeRedirect.data ||
            !resStripeRedirect.data.sessionUrl ||
            resStripeRedirect.error
          )
            throw new Error(
              resStripeRedirect.error?.message ?? 'Request failed'
            );

          window.location.href = resStripeRedirect.data.sessionUrl;
          return;
        }

        if (
          !res.data ||
          res.data.status !== newnewapi.PlaceBidResponse.Status.SUCCESS ||
          res.error
        )
          throw new Error(res.error?.message ?? 'Request failed');

        const optionFromResponse = (res.data
          .option as newnewapi.Auction.Option)!!;
        optionFromResponse.isSupportedByMe = true;
        handleAddOrUpdateOptionFromResponse(optionFromResponse);

        setNewBidAmount('');
        setNewBidText('');
        setSuggestNewMobileOpen(false);
        setPaymentModalOpen(false);
        setLoadingModalOpen(false);
        setPaymentSuccesModalOpen(true);
      }
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [
    newBidAmount,
    newBidText,
    postId,
    user,
    walletBalance,
    router.locale,
    handleAddOrUpdateOptionFromResponse,
  ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const createPaymentSessionPayload =
        new newnewapi.CreatePaymentSessionRequest({
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
            router.locale !== 'en-US' ? `${router.locale}/` : ''
          }post/${postId}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${
            router.locale !== 'en-US' ? `${router.locale}/` : ''
          }post/${postId}`,
          ...(!user.loggedIn
            ? {
                nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
              }
            : {}),
          acBidRequest: {
            amount: new newnewapi.MoneyAmount({
              usdCents: parseInt(newBidAmount) * 100,
            }),
            optionTitle: newBidText,
            postUuid: postId,
          },
        });

      const res = await createPaymentSession(createPaymentSessionPayload);

      if (!res.data || !res.data.sessionUrl || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      window.location.href = res.data.sessionUrl;
    } catch (err) {
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
      console.error(err);
    }
  }, [user.loggedIn, router.locale, newBidAmount, newBidText, postId]);

  useEffect(() => {
    if (inView && !optionsLoading && pagingToken) {
      handleLoadBids(pagingToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, optionsLoading]);

  useEffect(() => {
    if (optionBeingSupported && containerRef.current && !isMobile) {
      let optIdx = options.findIndex(
        (o) => o.id.toString() === optionBeingSupported
      );
      optIdx += 2;
      const childDiv = containerRef.current.children[optIdx];

      const childRect = childDiv.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();

      const scrollBy = childRect.top - parentRect.top;

      containerRef.current.scrollBy({
        top: scrollBy,
      });
    }
  }, [options, optionBeingSupported, isMobile]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entry: any) => {
      const size = entry[0]?.borderBoxSize
        ? entry[0]?.borderBoxSize[0]?.blockSize
        : entry[0]?.contentRect.height;
      if (size) {
        setHeightDelta(size);
      }
    });

    if (actionSectionContainer.current) {
      resizeObserver.observe(actionSectionContainer.current!!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <STabContainer
        key="bids"
        ref={(el) => {
          mainContainer.current = el!!;
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {options.length === 0 && !optionsLoading && postStatus !== 'failed' ? (
          <SNoOptionsYet>
            <SNoOptionsImgContainer>
              <img src={NoContentYetImg.src} alt="No content yet" />
            </SNoOptionsImgContainer>
            <SNoOptionsCaption variant={3}>
              {t('AcPost.OptionsTab.NoOptions.caption_1')}
            </SNoOptionsCaption>
            <SNoOptionsCaption variant={3}>
              {t('AcPost.OptionsTab.NoOptions.caption_2')}
            </SNoOptionsCaption>
            {!isMobile && (
              <SMakeBidArrowSvg
                svg={MakeFirstBidArrow}
                fill={theme.colorsThemed.background.quinary}
                width="36px"
              />
            )}
          </SNoOptionsYet>
        ) : null}
        <SBidsContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
          heightDelta={heightDelta}
        >
          {!isMobile ? (
            <>
              <GradientMask
                gradientType="secondary"
                positionTop
                active={showTopGradient}
              />
              <GradientMask
                gradientType="secondary"
                positionBottom={gradientMaskBottomPosition}
                active={showBottomGradient}
              />
            </>
          ) : null}
          {options.map((option, i) => (
            <AcOptionCard
              key={option.id.toString()}
              option={option as TAcOptionWithHighestField}
              // shouldAnimate={optionToAnimate === option.id.toString()}
              postId={postId}
              postCreator={postCreator}
              postDeadline={postDeadline}
              index={i}
              minAmount={minAmount}
              votingAllowed={postStatus === 'voting'}
              optionBeingSupported={optionBeingSupported}
              handleSetSupportedBid={(id: string) =>
                setOptionBeingSupported(id)
              }
              handleAddOrUpdateOptionFromResponse={
                handleAddOrUpdateOptionFromResponse
              }
            />
          ))}
          {!isMobile ? (
            <SLoaderDiv ref={loadingRef} />
          ) : pagingToken ? (
            <SLoadMoreBtn
              view="secondary"
              onClick={() => handleLoadBids(pagingToken)}
            >
              {t('loadMoreBtn')}
            </SLoadMoreBtn>
          ) : null}
        </SBidsContainer>
        {postStatus === 'voting' && (
          <SActionSection
            ref={(el) => {
              actionSectionContainer.current = el!!;
            }}
          >
            <SuggestionTextArea
              value={newBidText}
              disabled={optionBeingSupported !== ''}
              placeholder={t(
                'AcPost.OptionsTab.ActionSection.suggestionPlaceholder-desktop',
                { username: postCreator }
              )}
              onChange={handleUpdateNewOptionText}
            />
            <BidAmountTextInput
              value={newBidAmount}
              inputAlign="center"
              disabled={optionBeingSupported !== ''}
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              minAmount={minAmount}
              placeholder={t(
                'AcPost.OptionsTab.ActionSection.amountPlaceholder-desktop',
                { amount: minAmount.toString() }
              )}
              style={{
                width: '60px',
              }}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={
                !newBidText ||
                !newBidAmount ||
                parseInt(newBidAmount) < minAmount ||
                optionBeingSupported !== '' ||
                !newBidTextValid
              }
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              {t('AcPost.OptionsTab.ActionSection.placeABidBtn')}
            </Button>
            <STutorialTooltipTextAreaHolder>
              <TutorialTooltip
                isTooltipVisible={
                  user!!.userTutorialsProgress.remainingAcSteps!![0] ===
                  newnewapi.AcTutorialStep.AC_TEXT_FIELD
                }
                closeTooltip={goToNextStep}
                title={t('tutorials.ac.createYourBid.title')}
                text={t('tutorials.ac.createYourBid.text')}
                dotPosition={DotPositionEnum.BottomRight}
              />
            </STutorialTooltipTextAreaHolder>
          </SActionSection>
        )}
        <STutorialTooltipHolder>
          <TutorialTooltip
            isTooltipVisible={
              user!!.userTutorialsProgress.remainingAcSteps!![0] ===
              newnewapi.AcTutorialStep.AC_ALL_BIDS
            }
            closeTooltip={goToNextStep}
            title={t('tutorials.ac.peopleBids.title')}
            text={t('tutorials.ac.peopleBids.text')}
            dotPosition={DotPositionEnum.BottomLeft}
          />
        </STutorialTooltipHolder>
      </STabContainer>
      {/* Suggest new Modal */}
      {isMobile && postStatus === 'voting' ? (
        <OptionActionMobileModal
          isOpen={suggestNewMobileOpen}
          onClose={() => setSuggestNewMobileOpen(false)}
          zIndex={12}
        >
          <SSuggestNewContainer>
            <SuggestionTextArea
              value={newBidText}
              disabled={optionBeingSupported !== ''}
              autofocus={suggestNewMobileOpen}
              placeholder={t(
                'AcPost.OptionsTab.ActionSection.suggestionPlaceholder'
              )}
              onChange={handleUpdateNewOptionText}
            />
            <BidAmountTextInput
              value={newBidAmount}
              inputAlign="left"
              disabled={optionBeingSupported !== ''}
              style={{
                textAlign: 'center',
                paddingLeft: '12px',
              }}
              onChange={(newValue: string) => setNewBidAmount(newValue)}
              minAmount={minAmount}
            />
            <Button
              view="primaryGrad"
              size="sm"
              disabled={
                !newBidText ||
                !newBidAmount ||
                parseInt(newBidAmount) < minAmount ||
                optionBeingSupported !== '' ||
                !newBidTextValid
              }
              style={{
                ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
              }}
              onClick={() => handleTogglePaymentModalOpen()}
            >
              {t('AcPost.OptionsTab.ActionSection.placeABidBtn')}
            </Button>
          </SSuggestNewContainer>
        </OptionActionMobileModal>
      ) : null}
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={`$${newBidAmount}`}
          showTocApply={!user?.loggedIn}
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
          handlePayWithWallet={handleSubmitNewOptionWallet}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle variant={3}>
              {t('AcPost.paymenModalHeader.subtitle')}
            </SPaymentModalTitle>
            <SPaymentModalOptionText>{newBidText}</SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null}
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* Payment success Modal */}
      <PaymentSuccessModal
        isVisible={paymentSuccesModalOpen}
        closeModal={() => setPaymentSuccesModalOpen(false)}
      >
        {t('PaymentSuccessModal.ac', {
          postCreator,
          postDeadline,
        })}
      </PaymentSuccessModal>
      {/* Mobile floating button */}
      {isMobile && !suggestNewMobileOpen && postStatus === 'voting' ? (
        <>
          <SActionButton
            view="primaryGrad"
            onClick={() => setSuggestNewMobileOpen(true)}
          >
            {t('AcPost.FloatingActionButton.suggestNewBtn')}
          </SActionButton>
          <STutorialTooltipHolderMobile>
            <TutorialTooltip
              isTooltipVisible={
                user!!.userTutorialsProgress.remainingAcSteps!![0] ===
                newnewapi.AcTutorialStep.AC_TEXT_FIELD
              }
              closeTooltip={goToNextStep}
              title={t('tutorials.ac.createYourBid.title')}
              text={t('tutorials.ac.createYourBid.text')}
              dotPosition={DotPositionEnum.BottomRight}
            />
          </STutorialTooltipHolderMobile>
        </>
      ) : null}
    </>
  );
};

AcOptionsTab.defaultProps = {
  // optionToAnimate: undefined,
};

export default AcOptionsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 56px);
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
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px + 10px)`};

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

  ${({ theme }) => theme.media.laptop} {
    height: ${({ heightDelta }) => `calc(100% - ${heightDelta}px)`};
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

    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

    border-top: 1.5px solid
      ${({ theme }) => theme.colorsThemed.background.outlines1};

    textarea {
      width: 75% !important;
    }

    div {
      width: 20%;

      input {
        width: 100% !important;
      }
    }

    button {
      width: 100%;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    /* flex-wrap: nowrap; */
    /* justify-content: initial; */

    textarea {
      /* width: 277px; */
    }
  }
`;

// Payment modal header
const SPaymentModalHeader = styled.div``;

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalOptionText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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
  position: absolute;

  top: 100px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  img {
    position: relative;
    top: -24px;
    display: block;
    width: 100%;
    height: 100%;
  }

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    position: initial;
  }
`;

const SNoOptionsCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SMakeBidArrowSvg = styled(InlineSvg)`
  position: absolute;
  left: 26%;
  bottom: -58px;
`;

const STutorialTooltipHolder = styled.div`
  position: absolute;
  left: 60px;
  bottom: 97%;
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
