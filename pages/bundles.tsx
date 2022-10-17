/* eslint-disable react/no-array-index-key */
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-toastify';

import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import assets from '../constants/assets';
import GoBackButton from '../components/molecules/GoBackButton';
import { useAppSelector } from '../redux-store/store';
import InlineSvg from '../components/atoms/InlineSVG';
import searchIcon from '../public/images/svg/icons/outlined/Search.svg';
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
import { BundlesContext } from '../contexts/bundlesContext';

export const Bundles = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Bundles');
  const theme = useTheme();
  const { user, ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    ui.resizeMode
  );
  const isTablet = ['tablet'].includes(ui.resizeMode);

  const [allBundlesModalOpen, setAllBundlesModalOpen] = useState(false);
  const [buyBundleCreator, setBuyBundleCreator] = useState<
    newnewapi.IUser | undefined
  >();
  const { bundles } = useContext(BundlesContext);

  const [searchValue, setSearchValue] = useState('');
  const { ref: loadingRef, inView } = useInView();

  const loadCreatorsData = useCallback(
    async (paging: Paging): Promise<PaginatedResponse<newnewapi.IUser>> => {
      // TODO remove block
      return {
        nextData: [],
        nextPageToken: null,
      };

      const payload = new newnewapi.SearchCreatorsRequest({
        query: searchValue,
        paging,
        filter: newnewapi.SearchCreatorsRequest.Filter.OFFERS_BUNDLES,
      });

      const res = await searchCreators(payload);

      if (!res.data || res.error) {
        toast.error('toastErrors.generic');
        throw new Error(res.error?.message ?? 'Request failed');
      }

      /* return {
        nextData: res.data.creators,
        nextPageToken: res.data.paging?.nextPageToken,
      }; */
    },
    [searchValue]
  );

  const paginatedCreators = usePagination(loadCreatorsData, 10);

  useEffect(() => {
    if (
      (!user.loggedIn && user._persist?.rehydrated) ||
      bundles?.length === 0
    ) {
      router.replace('/');
    }
  }, [user.loggedIn, user._persist?.rehydrated, bundles, router]);

  useEffect(() => {
    if (inView && !paginatedCreators.loading && paginatedCreators.hasMore) {
      paginatedCreators.loadMore().catch((e) => console.error(e));
    }
  }, [inView, paginatedCreators]);

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
                <BundleCard key={`${index}`} creatorBundle={bundle} />
              ))}

          {!isMobile &&
            bundles &&
            Array.from(
              'x'.repeat(Math.max(visibleBundlesNumber - bundles.length, 0))
            ).map((v, index) => <BundleCard key={`${index}-holder`} />)}
        </SBundlesContainer>
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
        </SInputWrapper>
        <SearchResultsTitle>{t('search.resultsTitle')}</SearchResultsTitle>
        <SCardsSection>
          <CreatorsList
            loading={paginatedCreators.loading}
            collection={paginatedCreators.data}
            onBuyBundleClicked={(creator) => {
              setBuyBundleCreator(creator);
            }}
          />
        </SCardsSection>
        {paginatedCreators.hasMore && !paginatedCreators.loading && (
          <SRef ref={loadingRef}>Loading...</SRef>
        )}
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
      {buyBundleCreator && (
        <BuyBundleModal
          show
          creator={buyBundleCreator}
          onClose={() => {
            setBuyBundleCreator(undefined);
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
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Bundles',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 4px;

  ${({ theme }) => theme.media.tablet} {
    padding-top: 4px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 12px;
  }
`;

const SubNavigation = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 32px;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 96px;
  }
`;

const SBackButton = styled(BackButton)`
  margin-left: -8px;
`;

const STitle = styled.h1`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 32px;
  line-height: 40px;
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
  padding: 6.5px;

  ${({ theme }) => theme.media.tablet} {
    padding: 11px;
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
  line-height: 24px;

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
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

const SearchResultsTitle = styled.h4`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  text-align: 'start';
  margin-bottom: 24px;
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;
