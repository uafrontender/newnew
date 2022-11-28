/* eslint-disable react/no-array-index-key */
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useTranslation } from 'next-i18next';
import { NextPage, NextPageContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import { useEffectOnce } from 'react-use';

import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import assets from '../constants/assets';
import GoBackButton from '../components/molecules/GoBackButton';
import { useAppSelector } from '../redux-store/store';
import InlineSvg from '../components/atoms/InlineSVG';
import searchIcon from '../public/images/svg/icons/outlined/Search.svg';
import closeIcon from '../public/images/svg/icons/outlined/Close.svg';
import CreatorsList from '../components/organisms/search/CreatorsList';
import usePagination, {
  PaginatedResponse,
  Paging,
} from '../utils/hooks/usePagination';
import { searchCreators } from '../api/endpoints/search';
import BuyBundleModal from '../components/molecules/bundles/BuyBundleModal';
import BundleCard from '../components/molecules/bundles/BundleCard';
import BackButton from '../components/molecules/profile/BackButton';
import AllBundlesModal from '../components/molecules/bundles/AllBundlesModal';
import { useBundles } from '../contexts/bundlesContext';
import CreatorsBundleModal from '../components/molecules/bundles/CreatorsBundleModal';
import AnimatedBackground from '../components/atoms/AnimationBackground';
import { Mixpanel } from '../utils/mixpanel';
import { buyCreatorsBundle } from '../api/endpoints/bundles';
import useErrorToasts from '../utils/hooks/useErrorToasts';
import { SUPPORTED_LANGUAGES } from '../constants/general';

interface IBundlesPage {
  stripeSetupIntentClientSecretFromRedirect?: string;
  saveCardFromRedirect?: boolean;
}

// TODO: refactor: move Content to separate component
// TODO: refactor: separate out some of the components
export const Bundles: NextPage<IBundlesPage> = ({
  stripeSetupIntentClientSecretFromRedirect,
  saveCardFromRedirect,
}) => {
  const router = useRouter();
  const { t } = useTranslation('page-Bundles');
  const theme = useTheme();
  const { user, ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    ui.resizeMode
  );
  const isTablet = ['tablet'].includes(ui.resizeMode);

  const { showErrorToastPredefined, showErrorToastCustom } = useErrorToasts();

  const [stripeSetupIntentClientSecret, setStripeSetupIntentClientSecret] =
    useState(() => stripeSetupIntentClientSecretFromRedirect ?? undefined);

  const [saveCard, setSaveCard] = useState(
    () => saveCardFromRedirect ?? undefined
  );

  const [allBundlesModalOpen, setAllBundlesModalOpen] = useState(false);
  const [shownCreatorBundle, setShownCreatorBundle] = useState<
    newnewapi.ICreatorBundle | undefined
  >();
  const [offeredCreator, setOfferedCreator] = useState<
    newnewapi.IUser | undefined
  >();
  const { bundles } = useBundles();

  const [searchValue, setSearchValue] = useState('');
  const { ref: loadingRef, inView } = useInView();
  const searchContainerRef = useRef<HTMLDivElement | undefined>();
  const [shadeVisible, setShadeVisible] = useState<boolean>(false);

  const loadCreatorsData = useCallback(
    async (paging: Paging): Promise<PaginatedResponse<newnewapi.IUser>> => {
      if (!user.userData?.userUuid) {
        return {
          nextData: [],
          nextPageToken: undefined,
        };
      }

      const payload = new newnewapi.SearchCreatorsRequest({
        query: searchValue,
        paging,
        filter: newnewapi.SearchCreatorsRequest.Filter.OFFERS_BUNDLES,
      });

      const res = await searchCreators(payload);

      if (!res.data || res.error) {
        showErrorToastPredefined(undefined);
        throw new Error(res.error?.message ?? 'Request failed');
      }

      // Do not pass data about creator themselves to pagination controller
      const filteredData = res.data.creators.filter(
        (creator) => creator.uuid !== user.userData?.userUuid
      );

      return {
        nextData: filteredData,
        nextPageToken: res.data.paging?.nextPageToken,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchValue, user.userData?.userUuid]
  );

  const paginatedCreators = usePagination(loadCreatorsData, 10);
  // Quick fix for sorting creators with bundles
  // TODO: add sorting and filtering options on BE
  const sortedCreators = useMemo(
    () =>
      paginatedCreators.data.sort((a, b) => {
        const aBundle = bundles?.find(
          (bundle) => bundle.creator?.uuid === a.uuid
        );
        const bBundle = bundles?.find(
          (bundle) => bundle.creator?.uuid === b.uuid
        );
        if (aBundle && !bBundle) {
          return -1;
        }

        if (!aBundle && bBundle) {
          return 1;
        }
        return 0;
      }),
    [paginatedCreators, bundles]
  );

  const buyBundleAfterStripeRedirect = useCallback(async () => {
    if (!stripeSetupIntentClientSecret) {
      return;
    }

    if (!user._persist?.rehydrated) {
      return;
    }

    if (!user.loggedIn) {
      router.push(
        `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${stripeSetupIntentClientSecret}`
      );
      return;
    }

    Mixpanel.track('BuyBundleAfterStripeRedirect');

    try {
      const stripeContributionRequest = new newnewapi.StripeContributionRequest(
        {
          stripeSetupIntentClientSecret,
          saveCard,
        }
      );

      // Reset
      setStripeSetupIntentClientSecret(undefined);
      setSaveCard(undefined);

      const res = await buyCreatorsBundle(stripeContributionRequest);
      if (
        !res.data ||
        res.error ||
        res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
      ) {
        throw new Error(res.error?.message ?? t('error.requestFailed'));
      }
    } catch (err: any) {
      console.error(err);
      showErrorToastCustom(err.message);
    } finally {
      router.replace('/bundles');
    }
  }, [
    stripeSetupIntentClientSecret,
    user._persist?.rehydrated,
    user.loggedIn,
    router,
    saveCard,
    t,
    showErrorToastCustom,
  ]);

  useEffectOnce(() => {
    if (stripeSetupIntentClientSecret) {
      buyBundleAfterStripeRedirect();
    }
  });

  useEffect(() => {
    if (
      (!user.loggedIn && user._persist?.rehydrated) ||
      (bundles?.length === 0 && !stripeSetupIntentClientSecretFromRedirect)
    ) {
      router.replace('/');
    }
  }, [
    stripeSetupIntentClientSecretFromRedirect,
    user.loggedIn,
    user._persist?.rehydrated,
    bundles,
    router,
    buyBundleAfterStripeRedirect,
  ]);

  useEffect(() => {
    if (inView) {
      paginatedCreators.loadMore().catch((e) => console.error(e));
    }
  }, [inView, paginatedCreators]);

  useEffect(() => {
    if (!searchContainerRef.current) {
      return;
    }

    const scrollable =
      searchContainerRef.current.scrollHeight >
      searchContainerRef.current.clientHeight;
    const scrolledToTheBottom =
      searchContainerRef.current.scrollTop >=
      searchContainerRef.current.scrollHeight -
        searchContainerRef.current.clientHeight;

    if (scrollable && !scrolledToTheBottom) {
      setShadeVisible(true);
    } else {
      setShadeVisible(false);
    }
  }, [searchContainerRef, paginatedCreators.data]);

  const visibleBundlesNumber = isMobile || isTablet ? 3 : 4;

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <Container>
        <SAnimationContainer>
          <SAnimationBackground src={assets.common.vote} alt='vote' />
          <SubNavigation>
            {isMobile ? (
              <SBackButton onClick={() => router.back()} />
            ) : (
              <GoBackButton longArrow onClick={() => router.back()}>
                {t('button.back')}
              </GoBackButton>
            )}
          </SubNavigation>
          <STitle>{t('header.title')}</STitle>

          <SBundlesTitle>
            <SectionTitle>{t('bundlesSection.title')}</SectionTitle>
            {bundles && bundles.length > visibleBundlesNumber && (
              <SSeeAllButton
                onClick={() => {
                  setAllBundlesModalOpen(true);
                }}
              >
                {t('bundlesSection.seeAll')}
              </SSeeAllButton>
            )}
          </SBundlesTitle>
          <SBundlesContainer>
            {bundles &&
              bundles
                .slice(0, visibleBundlesNumber)
                .map((bundle, index) => (
                  <BundleCard key={index} creatorBundle={bundle} />
                ))}

            {!isMobile &&
              bundles &&
              [
                ...Array(Math.max(visibleBundlesNumber - bundles.length, 0)),
              ].map((v, index) => <BundleCard key={`${index}-holder`} />)}
          </SBundlesContainer>
        </SAnimationContainer>
        <SectionTitle>{t('search.title')}</SectionTitle>
        <SInputWrapper>
          <SLeftInlineSVG
            svg={searchIcon}
            fill={
              searchValue
                ? theme.colorsThemed.text.secondary
                : theme.colorsThemed.text.quaternary
            }
            width={isMobile ? '20px' : '24px'}
            height={isMobile ? '20px' : '24px'}
          />
          <SInput
            value={searchValue}
            onChange={(e: any) => {
              setSearchValue(e.target.value);
            }}
            placeholder={t('search.searchInputPlaceholder')}
          />
          <SRightInlineSVG
            clickable
            svg={closeIcon}
            fill={theme.colorsThemed.text.secondary}
            width={isMobile ? '20px' : '24px'}
            height={isMobile ? '20px' : '24px'}
            visible={searchValue !== ''}
            onClick={() => {
              setSearchValue('');
            }}
          />
        </SInputWrapper>
        <SSearchResultsTitle>
          {searchValue !== ''
            ? t('search.resultsFor')
            : t('search.topCreators')}
          {searchValue !== '' ? <SQuerySpan>{searchValue}</SQuerySpan> : null}
        </SSearchResultsTitle>
        <SCardsSection>
          <SCardsSectionContent
            ref={(e) => {
              if (e) {
                searchContainerRef.current = e;
              }
            }}
            onScroll={(e: any) => {
              const scrollable = e.target.scrollHeight > e.target.clientHeight;
              const scrolledToTheBottom =
                e.target.scrollTop >=
                e.target.scrollHeight - e.target.clientHeight;
              setShadeVisible(scrollable && !scrolledToTheBottom);
            }}
          >
            {/* Changes in number of Creators in the search result causes change in page height (Fix?) */}
            {/* TODO: add no results message (otherwise there is an empty space) */}
            <CreatorsList
              loading={paginatedCreators.loading}
              collection={sortedCreators}
              onBuyBundleClicked={(creator) => {
                const creatorsBundle = bundles?.find(
                  (bundle) => bundle.creator?.uuid === creator.uuid
                );

                if (creatorsBundle) {
                  setShownCreatorBundle(creatorsBundle);
                } else {
                  setOfferedCreator(creator);
                }
              }}
            />
            {paginatedCreators.data.length > 0 &&
              paginatedCreators.hasMore &&
              !paginatedCreators.loading && (
                <SRef ref={loadingRef}>Loading...</SRef>
              )}
          </SCardsSectionContent>
          <SBottomShade visible={shadeVisible} />
        </SCardsSection>
      </Container>
      {bundles && (
        <AllBundlesModal
          show={allBundlesModalOpen}
          creatorBundles={bundles}
          onClose={() => {
            setAllBundlesModalOpen(false);
          }}
        />
      )}
      {offeredCreator && (
        <BuyBundleModal
          show
          creator={offeredCreator}
          onClose={() => {
            setOfferedCreator(undefined);
            setShownCreatorBundle(undefined);
          }}
        />
      )}
      {shownCreatorBundle && (
        <CreatorsBundleModal
          show
          creatorBundle={shownCreatorBundle}
          onBuyMore={() => {
            setOfferedCreator(shownCreatorBundle.creator!);
          }}
          onClose={() => {
            setShownCreatorBundle(undefined);
          }}
        />
      )}
    </>
  );
};

(Bundles as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Bundles;

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-Bundles', 'modal-PaymentModal'],
    null,
    SUPPORTED_LANGUAGES
  );

  // eslint-disable-next-line camelcase
  const { setup_intent_client_secret, save_card } = context.query;

  return {
    props: {
      ...translationContext,
      // eslint-disable-next-line camelcase, object-shorthand
      ...(setup_intent_client_secret
        ? {
            stripeSetupIntentClientSecretFromRedirect:
              // eslint-disable-next-line camelcase
              setup_intent_client_secret,
          }
        : {}),
      // eslint-disable-next-line camelcase, object-shorthand
      ...(save_card
        ? {
            // eslint-disable-next-line camelcase
            saveCardFromRedirect: save_card === 'true',
          }
        : {}),
    },
  };
};

