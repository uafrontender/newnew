/* eslint-disable react/no-array-index-key */
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import dateToTimestamp from '../utils/dateToTimestamp';
import { getMyBundles, getOfferedBundles } from '../api/endpoints/bundles';
import AllBundlesModal from '../components/molecules/bundles/AllBundlesModal';

const PHBundles = [
  new newnewapi.CreatorPack({
    creator: new newnewapi.User({
      uuid: '3d537e81-d2dc-4bb3-9698-39152a817ab5',
      avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
      nickname: 'CreatorDisplayName',
      username: 'username',
    }),
    pack: new newnewapi.Pack({
      accessExpiredAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
      votesLeft: 4,
    }),
  }),
  new newnewapi.CreatorPack({
    creator: new newnewapi.User({
      uuid: 'c82f8990-5ef3-4a6f-b289-b14117a1094a',
      avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
      nickname: 'CreatorDisplayName',
      username: 'username',
    }),
    pack: new newnewapi.Pack({
      accessExpiredAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
      votesLeft: 4200,
    }),
  }),
  new newnewapi.CreatorPack({
    creator: new newnewapi.User({
      uuid: 'b8ba2486-48d6-4c55-9cd7-a494d0b79f98',
      avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
      nickname: 'CreatorDisplayName',
      username: 'username',
    }),
    pack: new newnewapi.Pack({
      accessExpiredAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
      votesLeft: 4,
    }),
  }),
  new newnewapi.CreatorPack({
    creator: new newnewapi.User({
      uuid: '6702c9e9-9f53-4c98-85d7-d9ffa2f22599',
      avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
      nickname: 'CreatorDisplayName',
      username: 'username',
    }),
    pack: new newnewapi.Pack({
      accessExpiredAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
      votesLeft: 4,
    }),
  }),
  new newnewapi.CreatorPack({
    creator: new newnewapi.User({
      uuid: '6702c9e9-9f53-4c98-85d7-d9ffa2f22599',
      avatarUrl: 'https://www.w3schools.com/howto/img_avatar.png',
      nickname: 'CreatorDisplayName',
      username: 'username',
    }),
    pack: new newnewapi.Pack({
      accessExpiredAt: dateToTimestamp(new Date(Date.now() + 5356800000)),
      votesLeft: 4,
    }),
  }),
];

