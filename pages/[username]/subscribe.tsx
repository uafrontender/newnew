/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useTranslation, Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import { useAppSelector } from '../../redux-store/store';
// import { WalletContext } from '../../contexts/walletContext';
import { getUserByUsername } from '../../api/endpoints/user';
import {
  getSubscriptionStatus,
  subscribeToCreator,
} from '../../api/endpoints/subscription';

import General from '../../components/templates/General';
import Text from '../../components/atoms/Text';
import Button from '../../components/atoms/Button';
import Headline from '../../components/atoms/Headline';
import GoBackButton from '../../components/molecules/GoBackButton';
import FaqSection from '../../components/molecules/subscribe/FaqSection';
import PaymentModal from '../../components/molecules/checkout/PaymentModal';

import isBrowser from '../../utils/isBrowser';
import { formatNumber } from '../../utils/format';
import assets from '../../constants/assets';
import useSynchronizedHistory from '../../utils/hooks/useSynchronizedHistory';
import useStripeSetupIntent from '../../utils/hooks/useStripeSetupIntent';

const LoadingModal = dynamic(
  () => import('../../components/molecules/LoadingModal')
);

const getPayWithCardErrorMessage = (
  status?: newnewapi.SubscribeToCreatorResponse.Status
) => {
  switch (status) {
    case newnewapi.SubscribeToCreatorResponse.Status.CARD_NOT_FOUND:
      return 'errors.cardNotFound';
    case newnewapi.SubscribeToCreatorResponse.Status.CARD_CANNOT_BE_USED:
      return 'errors.cardCannotBeUsed';
    case newnewapi.SubscribeToCreatorResponse.Status.BLOCKED_BY_CREATOR:
      return 'errors.blockedByCreator';
    case newnewapi.SubscribeToCreatorResponse.Status.SUBSCRIPTION_UNAVAILABLE:
      return 'errors.subscriptionUnavailable';
    default:
      return 'errors.requestFailed';
  }
};

interface ISubscribeToUserPage {
  user: Omit<newnewapi.User, 'toJSON'>;
  setup_intent_client_secret?: string;
  save_card?: boolean;
}

