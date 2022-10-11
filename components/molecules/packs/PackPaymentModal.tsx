import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { buyCreatorsPack } from '../../../api/endpoints/pack';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { useAppSelector } from '../../../redux-store/store';
import getCustomerPaymentFee from '../../../utils/getCustomerPaymentFee';
import getDisplayname from '../../../utils/getDisplayname';
import useStripeSetupIntent from '../../../utils/hooks/useStripeSetupIntent';
import Text from '../../atoms/Text';
import PaymentModal from '../checkout/PaymentModal';
import LoadingModal from '../LoadingModal';

interface IPackPaymentModal {
  creator: newnewapi.IUser;
  pack: newnewapi.IPackOffer;
  onClose: () => void;
}

const PackPaymentModal: React.FC<IPackPaymentModal> = ({
  creator,
  pack,
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
        packUuid: pack.packUuid,
        amount: pack.price,
      }),
    [creator, pack]
  );

  // TODO: Fix setup intent
  const setupIntent = useStripeSetupIntent({
    purpose: voteOnPostRequest,
    isGuest: !user.loggedIn,
    // TODO: Fix redirect
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/packs`,
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

        const res = await buyCreatorsPack(stripeContributionRequest);

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ?? t('modal.buyPack.error.requestFailed')
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

  const paymentAmountInCents = useMemo(() => pack.price!.usdCents!, [pack]);

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

  // TODO: Handle redirect
  return (
    <>
      <PaymentModal
        zIndex={12}
        isOpen
        amount={paymentWithFeeInCents}
        setupIntent={setupIntent}
        redirectUrl='packs'
        onClose={onClose}
        handlePayWithCard={handlePayWithCard}
        bottomCaption={
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
        {/* TODO: Add UI */}
        {/* <SPaymentModalHeader>
          <SPaymentModalHeading>
            <SPaymentModalHeadingPostSymbol>
              <SPaymentModalHeadingPostSymbolImg src={assets.decision.votes} />
            </SPaymentModalHeadingPostSymbol>
            <SPaymentModalHeadingPostCreator variant={3}>
              {t('mcPost.paymentModalHeader.title', {
                creator: postCreator,
              })}
            </SPaymentModalHeadingPostCreator>
          </SPaymentModalHeading>
          <SPaymentModalPostText variant={2}>
            <PostTitleContent>{postText}</PostTitleContent>
          </SPaymentModalPostText>
          <SPaymentModalTitle variant='subtitle'>
            {t('mcPost.paymentModalHeader.subtitle')}
          </SPaymentModalTitle>
          <SPaymentModalOptionText variant={5}>
            {option.text}
          </SPaymentModalOptionText>
            </SPaymentModalHeader> */}
      </PaymentModal>
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* TODO: Add success modal */}
      {paymentSuccessModalOpen && <div />}
    </>
  );
};

export default PackPaymentModal;

const SPaymentSign = styled(Text)`
  margin-top: 24px;

  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SPaymentTermsLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