const OFFERED_BUNDLES: newnewapi.PackOffer[] = [
  new newnewapi.PackOffer({
    packUuid: '1',
    price: new newnewapi.MoneyAmount({ usdCents: 500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30,
  }),
  new newnewapi.PackOffer({
    packUuid: '2',
    price: new newnewapi.MoneyAmount({ usdCents: 2500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 2,
  }),
  new newnewapi.PackOffer({
    packUuid: '3',
    price: new newnewapi.MoneyAmount({ usdCents: 5000 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 3,
  }),

  new newnewapi.PackOffer({
    packUuid: '4',
    price: new newnewapi.MoneyAmount({ usdCents: 7500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 4,
  }),
];

export const Bundles = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Bundles');
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const [allBundlesModalOpen, setAllBundlesModalOpen] = useState(false);
  const [buyBundleCreator, setBuyBundleCreator] = useState<
    newnewapi.IUser | undefined
  >();
  const [offeredBundles, setOfferedBundles] = useState<newnewapi.IPackOffer[]>(
    []
  );
  const [bundles, setBundles] = useState<newnewapi.ICreatorPack[]>([]);

  const [searchValue, setSearchValue] = useState('');
  const { ref: loadingRef, inView } = useInView();
  const searchInputRef = useRef<HTMLInputElement>();

  const loadBundleOffers = useCallback(async () => {
    const payload = new newnewapi.EmptyRequest({});
    const res = await getOfferedBundles(payload);

    if (!res.data || res.error) {
      toast.error('toastErrors.generic');
      throw new Error(res.error?.message ?? 'Request failed');
    }

    setOfferedBundles(res.data.packOffers);
  }, []);

  useEffect(() => {
    // loadBundleOffers();
    setOfferedBundles(OFFERED_BUNDLES);
  }, [loadBundleOffers]);

  // TODO: Use paging
  const loadUserBundles = useCallback(async () => {
    const payload = new newnewapi.EmptyRequest({});

    const res = await getMyBundles(payload);

    if (!res.data || res.error) {
      toast.error('toastErrors.generic');
      throw new Error(res.error?.message ?? 'Request failed');
    }

    setBundles(res.data.creatorPacks);
  }, []);

  useEffect(() => {
    setBundles(PHBundles);
  }, [loadUserBundles]);

  const loadCreatorsData = useCallback(
    async (
      paging: Paging
    ): Promise<PaginatedResponse<newnewapi.ISearchCreatorsResultItem>> => {
      const payload = new newnewapi.SearchCreatorsRequest({
        query: searchValue,
        paging,
        expand: [newnewapi.SearchCreatorsRequest.Expand.PACKS],
        filter: newnewapi.SearchCreatorsRequest.Filter.OFFERS_PACKS,
      });

      const res = await searchCreators(payload);

      if (!res.data || res.error) {
        toast.error('toastErrors.generic');
        throw new Error(res.error?.message ?? 'Request failed');
      }

      return {
        nextData: res.data.creators,
        nextPageToken: res.data.paging?.nextPageToken,
      };
    },
    [searchValue]
  );

  const paginatedCreators = usePagination(loadCreatorsData, 10);

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
          {bundles.length > visibleBundlesNumber && (
            <SSeeAllButton
              onClick={() => {
                setAllBundlesModalOpen(true);
              }}
            >
              {t('bundlesSection.seeAll')}
            </SSeeAllButton>
          )}
        </SBundlesTitle>

        {bundles.length === 0 ? (
          <SNoBundlesContainer>
            <SNoBundlesImage />
            <SNoBundlesText>{t('bundlesSection.noBundles')}</SNoBundlesText>
            <SSearchButton
              onClick={() => {
                if (searchInputRef.current) {
                  searchInputRef.current.scrollIntoView({ block: 'center' });
                  searchInputRef.current.focus();
                }
              }}
            >
              {t('bundlesSection.search')}
            </SSearchButton>
          </SNoBundlesContainer>
        ) : (
          <SBundlesContainer>
            {bundles.slice(0, visibleBundlesNumber).map((bundle, index) => (
              <BundleCard key={`${index}`} creatorBundle={bundle} />
            ))}

            {!isMobile &&
              Array.from(
                'x'.repeat(Math.max(visibleBundlesNumber - bundles.length, 0))
              ).map((v, index) => <BundleCard key={`${index}-holder`} />)}
          </SBundlesContainer>
        )}

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
            ref={(element) => {
              if (element) {
                searchInputRef.current = element;
              }
            }}
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
      <AllBundlesModal
        show={allBundlesModalOpen}
        creatorBundles={bundles}
        onClose={() => {
          setAllBundlesModalOpen(false);
        }}
      />
      {buyBundleCreator && (
        <BuyBundleModal
          show
          creator={buyBundleCreator}
          offeredBundles={offeredBundles}
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

const SNoBundlesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 24px;
  border-radius: 16px;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.colorsThemed.tag.color.primary};
  margin-bottom: 64px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    margin-bottom: 84px;
  }
`;

const SNoBundlesImage = styled.img`
  height: 40px;
  width: 40px;

  margin-bottom: 16px;
  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 0px;
    margin-right: 16px;
  }
`;

const SNoBundlesText = styled.p`
  flex-grow: 1;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 600;
  text-align: center;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 0px;
    text-align: start;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const SSearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;

  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  padding: 8px 16px;
  min-width: 100%;

  color: ${({ theme }) => theme.colors.darkGray};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: transparent;

  cursor: pointer;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    min-width: 160px;
  }
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
