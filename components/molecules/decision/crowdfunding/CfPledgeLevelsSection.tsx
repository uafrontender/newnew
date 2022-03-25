/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../../redux-store/store';
import { doPledgeWithWallet } from '../../../../api/endpoints/crowdfunding';
import { createPaymentSession, getTopUpWalletWithPaymentPurposeUrl } from '../../../../api/endpoints/payments';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import CfMakeCustomPledgeCard from './CfMakeCustomPledgeCard';
import CfMakeStandardPledgeCard from './CfMakeStandardPledgeCard';
import LoadingModal from '../../LoadingModal';
import PaymentModal from '../../checkout/PaymentModal';
import useScrollGradientsHorizontal from '../../../../utils/hooks/useScrollGradientsHorizontal';
import GradientMaskHorizontal from '../../../atoms/GradientMaskHorizontal';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';

interface ICfPledgeLevelsSection {
  pledgeLevels: newnewapi.IMoneyAmount[];
  post: newnewapi.Crowdfunding;
  handleSetPaymentSuccesModalOpen: (newValue: boolean) => void;
  handleAddPledgeFromResponse: (newPledge: newnewapi.Crowdfunding.Pledge) => void;
}

const CfPledgeLevelsSection: React.FunctionComponent<ICfPledgeLevelsSection> = ({
  pledgeLevels,
  post,
  handleSetPaymentSuccesModalOpen,
  handleAddPledgeFromResponse,
}) => {
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);

  const containerRef = useRef<HTMLDivElement>();

  const buttonsContainerRef = useRef<HTMLDivElement>();
  const { showLeftGradient, showRightGradient } = useScrollGradientsHorizontal(buttonsContainerRef);

  const [pledgeAmount, setPledgeAmount] = useState<number | undefined>(undefined);

  const [customPledgeAmount, setCustomPledgeAmount] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Handlers
  const handleSetPledgeAmountAndOpenPaymentModal = useCallback((amount: number) => {
    setPledgeAmount(amount);
    setPaymentModalOpen(true);
  }, [
    setPledgeAmount,
  ]);

  const handleCustomPledgePaymentModal = useCallback(() => {
    setPledgeAmount(parseInt(customPledgeAmount, 10) * 100);
    setPaymentModalOpen(true);
  }, [
    customPledgeAmount,
  ])

  const handleOpenCustomPledgeForm = () => setIsFormOpen(true);

  const handleCloseCustomPledgeForm = () => {
    setCustomPledgeAmount('');
    setIsFormOpen(false);
  }

  // Make a pledge and close all forms and modals
  const handlePayWithWallet = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      // Check if user is logged in
      if (!user.loggedIn) {
        const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
          successUrl: `${window.location.href.split('#')[0]}&`,
          cancelUrl: `${window.location.href.split('#')[0]}&`,
          ...(!user.loggedIn ? {
            nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
          } : {}),
          cfPledgeRequest: {
            amount: new newnewapi.MoneyAmount({
              usdCents: parseInt(pledgeAmount?.toString()!!, 10),
            }),
            postUuid: post.postUuid,
          }
        });

        const res = await getTopUpWalletWithPaymentPurposeUrl(getTopUpWalletWithPaymentPurposeUrlPayload);

        if (!res.data
          || !res.data.sessionUrl
          || res.error
        ) throw new Error(res.error?.message ?? 'Request failed');

        window.location.href = res.data.sessionUrl;
      } else {
        const makePledgePayload = new newnewapi.DoPledgeRequest({
          amount: new newnewapi.MoneyAmount({
            usdCents: parseInt(pledgeAmount?.toString()!!, 10),
          }),
          postUuid: post.postUuid,
        });

        const res = await doPledgeWithWallet(makePledgePayload);

        if (res.data && res.data.status === newnewapi.DoPledgeResponse.Status.INSUFFICIENT_WALLET_BALANCE) {
          const getTopUpWalletWithPaymentPurposeUrlPayload = new newnewapi.TopUpWalletWithPurposeRequest({
            successUrl: `${window.location.href.split('#')[0]}&`,
            cancelUrl: `${window.location.href.split('#')[0]}&`,
            cfPledgeRequest: {
              amount: new newnewapi.MoneyAmount({
                usdCents: parseInt(pledgeAmount?.toString()!!, 10),
              }),
              postUuid: post.postUuid,
            }
          });

          const resStripeRedirect = await getTopUpWalletWithPaymentPurposeUrl(getTopUpWalletWithPaymentPurposeUrlPayload);

          if (!resStripeRedirect.data
            || !resStripeRedirect.data.sessionUrl
            || resStripeRedirect.error
          ) throw new Error(resStripeRedirect.error?.message ?? 'Request failed');

          window.location.href = resStripeRedirect.data.sessionUrl;
          return;
        }

        if (!res.data
          || res.data.status !== newnewapi.DoPledgeResponse.Status.SUCCESS
          || res.error
        ) throw new Error(res.error?.message ?? 'Request failed');

        setIsFormOpen(false);
        setCustomPledgeAmount('');
        handleAddPledgeFromResponse(res.data.pledge as newnewapi.Crowdfunding.Pledge);

        setCustomPledgeAmount('');
        setIsFormOpen(false);
        setPaymentModalOpen(false);
        setLoadingModalOpen(false);
        handleSetPaymentSuccesModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
    }
  }, [
    pledgeAmount,
    post.postUuid,
    user.loggedIn,
    handleAddPledgeFromResponse,
    handleSetPaymentSuccesModalOpen,
  ]);

  const handlePayWithCardStripeRedirect = useCallback(async () => {
    setLoadingModalOpen(true);
    try {
      const createPaymentSessionPayload = new newnewapi.CreatePaymentSessionRequest({
        successUrl: `${window.location.href.split('#')[0]}&`,
        cancelUrl: `${window.location.href.split('#')[0]}&`,
        ...(!user.loggedIn ? {
          nonAuthenticatedSignUpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment`,
        } : {}),
        cfPledgeRequest: {
          amount: new newnewapi.MoneyAmount({
            usdCents: parseInt(pledgeAmount?.toString()!!, 10),
          }),
          postUuid: post.postUuid,
        }
      });

      const res = await createPaymentSession(createPaymentSessionPayload);

      if (!res.data
        || !res.data.sessionUrl
        || res.error
      ) throw new Error(res.error?.message ?? 'Request failed');

      window.location.href = res.data.sessionUrl;
    } catch (err) {
      console.error(err);
      setPaymentModalOpen(false);
      setLoadingModalOpen(false);
    }
  }, [
    user.loggedIn,
    pledgeAmount,
    post.postUuid,
  ]);

  useEffect(() => {
    if (!paymentModalOpen) setPledgeAmount(undefined);
  }, [paymentModalOpen]);

  return (
    <>
      <SSectionContainer
        ref={(el) => {
          // eslint-disable-next-line no-param-reassign
          containerRef.current = el!!;
        }}
      >
        <SInfoSubsection>
          <STitle
            variant={2}
            weight={600}
          >
            { t('CfPost.BackersTab.info.title') }
          </STitle>
          <SCaption
            variant={3}
          >
            { t('CfPost.BackersTab.info.caption') }
          </SCaption>
        </SInfoSubsection>
        {isFormOpen ? (
          <SNewPledgeForm>
            <BidAmountTextInput
              value={customPledgeAmount}
              minAmount={1}
              inputAlign="left"
              style={{
                padding: '12.5px 16px',
                width: '100%',
              }}
              onChange={(newValue: string) => setCustomPledgeAmount(newValue)}
            />
            <Button
              size="sm"
              view="primaryGrad"
              disabled={customPledgeAmount === ''}
              onClick={() => handleCustomPledgePaymentModal()}
            >
              { t('CfPost.BackersTab.CustomPledge.pledgeBtn') }
            </Button>
            <SCancelButton
              view="secondary"
              onClick={() => handleCloseCustomPledgeForm()}
            >
              { t('CfPost.BackersTab.CustomPledge.cancelBtn') }
            </SCancelButton>
          </SNewPledgeForm>
        ) : (
          <SButtonsContainer
            ref={(el) => {
              buttonsContainerRef.current = el!!;
            }}
            numItems={1 + pledgeLevels.length}
          >
            {pledgeLevels.map((pledgeLevel, i, arr) => (
              <CfMakeStandardPledgeCard
                amount={pledgeLevel}
                grandsVipStatus={i === arr.length - 1}
                handleOpenMakePledgeForm={() => {
                  handleSetPledgeAmountAndOpenPaymentModal(pledgeLevel.usdCents!!);
                }}
              />
            ))}
            <CfMakeCustomPledgeCard
              handleOpenMakePledgeForm={handleOpenCustomPledgeForm}
            />
            <GradientMaskHorizontal
              gradientType="secondary"
              height={`${buttonsContainerRef.current?.getBoundingClientRect().height}px`}
              positionBottom="0px"
              positionLeft="0px"
              active={showLeftGradient}
            />
            <GradientMaskHorizontal
              gradientType="secondary"
              height={`${buttonsContainerRef.current?.getBoundingClientRect().height}px`}
              positionBottom="0px"
              positionRight="0px"
              active={showRightGradient}
            />
          </SButtonsContainer>
        )}
      </SSectionContainer>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={12}
          amount={`$${(pledgeAmount!! / 100)?.toFixed(0)}`}
          showTocApply
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCardStripeRedirect}
          handlePayWithWallet={handlePayWithWallet}
        >
          <SPaymentModalHeader>
            <SPaymentModalTitle
              variant={3}
            >
              { t('CfPost.paymenModalHeader.subtitle') }
            </SPaymentModalTitle>
            <SPaymentModalOptionText>
              { post.title }
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null }
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </>
  );
};

export default CfPledgeLevelsSection;

const SSectionContainer = styled.div`
  position: relative;

  max-width: 520px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const SInfoSubsection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  width: 100%;

  margin-bottom: 12px;
`;

const STitle = styled(Text)`

`;

const SCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SButtonsContainer = styled.div<{
  numItems: number;
}>`
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  gap: 12px;

  width: 400px;

  overflow-x: auto;


  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  z-index: 10;

  @media (min-width: 800px) {
    width: 480px;
  }

  @media (min-width: 860px) {
    width: 540px;
  }

  @media (min-width: 960px) {
    width: 600px;
  }

  @media (min-width: 960px) {
    width: 650px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 100%;
  }
`;

// Custom pledge form
const SNewPledgeForm = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  height: 108px;

  div:first-child {
    width: 100%;
  }
`;

const SCancelButton = styled(Button)`
  width: auto;

  padding: 0px 12px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  &:hover:enabled, &:focus:enabled {
    background: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

// Payment modal header
const SPaymentModalHeader = styled.div`

`;

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  margin-bottom: 6px;
`;

const SPaymentModalOptionText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
