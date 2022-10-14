import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { buyCreatorsBundles } from '../../../api/endpoints/bundles';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { useAppSelector } from '../../../redux-store/store';
import getCustomerPaymentFee from '../../../utils/getCustomerPaymentFee';
import getDisplayname from '../../../utils/getDisplayname';
import useStripeSetupIntent from '../../../utils/hooks/useStripeSetupIntent';
import InlineSvg from '../../atoms/InlineSVG';
import Text from '../../atoms/Text';
import PaymentModal from '../checkout/PaymentModal';
import LoadingModal from '../LoadingModal';
import RadioIcon from '../../../public/images/svg/icons/filled/Radio.svg';

interface IBundlePaymentModal {
  creator: newnewapi.IUser;
  bundle: newnewapi.IPackOffer;
  onClose: () => void;
}

const BundlePaymentModal: React.FC<IBundlePaymentModal> = ({
  creator,
  bundle,
  onClose,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { appConstants } = useGetAppConstants();
  const user = useAppSelector((state) => state.user);

  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  const voteOnPostRequest = useMemo(
    () =>
      new newnewapi.BuyCreatorsPack({
        creatorUuid: creator.uuid,
        packUuid: bundle.packUuid,
        amount: bundle.price,
      }),
    [creator, bundle]
  );

  // TODO: Fix setup intent
  const setupIntent = useStripeSetupIntent({
    purpose: voteOnPostRequest,
    isGuest: !user.loggedIn,
    // TODO: Fix redirect
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bundles`,
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

      // TODO: add reporting
      /* Mixpanel.track('PayWithCard', {
        _stage: 'Post',
        _postUuid: postId,
        _component: 'McOptionCard',
      }); */

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

        const res = await buyCreatorsBundles(stripeContributionRequest);

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ?? t('modal.buyBundle.error.requestFailed')
          );
        }

        setPaymentSuccessModalOpen(true);
        onClose();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoadingModalOpen(false);
        setupIntent.destroy();
      }
    },
    [setupIntent, router, t, setPaymentSuccessModalOpen, onClose]
  );

  const paymentAmountInCents = useMemo(() => bundle.price!.usdCents!, [bundle]);

  const paymentFeeInCents = useMemo(
    () =>
      getCustomerPaymentFee(
        paymentAmountInCents,
        parseFloat(appConstants.customerFee)
      ),
    [paymentAmountInCents, appConstants.customerFee]
  );

  const paymentWithFeeInCents = useMemo(
    () => paymentAmountInCents + paymentFeeInCents,
    [paymentAmountInCents, paymentFeeInCents]
  );

  const daysOfAccess = bundle.accessDurationInSeconds! / 60 / 60 / 24;
  const monthsOfAccess = Math.floor(daysOfAccess / 30);
  const unitOfTimeLeft = monthsOfAccess > 1 ? 'months' : 'month';

  // TODO: Handle redirect
  return (
    <>
      <PaymentModal
        zIndex={12}
        isOpen
        amount={paymentWithFeeInCents}
        setupIntent={setupIntent}
        redirectUrl='bundles'
        onClose={onClose}
        handlePayWithCard={handlePayWithCard}
        bottomCaption={
          // TODO: fix capture texts
          (!appConstants.minHoldAmount?.usdCents ||
            paymentWithFeeInCents > appConstants.minHoldAmount?.usdCents) && (
            <SPaymentSign variant='subtitle'>
              {t('cfPost.paymentModalFooter.body', {
                creator: getDisplayname(creator),
              })}
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
          )
        }
      >
        <ModalTitle>
          {t('modal.buyBundle.payment.header', { creator: creator.username })}
        </ModalTitle>
        <SVotesNumber>
          <Trans
            t={t}
            i18nKey='modal.buyBundle.votes'
            // @ts-ignore
            components={[<VotesNumberSpan />, { amount: bundle.votesAmount }]}
          />
        </SVotesNumber>
        <AccessDescription>
          {t('modal.buyBundle.access', {
            amount: monthsOfAccess,
            unit: unitOfTimeLeft,
          })}
        </AccessDescription>
        <SDescriptionLine>
          <SBullet>
            <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
          </SBullet>
          <SDescriptionText>
            {t('modal.buyBundle.customOptions')}
          </SDescriptionText>
        </SDescriptionLine>
        <SDescriptionLine last>
          <SBullet>
            <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
          </SBullet>
          <SDescriptionText>{t('modal.buyBundle.chat')}</SDescriptionText>
        </SDescriptionLine>
      </PaymentModal>
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* TODO: Add success modal */}
      {paymentSuccessModalOpen && <div />}
    </>
  );
};

export default BundlePaymentModal;

const SPaymentSign = styled(Text)`
  margin-top: 24px;

  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SPaymentTermsLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const ModalTitle = styled.h4`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 12px;
  line-height: 16px;

  margin-top: 16px;
  margin-bottom: 16px;
`;

const SVotesNumber = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 32px;
  line-height: 40px;

  margin-bottom: 10px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const VotesNumberSpan = styled.span`
  color: ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const AccessDescription = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 14px;
  line-height: 20px;

  margin-bottom: 12px;
`;

const SDescriptionLine = styled.div<{ last?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${({ last }) => (last ? '0px' : '8px;')};
  width: 100%;

  overflow: hidden;
`;

const SBullet = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  margin-top: 4px;
  margin-right: 8px;
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const SDescriptionText = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 14px;
  line-height: 20px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