const Container = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 4px;
  padding-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    padding-top: 4px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 12px;
  }
`;

const SAnimationContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SAnimationBackground = styled(AnimatedBackground)`
  z-index: -1;
`;

const SubNavigation = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 40px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 96px;
  }
`;

const SBackButton = styled(BackButton)`
  margin-left: -8px;
`;

const STitle = styled.h1`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 40px;
  line-height: 48px;
  margin-bottom: 68px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 56px;
    line-height: 64px;
    margin-bottom: 84px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 72px;
    line-height: 86px;
  }
`;

const SBundlesTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

const SectionTitle = styled.h3`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  text-align: start;
  font-size: 24px;
  line-height: 32px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 32px;
    line-height: 40px;
    margin-bottom: 32px;
  }
`;

const SSeeAllButton = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  border-radius: 12px;
  padding: 4px 12px;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  }

  :active {
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

const SBundlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 256px;
  gap: 16px;
  margin-bottom: 64px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 84px;
  }
`;

const SInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
  background: ${({ theme }) => theme.colorsThemed.background.secondary};
  border-radius: 16px;
  width: 100%;
  margin-bottom: 48px;
  padding: 10px 12px;

  ${({ theme }) => theme.media.tablet} {
    padding: 20px 24px;
  }
`;

const SLeftInlineSVG = styled(InlineSvg)`
  min-width: 20px;
  min-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    min-width: 24px;
    min-height: 24px;
  }
`;

const SInput = styled.input`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  margin: 0 8px;
  outline: none;
  font-size: 14px;
  background: transparent;
  font-weight: 500;
  line-height: 20px;

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }
`;

const SRightInlineSVG = styled(InlineSvg)<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  min-width: 20px;
  min-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    min-width: 24px;
    min-height: 24px;
  }
`;

const SSearchResultsTitle = styled.h4`
  color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.text.primary
      : theme.colorsThemed.text.secondary};
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  text-align: 'start';
  margin-bottom: 24px;
`;

const SQuerySpan = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin-left: 6px;
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;

const SCardsSection = styled.div`
  position: relative;
  height: 600px;
  width: 100%;
  overflow: hidden;
`;

const SCardsSectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

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
`;

const SBottomShade = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 228px;

  // TODO: standardize
  background: ${({ theme }) => theme.gradients.listBottom.quaternary};
  transform: matrix(1, 0, 0, -1, 0, 0);
  z-index: 2;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s linear;
  pointer-events: none;
`;
