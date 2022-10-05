/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { useAppSelector } from '../../../../../redux-store/store';
import { doPledgeCrowdfunding } from '../../../../../api/endpoints/crowdfunding';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import LoadingModal from '../../../LoadingModal';
import InlineSvg from '../../../../atoms/InlineSVG';
import OptionActionMobileModal from '../../common/OptionActionMobileModal';
import BidAmountTextInput from '../../../../atoms/decision/BidAmountTextInput';

import CancelIcon from '../../../../../public/images/svg/icons/outlined/Close.svg';
import getDisplayname from '../../../../../utils/getDisplayname';
import Headline from '../../../../atoms/Headline';
import assets from '../../../../../constants/assets';
import EllipseModal, {
  EllipseModalButton,
} from '../../../../atoms/EllipseModal';
import PostTitleContent from '../../../../atoms/PostTitleContent';
import PaymentModal from '../../../checkout/PaymentModal';
import { Mixpanel } from '../../../../../utils/mixpanel';
import useStripeSetupIntent from '../../../../../utils/hooks/useStripeSetupIntent';

const getPayWithCardErrorMessage = (
  status?: newnewapi.DoPledgeResponse.Status
) => {
  switch (status) {
    case newnewapi.DoPledgeResponse.Status.NOT_ENOUGH_FUNDS:
      return 'errors.notEnoughMoney';
    case newnewapi.DoPledgeResponse.Status.CARD_NOT_FOUND:
      return 'errors.cardNotFound';
    case newnewapi.DoPledgeResponse.Status.CARD_CANNOT_BE_USED:
      return 'errors.cardCannotBeUsed';
    case newnewapi.DoPledgeResponse.Status.CF_CANCELLED:
      return 'errors.cfCancelled';
    case newnewapi.DoPledgeResponse.Status.CF_FINISHED:
      return 'errors.cfFinished';
    case newnewapi.DoPledgeResponse.Status.CF_NOT_STARTED:
      return 'errors.cfNotStarted';
    default:
      return 'errors.requestFailed';
  }
};

interface ICfPledgeLevelsModal {
  zIndex: number;
  isOpen: boolean;
  post: newnewapi.Crowdfunding;
  pledgeLevels: newnewapi.IMoneyAmount[];
  onClose: () => void;
  handleSetPaymentSuccessModalOpen: (newValue: boolean) => void;
  handleAddPledgeFromResponse: (
    newPledge: newnewapi.Crowdfunding.Pledge
  ) => void;
}

