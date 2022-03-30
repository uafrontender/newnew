/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../../redux-store/store';
import { doPledgeWithWallet } from '../../../../api/endpoints/crowdfunding';
import { createPaymentSession, getTopUpWalletWithPaymentPurposeUrl } from '../../../../api/endpoints/payments';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Modal from '../../../organisms/Modal';
import LoadingModal from '../../LoadingModal';
import InlineSvg from '../../../atoms/InlineSVG';
import PaymentModal from '../../checkout/PaymentModal';
import OptionActionMobileModal from '../OptionActionMobileModal';
import BidAmountTextInput from '../../../atoms/decision/BidAmountTextInput';

import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';

interface ICfPledgeLevelsModal {
  zIndex: number;
  isOpen: boolean;
  post: newnewapi.Crowdfunding;
  pledgeLevels: newnewapi.IMoneyAmount[];
  onClose: () => void;
  handleSetPaymentSuccesModalOpen: (newValue: boolean) => void;
  handleAddPledgeFromResponse: (newPledge: newnewapi.Crowdfunding.Pledge) => void;
}

const CfPledgeLevelsModal: React.FunctionComponent<ICfPledgeLevelsModal> = ({
  post,
  zIndex,
  isOpen,
  pledgeLevels,
  onClose,
  handleSetPaymentSuccesModalOpen,
  handleAddPledgeFromResponse,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);

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
        onClose();
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
    onClose,
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
      <Modal
        additionalZ={zIndex}
        show={isOpen}
        onClose={() => onClose()}
      >
        <SWrapper>
          <SContentContainer
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {pledgeLevels.map((p, i, arr) => (
              <>
                <SItem
                  key={i}
                  onClick={() => {
                    handleSetPledgeAmountAndOpenPaymentModal(p.usdCents!!);
                  }}
                >
                  <SText>
                    {`$${(p.usdCents!! / 100).toFixed(0)}`}
                  </SText>
                  {i === arr.length - 1 ? (
                      <SAdditionalLabel>
                        { t('CfPost.BackersTab.free_sub') }
                      </SAdditionalLabel>
                  ) : null}
                </SItem>
                <SSeparator />
              </>
            ))}
            <SItem
              onClick={() => {
                handleOpenCustomPledgeForm();
              }}
            >
              <SText>
                { t('CfPost.BackersTab.custom') }
              </SText>
            </SItem>
          </SContentContainer>
          <Button
            view="secondary"
            style={{
              height: '56px',
              width: 'calc(100% - 32px)',
            }}
          >
            { t('CfPost.BackersTab.cancel') }
          </Button>
        </SWrapper>
      </Modal>
      {/* Custom pledge modal */}
      <OptionActionMobileModal
        isOpen={isFormOpen}
        onClose={() => handleCloseCustomPledgeForm()}
        zIndex={12}
      >
        <SCustomPledgeMobileContainer>
          <div
            style={{
              position: 'relative',
            }}
          >
            { t('CfPost.BackersTab.CustomPledge.pledgeBtn') }
            <SCloseButton onClick={() => handleCloseCustomPledgeForm()}>
              <InlineSvg svg={CancelIcon} fill={theme.colorsThemed.text.primary} width="24px" height="24px" />
            </SCloseButton>
          </div>
          <BidAmountTextInput
            value={customPledgeAmount}
            inputAlign="center"
            autofocus={isFormOpen}
            minAmount={1}
            style={{
              textAlign: 'center',
              paddingLeft: '12px',
            }}
            onChange={(newValue: string) => setCustomPledgeAmount(newValue)}
          />
          <Button
            view="primaryGrad"
            size="sm"
            disabled={customPledgeAmount === ''}
            onClick={() => handleCustomPledgePaymentModal()}
          >
            { t('CfPost.BackersTab.CustomPledge.continue') }
          </Button>
          <SCaption>
            { t('CfPost.BackersTab.info.caption') }
          </SCaption>
        </SCustomPledgeMobileContainer>
      </OptionActionMobileModal>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={14}
          amount={`$${(pledgeAmount!! / 100)?.toFixed(0)}`}
          showTocApply={!user?.loggedIn}
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
        zIndex={15}
      />
    </>
  );
};

export default CfPledgeLevelsModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 16px;
`;

const SContentContainer = styled.div`
  width: calc(100% - 32px);
  height: fit-content;

  display: flex;
  flex-direction: column;

  padding: 16px;
  padding-bottom: 30px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SItem = styled.button`
  position: relative;

  background: none;
  border: transparent;

  text-align: center;

  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  cursor: pointer;
  transition: 0.2s linear;

  &:hover, &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
`;

const SText = styled(Text)`

`;

const SCaption = styled(Text)`
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  text-align: center;
`;

const SAdditionalLabel = styled.div`
  position: absolute;
  top: calc(50% - 12px);
  right: 8px;

  font-weight: bold;
  font-size: 10px;
  line-height: 24px;
  color: #2C2C33;
  text-align: center;

  background-color: ${({ theme }) => theme.colorsThemed.accent.yellow};

  height: 24px;
  padding-left: 8px;
  padding-right: 8px;

  border-radius: 50px;
`;

const SSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
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

// Custom pledge form
const SCustomPledgeMobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 16px;
`;

const SCloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 12px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: fit-content;
  border: transparent;
  background: transparent;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;