const SubscribeToUserPage: NextPage<ISubscribeToUserPage> = ({
  user,
  setup_intent_client_secret,
  save_card,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('page-SubscribeToUser');
  const { syncedHistoryReplaceState } = useSynchronizedHistory();

  const { loggedIn, userData: currentUserData } = useAppSelector(
    (state) => state.user
  );
  const { banner } = useAppSelector((state) => state.ui);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const [
    stripeSetupIntentClientSecretFromRedirect,
    setStripeSetupIntentClientSecretFromRedirect,
  ] = useState(setup_intent_client_secret);

  const [saveCardFromRedirect, setSaveCardFromRedirect] = useState(save_card);

  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  useEffect(() => {
    if (setup_intent_client_secret) {
      syncedHistoryReplaceState(
        {
          username: user.username,
        },
        `${router.locale !== 'en-US' ? `/${router.locale}` : ''}/${
          user.username
        }/subscribe`
      );
    }
  }, [
    router.locale,
    setup_intent_client_secret,
    syncedHistoryReplaceState,
    user.username,
  ]);

  // const { walletBalance } = useContext(WalletContext);

  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const topSectionRef = useRef<HTMLDivElement>();

  const [subscriptionPrice, setSubscriptionPrice] = useState<
    number | undefined
  >(undefined);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // const predefinedOption = useMemo(() => {
  //   if (walletBalance && subscriptionPrice) {
  //     return walletBalance.usdCents >= subscriptionPrice ? 'wallet' : 'card';
  //   }
  //   return undefined;
  // }, [walletBalance, subscriptionPrice]);
  const predefinedOption = useMemo(() => {
    if (subscriptionPrice) {
      return 'card';
    }
    return undefined;
  }, [subscriptionPrice]);

  const subPriceFormatted = useMemo(
    () =>
      subscriptionPrice
        ? formatNumber(subscriptionPrice / 100 ?? 0, false)
        : '',
    [subscriptionPrice]
  );

  const setupIntent = useStripeSetupIntent({ purpose: user.uuid || '' });

  const handleOpenPaymentModal = () => {
    if (!loggedIn) {
      router.push(
        `/sign-up?reason=subscribe&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setupIntent.destroy();
  };

  const handleSubscribeToCreator = useCallback(
    async (stripeContributionRequest: newnewapi.StripeContributionRequest) => {
      try {
        const res = await subscribeToCreator(stripeContributionRequest);

        if (!res.data || res.error) {
          throw new Error(
            res.error?.message ??
              t(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        if (
          res.data?.status ===
          newnewapi.SubscribeToCreatorResponse.Status.ALREADY_SUBSCRIBED
        ) {
          setLoadingModalOpen(true);
          router.push(`/direct-messages/${user.username}-cr`);
        } else if (
          res.data.status ===
          newnewapi.SubscribeToCreatorResponse.Status.SUCCESS
        ) {
          setLoadingModalOpen(true);
          router.push(
            `${process.env.NEXT_PUBLIC_APP_URL}/subscription-success?userId=${user.uuid}&username=${user.username}`
          );
        } else {
          throw new Error(t(getPayWithCardErrorMessage(res.data?.status)));
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
        setupIntent.destroy();
        setLoadingModalOpen(false);
      }
    },
    [router, user.uuid, user.username, setupIntent, t]
  );

  useEffect(() => {
    const subscribeToCreatorAfterStripeRedirect = async () => {
      if (!stripeSetupIntentClientSecretFromRedirect || loadingModalOpen)
        return;

      setLoadingModalOpen(true);

      const stripeContributionRequest = new newnewapi.StripeContributionRequest(
        {
          stripeSetupIntentClientSecret:
            stripeSetupIntentClientSecretFromRedirect,
          saveCard: saveCardFromRedirect ?? false,
        }
      );

      setStripeSetupIntentClientSecretFromRedirect('');
      setSaveCardFromRedirect(false);

      await handleSubscribeToCreator(stripeContributionRequest);

      setLoadingModalOpen(false);
    };

    if (stripeSetupIntentClientSecretFromRedirect && !loadingModalOpen) {
      subscribeToCreatorAfterStripeRedirect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribeWithCard = useCallback(
    async ({
      cardUuid,
      saveCard,
    }: {
      cardUuid?: string;
      saveCard?: boolean;
    }) => {
      const stripeContributionRequest = new newnewapi.StripeContributionRequest(
        {
          cardUuid,
          stripeSetupIntentClientSecret: setupIntent.setupIntentClientSecret,
          ...(saveCard !== undefined
            ? {
                saveCard,
              }
            : {}),
        }
      );

      await handleSubscribeToCreator(stripeContributionRequest);
    },
    [handleSubscribeToCreator, setupIntent]
  );

  useEffect(() => {
    if (user.uuid === currentUserData?.userUuid) {
      router?.push('/profile');
    }
  }, [user.uuid, currentUserData?.userUuid, router]);

  useEffect(() => {
    async function fetchSubscriptionPrice() {
      try {
        const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
          creatorUuid: user.uuid,
        });

        const res = await getSubscriptionStatus(getStatusPayload);

        if (res.data?.status?.product?.monthlyRate?.usdCents) {
          setSubscriptionPrice(res.data?.status?.product.monthlyRate?.usdCents);
        }
      } catch (err) {
        console.log(err);
        toast.error('toastErrors.generic');
      }
    }

    fetchSubscriptionPrice();
  }, [user.uuid]);

  useEffect(() => {
    const handler = (e: Event) => {
      const currScroll = window?.scrollY;
      const targetScroll = topSectionRef.current?.scrollHeight;

      if (currScroll >= targetScroll!!) {
        setIsScrolledDown(true);
      } else {
        setIsScrolledDown(false);
      }

      if (isMobile) {
        if (
          window?.innerHeight + window?.scrollY >=
          document?.body?.offsetHeight
        ) {
          setIsScrolledToBottom(true);
        } else {
          setIsScrolledToBottom(false);
        }
      }
    };

    if (isBrowser()) {
      document?.addEventListener('scroll', handler);
    }

    return () => {
      if (isBrowser()) {
        document?.removeEventListener('scroll', handler);
      }
    };
  }, [isMobile]);

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch(`/sign-up?reason=subscribe`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SGeneral
        restrictMaxWidth
        {...{
          ...(isMobileOrTablet
            ? {
                specialStatusBarColor: theme.colorsThemed.accent.yellow,
              }
            : {}),
        }}
      >
        <div>
          <main
            style={{
              ...(isMobileOrTablet && !banner.show
                ? {
                    marginTop: '-28px',
                  }
                : {}),
            }}
          >
            <AnimatePresence>
              {isScrolledDown && !isMobile && !isPaymentModalOpen && (
                <SScrolledDownTopSection
                  initial={{
                    opacity: 0,
                    y: -30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -30,
                  }}
                  pushDown={banner.show}
                >
                  <SUserInfoScrollDown>
                    <SUserInfoScrollDownAvatar>
                      <img alt={user.username} src={user.avatarUrl} />
                    </SUserInfoScrollDownAvatar>
                    <SUserInfoScrollDownNickname>
                      {user.nickname}
                    </SUserInfoScrollDownNickname>
                  </SUserInfoScrollDown>
                  <SSubscribeButtonScrollDown
                    onClick={() => handleOpenPaymentModal()}
                  >
                    {t('button.subscribe', { amount: subPriceFormatted })}
                  </SSubscribeButtonScrollDown>
                </SScrolledDownTopSection>
              )}
            </AnimatePresence>
            {isTablet && (
              <SGoBackButtonTablet
                defer={500}
                onClick={() => router.push(`/${user.username}`)}
              />
            )}
            <STopSection
              ref={(el) => {
                topSectionRef.current = el!!;
              }}
            >
              {!isTablet && (
                <SBackButton
                  defer={500}
                  onClick={() => router.push(`/${user.username}`)}
                >
                  {!isMobileOrTablet && t('button.back')}
                </SBackButton>
              )}
              <UserInfoSection>
                <SHeadingSection>
                  <SSHeadingSectionAvatar>
                    <img alt={user.username} src={user.avatarUrl} />
                  </SSHeadingSectionAvatar>
                  <div>
                    <SHeadline variant={4}>
                      {t('topSection.headline.line_1', {
                        username: user.username,
                      })}
                    </SHeadline>
                    <SHeadline variant={2}>
                      {t('topSection.headline.line_2')}
                    </SHeadline>
                  </div>
                </SHeadingSection>
                <SButtonsSection>
                  <SSubscribeButtonDesktop
                    style={{
                      marginBottom: '16px',
                    }}
                    onClick={() => handleOpenPaymentModal()}
                  >
                    {t('button.subscribe', { amount: subPriceFormatted })}
                  </SSubscribeButtonDesktop>
                  {/* <Button
                    view="quaternary"
                    style={{
                      marginBottom: '16px',
                      marginTop: '16px',
                      color: theme.colors.dark,
                    }}
                    onClick={() => {}}
                  >
                    {t('button.learnMore')}
                  </Button> */}
                </SButtonsSection>
              </UserInfoSection>
              <SBulletsSection>
                <SBullet>
                  <SBulletImg alt='' src={assets.subscription.subDm} />
                  <SBulletTitle variant={5}>
                    {t('topSection.bullets.directMessages.title')}
                  </SBulletTitle>
                  <SBulletBody variant={3}>
                    {t('topSection.bullets.directMessages.body', {
                      nickname: user?.nickname,
                    })}
                  </SBulletBody>
                </SBullet>
                <SBullet>
                  <SBulletImg alt='' src={assets.subscription.subVotes} />
                  <SBulletTitle variant={5}>
                    {t('topSection.bullets.freeVotes.title')}
                  </SBulletTitle>
                  <SBulletBody variant={3}>
                    {t('topSection.bullets.freeVotes.body', {
                      nickname: user?.nickname,
                    })}
                  </SBulletBody>
                </SBullet>
                <SBullet>
                  <SBulletImg alt='' src={assets.subscription.subMC} />
                  <SBulletTitle variant={5}>
                    {t('topSection.bullets.suggestions.title')}
                  </SBulletTitle>
                  <SBulletBody variant={3}>
                    <Trans
                      t={t}
                      i18nKey='topSection.bullets.suggestions.body'
                      // @ts-ignore
                      components={[<BoldSpan />, user?.nickname]}
                    />
                  </SBulletBody>
                </SBullet>
              </SBulletsSection>
            </STopSection>
            <FaqSection />
          </main>
        </div>
      </SGeneral>
      {isMobile && !isScrolledToBottom && (
        <SSubscribeButtonMobileContainer>
          <SSubscribeButtonMobile onClick={() => handleOpenPaymentModal()}>
            {t('button.subscribe', { amount: subPriceFormatted })}
          </SSubscribeButtonMobile>
        </SSubscribeButtonMobileContainer>
      )}
      <PaymentModal
        zIndex={10}
        // predefinedOption={predefinedOption}
        isOpen={isPaymentModalOpen}
        amount={subscriptionPrice || 0}
        onClose={handleClosePaymentModal}
        handlePayWithCard={handleSubscribeWithCard}
        showTocApply
        noRewards
        setupIntent={setupIntent}
        redirectUrl={`${user.username}/subscribe`}
        // handlePayWithWallet={handlePayRegistered}
        // payButtonCaptionKey={t('paymentModal.payButton')}
      >
        <SPaymentModalHeader>
          <SPaymentModalTitle variant='subtitle'>
            {t('paymentModal.header')}
          </SPaymentModalTitle>
          <SPaymentModalCreatorInfo>
            <SAvatar>
              <img src={user.avatarUrl} alt={user.username} />
            </SAvatar>
            <SCreatorInfo>
              <SCreatorUsername>
                {isMobile ? user.nickname : `@${user.username}`}
              </SCreatorUsername>
            </SCreatorInfo>
          </SPaymentModalCreatorInfo>
        </SPaymentModalHeader>
      </PaymentModal>
      {/* Loading Modal */}
      {loadingModalOpen && (
        <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      )}
    </>
  );
};

export default SubscribeToUserPage;

interface IBoldSpan {
  children: string;
}

const BoldSpan: React.FC<IBoldSpan> = ({ children }) => (
  <strong>
    <em>{children}</em>
  </strong>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username, setup_intent_client_secret, save_card } = context.query;
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-SubscribeToUser',
    'modal-PaymentModal',
  ]);

  if (!username || Array.isArray(username)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const getUserRequestPayload = new newnewapi.GetUserRequest({
    username,
  });

  const res = await getUserByUsername(getUserRequestPayload);

  if (!res.data || !res.data.options?.isCreator || res.error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: res.data.toJSON(),
      ...(setup_intent_client_secret
        ? {
            setup_intent_client_secret,
          }
        : {}),
      ...(save_card
        ? {
            save_card: save_card === 'true',
          }
        : {}),
      ...translationContext,
    },
  };
};

const SGeneral = styled(General)`
  position: relative;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  header {
    z-index: 6;
  }

  #bottom-nav-mobile {
    display: none;
  }

  @media (max-width: 764px) {
    margin-top: -68px;

    main {
      div:first-child {
        padding-left: 0;
        padding-right: 0;

        div:first-child {
          margin-left: 0;
          margin-right: 0;
        }
      }
    }
  }

  @media (max-width: 1024px) {
    #top-nav-header {
      display: none;
    }
  }
`;

const SScrolledDownTopSection = styled(motion.div)<{ pushDown: boolean }>`
  position: fixed;
  top: ${({ pushDown }) => (pushDown ? '112px' : '72px')};
  left: 0;

  height: 72px;
  width: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.accent.yellow};

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0px 48px;

  z-index: 100;

  ${({ theme }) => theme.media.laptop} {
    top: ${({ pushDown }) => (pushDown ? '120px' : '80px')};
    padding: 0px calc(50% - 368px);
  }
`;

const SGoBackButtonTablet = styled(GoBackButton)`
  position: absolute;
  top: 24px;
  left: 34px;

  width: fit-content;
  height: fit-content;
`;

const SBackButton = styled(GoBackButton)`
  position: absolute;
  top: 16px;
  left: 18px;

  width: fit-content;
  height: fit-content;

  padding: 0px;

  path {
    fill: ${({ theme }) => theme.colors.dark} !important;
  }

  color: ${({ theme }) => theme.colors.dark};

  &:active:enabled,
  &:hover:enabled,
  &:focus {
    color: ${({ theme }) => theme.colors.dark} !important;
    & div > svg {
      path {
        fill: ${({ theme }) => theme.colors.dark} !important;
      }

      transform: scale(0.8);
      transition: 0.2s ease-in-out;
    }
  }

  ${({ theme }) => theme.media.tablet} {
  }

  ${({ theme }) => theme.media.laptopM} {
    left: 96px;
    top: 48px;
  }
`;

const SUserInfoScrollDownAvatar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
  position: relative;

  width: 48px;
  height: 48px;
  border-radius: 50%;

  img {
    display: block;
    width: 48px;
    height: 48px;
  }
`;

const SUserInfoScrollDownNickname = styled.div`
  font-weight: bold;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.dark};
`;

const SUserInfoScrollDown = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SSubscribeButtonScrollDown = styled(Button)`
  background: ${({ theme }) => theme.colors.dark};

  height: 48px;

  &:focus:enabled,
  &:hover:enabled {
    background: ${({ theme }) => theme.colors.dark};
  }
`;

const STopSection = styled.div`
  position: relative;
  overflow: hidden;

  margin-top: -28px;
  margin-bottom: 40px;

  padding: 24px 16px !important;

  background-color: ${({ theme }) => theme.colorsThemed.accent.yellow};
  color: ${({ theme }) => theme.colors.dark};

  ${(props) => props.theme.media.tablet} {
    margin-top: -8px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 60px 60px !important;

    margin-left: 12px;
    margin-right: 12px;

    margin-bottom: 60px;
  }

  ${(props) => props.theme.media.laptopM} {
    display: flex;
    align-items: center;

    margin-top: -16px;

    padding: 82px 96px !important;

    margin-bottom: 120px;
  }
`;

const UserInfoSection = styled.div`
  ${(props) => props.theme.media.laptopM} {
    width: 50%;
  }
`;

const SHeadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;

  margin-bottom: 24px !important;

  ${(props) => props.theme.media.tablet} {
    display: initial;
    text-align: initial;
  }
`;

const SSHeadingSectionAvatar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
  position: relative;

  width: 84px;
  height: 84px;
  border-radius: 50%;

  margin-bottom: 24px;

  img {
    display: block;
    width: 84px;
    height: 84px;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 72px;
    height: 72px;
    border-radius: 50%;

    img {
      display: block;
      width: 72px;
      height: 72px;
    }
  }

  ${({ theme }) => theme.media.laptopM} {
    width: 84px;
    height: 84px;
    border-radius: 50%;

    img {
      display: block;
      width: 84px;
      height: 84px;
    }
  }
`;

const SSubscribeButtonDesktop = styled(Button)`
  background: ${({ theme }) => theme.colors.dark};

  margin-top: 16px;

  &:focus:enabled,
  &:hover:enabled {
    background: ${({ theme }) => theme.colors.dark};
  }
`;

const SSubscribeButtonMobileContainer = styled.div`
  width: 100%;
  position: fixed;
  left: 0px;
  bottom: 0px;

  padding: 0px 16px;
  padding-top: 24px;

  height: 104px;

  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const SSubscribeButtonMobile = styled(Button)`
  height: 56px;
  width: 100%;

  background: ${({ theme }) => theme.colors.dark};

  &:focus:enabled,
  &:hover:enabled {
    background: ${({ theme }) => theme.colors.dark};
  }
`;

const SHeadline = styled(Headline)`
  color: ${({ theme }) => theme.colors.dark};
`;

const SButtonsSection = styled.div`
  display: none;

  ${(props) => props.theme.media.tablet} {
    display: flex;
    gap: 24px;
  }
`;

const SBulletsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 96px;

  margin-top: 104px;

  ${(props) => props.theme.media.tablet} {
    margin-top: 16px;

    gap: initial;
  }

  ${(props) => props.theme.media.laptopM} {
    width: 50%;
  }
`;

const SBullet = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;

  background: ${({ theme }) => theme.colors.dark};

  height: 128px;

  border-radius: 24px;

  padding-left: 16px !important;
  padding-right: 16px !important;

  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    height: 140px;

    border-radius: 24px;
    margin-bottom: 24px !important;

    text-align: initial;

    margin-left: 70px !important;
    padding-left: 102px !important;
  }

  ${({ theme }) => theme.media.laptop} {
  }
`;

const SBulletImg = styled.img`
  position: absolute;
  left: calc(50% - 60px);
  top: -76px;

  width: 120px;
  height: 120px;

  ${({ theme }) => theme.media.tablet} {
    left: -70px;
    top: calc(50% - 70px);
    width: 140px;
    height: initial;
  }

  ${({ theme }) => theme.media.laptop} {
  }
`;

const SBulletTitle = styled(Headline)`
  margin-bottom: 4px;
  color: #fff;
`;

const SBulletBody = styled(Text)`
  color: #fff;
  opacity: 0.6;
`;

// Payment modal header
const SPaymentModalHeader = styled.div``;

const SPaymentModalTitle = styled(Text)`
  text-align: center;
  margin-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    text-align: left;
    margin-bottom: 6px;
  }
`;

const SPaymentModalCreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  justify-content: center;
  flex-direction: column;
  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    text-align: initial;
    flex-direction: row;
    justify-content: flex-start;
  }
`;

const SAvatar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
  position: relative;

  grid-area: avatar;
  justify-self: left;

  width: 84px;
  height: 84px;
  border-radius: 50%;

  img {
    display: block;
    width: 84px;
    height: 84px;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 36px;
    height: 36px;
    border-radius: 50%;

    img {
      display: block;
      width: 36px;
      height: 36px;
    }
  }
`;

const SCreatorInfo = styled.div``;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