const CfPledgeLevelsModal: React.FunctionComponent<ICfPledgeLevelsModal> = ({
  post,
  zIndex,
  isOpen,
  pledgeLevels,
  onClose,
  handleSetPaymentSuccessModalOpen,
  handleAddPledgeFromResponse,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('modal-Post');
  const user = useAppSelector((state) => state.user);

  const [pledgeAmount, setPledgeAmount] = useState<number | undefined>(
    undefined
  );

  const [customPledgeAmount, setCustomPledgeAmount] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Handlers
  const handleSetPledgeAmountAndOpenPaymentModal = useCallback(
    (amount: number) => {
      setPledgeAmount(amount);
      setPaymentModalOpen(true);
    },
    [setPledgeAmount]
  );

  const handleCustomPledgePaymentModal = useCallback(() => {
    setPledgeAmount(parseInt(customPledgeAmount) * 100);
    setPaymentModalOpen(true);
  }, [customPledgeAmount]);

  const handleOpenCustomPledgeForm = () => setIsFormOpen(true);

  const handleCloseCustomPledgeForm = () => {
    setCustomPledgeAmount('');
    setIsFormOpen(false);
  };

  const doPledgeRequest = useMemo(
    () =>
      !pledgeAmount
        ? null
        : new newnewapi.DoPledgeRequest({
            postUuid: post.postUuid,
            amount: new newnewapi.MoneyAmount({
              usdCents: parseInt(pledgeAmount ? pledgeAmount?.toString() : '0'),
            }),
          }),
    [post.postUuid, pledgeAmount]
  );

  const setupIntent = useStripeSetupIntent({
    purpose: doPledgeRequest,
    isGuest: !user.loggedIn,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/post/${post.postUuid}`,
  });

  const handlePayWithCard = useCallback(
    async ({
      cardUuid,
      saveCard,
    }: {
      cardUuid?: string;
      saveCard?: boolean;
    }) => {
      setLoadingModalOpen(true);

      if (setupIntent.isGuest) {
        router.push(
          `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${setupIntent.setupIntentClientSecret}`
        );
        return;
      }

      Mixpanel.track('PayWithCard', {
        _stage: 'Post',
        _postUuid: post.postUuid,
        _component: 'CfPledgeLevelsModal',
      });

      try {
        const stripeContributionRequest =
          new newnewapi.StripeContributionRequest({
            cardUuid,
            stripeSetupIntentClientSecret: setupIntent.setupIntentClientSecret,
            ...(saveCard !== undefined
              ? {
                  saveCard,
                }
              : {}),
          });

        const res = await doPledgeCrowdfunding(stripeContributionRequest);

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.DoPledgeResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        setIsFormOpen(false);
        setCustomPledgeAmount('');
        handleAddPledgeFromResponse(
          res.data.pledge as newnewapi.Crowdfunding.Pledge
        );

        handleSetPaymentSuccessModalOpen(true);
        setPaymentModalOpen(false);

        onClose();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoadingModalOpen(false);
        setupIntent.destroy();
      }
    },
    [
      handleSetPaymentSuccessModalOpen,
      onClose,
      handleAddPledgeFromResponse,
      post.postUuid,
      setupIntent,
      router,
      t,
    ]
  );

  useEffect(() => {
    if (!paymentModalOpen) setPledgeAmount(undefined);
  }, [paymentModalOpen]);

  return (
    <>
      <EllipseModal zIndex={zIndex} show={isOpen} onClose={() => onClose()}>
        {pledgeLevels
          .map((p, i) =>
            p.usdCents ? (
              <EllipseModalButton
                key={`${p.usdCents}_${i}`}
                onClick={() => {
                  handleSetPledgeAmountAndOpenPaymentModal(
                    p.usdCents ? p.usdCents : 0
                  );
                }}
              >{`$${(p.usdCents / 100).toFixed(0)}`}</EllipseModalButton>
            ) : null
          )
          .concat(
            <EllipseModalButton
              onClick={() => {
                handleOpenCustomPledgeForm();
              }}
            >
              {t('cfPost.backersTab.custom')}
            </EllipseModalButton>
          )}
      </EllipseModal>
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
            {t('cfPost.backersTab.customPledge.pledgeButton')}
            <SCloseButton onClick={() => handleCloseCustomPledgeForm()}>
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
          </div>
          <BidAmountTextInput
            value={customPledgeAmount}
            inputAlign='center'
            autofocus={isFormOpen}
            minAmount={1}
            style={{
              textAlign: 'center',
              paddingLeft: '12px',
            }}
            onChange={(newValue: string) => setCustomPledgeAmount(newValue)}
          />
          <Button
            view='primaryGrad'
            size='sm'
            disabled={customPledgeAmount === ''}
            onClick={() => handleCustomPledgePaymentModal()}
          >
            {t('cfPost.backersTab.customPledge.continue')}
          </Button>
          <SCaption>{t('cfPost.backersTab.info.caption')}</SCaption>
        </SCustomPledgeMobileContainer>
      </OptionActionMobileModal>
      {/* Payment Modal */}
      {paymentModalOpen ? (
        <PaymentModal
          isOpen={paymentModalOpen}
          zIndex={14}
          amount={pledgeAmount || 0}
          onClose={() => setPaymentModalOpen(false)}
          setupIntent={setupIntent}
          handlePayWithCard={handlePayWithCard}
          redirectUrl={`post/${post.postUuid}`}
          bottomCaption={
            <SPaymentSign variant='subtitle'>
              {post.creator && (
                <>
                  {t('cfPost.paymentModalFooter.body', {
                    creator: getDisplayname(post.creator),
                  })}
                </>
              )}
              *
              <Link href='https://terms.newnew.co'>
                <SPaymentTermsLink
                  href='https://terms.newnew.co'
                  target='_blank'
                >
                  {t('cfPost.paymentModalFooter.terms')}
                </SPaymentTermsLink>
              </Link>{' '}
              {t('cfPost.paymentModalFooter.apply')}
            </SPaymentSign>
          }
        >
          <SPaymentModalHeader>
            <SPaymentModalHeading>
              <SPaymentModalHeadingPostSymbol>
                <SPaymentModalHeadingPostSymbolImg
                  src={
                    theme.name === 'light'
                      ? assets.creation.lightCfStatic
                      : assets.creation.darkCfStatic
                  }
                />
              </SPaymentModalHeadingPostSymbol>
              <SPaymentModalHeadingPostCreator variant={3}>
                {post.creator
                  ? t('cfPost.paymentModalHeader.title', {
                      creator: getDisplayname(post.creator),
                    })
                  : ''}
              </SPaymentModalHeadingPostCreator>
            </SPaymentModalHeading>
            <SPaymentModalOptionText variant={5}>
              <PostTitleContent>{post.title}</PostTitleContent>
            </SPaymentModalOptionText>
          </SPaymentModalHeader>
        </PaymentModal>
      ) : null}
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={15} />
    </>
  );
};

export default CfPledgeLevelsModal;

const SCaption = styled(Text)`
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  text-align: center;
`;

// Payment modal header
const SPaymentModalHeader = styled.div``;

const SPaymentModalHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 16px;

  padding-right: 64px;
  margin-bottom: 24px;
`;

const SPaymentModalHeadingPostSymbol = styled.div`
  background: ${({ theme }) => theme.colorsThemed.background.quaternary};

  display: flex;
  justify-content: center;
  align-items: center;

  width: 42px;
  height: 42px;
  border-radius: 50%;
`;

const SPaymentModalHeadingPostSymbolImg = styled.img`
  width: 24px;
`;

const SPaymentModalHeadingPostCreator = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
`;

const SPaymentModalOptionText = styled(Headline)`
  display: flex;
  align-items: center;
  white-space: pre-wrap;
  word-break: break-word;
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

const SPaymentSign = styled(Text)`
  margin-top: 24px;

  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SPaymentTermsLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
