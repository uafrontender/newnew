import React, { useState, useContext, useCallback, useEffect } from 'react';
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
import UserAvatar from '../components/molecules/UserAvatar';
import { useAppSelector } from '../redux-store/store';
import InlineSvg from '../components/atoms/InlineSVG';
import searchIcon from '../public/images/svg/icons/outlined/Search.svg';
import { PacksContext } from '../contexts/packsContext';
import CreatorsList from '../components/organisms/search/CreatorsList';
import usePagination, {
  PaginatedResponse,
  Paging,
} from '../utils/hooks/usePagination';
import { searchCreators } from '../api/endpoints/search';

export const Packs = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Packs');
  const theme = useTheme();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const [allPacksModalOpen, setAllPacksModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { packs } = useContext(PacksContext);
  const { ref: loadingRef, inView } = useInView();

  const loadData = useCallback(
    async (paging: Paging): Promise<PaginatedResponse<newnewapi.IUser>> => {
      const payload = new newnewapi.SearchCreatorsRequest({
        query: searchValue,
        paging,
        // TODO: add filter
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

  const { data, loading, hasMore, loadMore } = usePagination(loadData, 10);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      loadMore().catch((e) => console.error(e));
    }
  }, [inView, loading, hasMore, loadMore]);

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
          <GoBackButton longArrow onClick={() => router.back()}>
            {t('button.back')}
          </GoBackButton>
        </SubNavigation>
        <SHeader>
          <STitle>{t('header.title')}</STitle>
          <SDescription>{t('header.description')}</SDescription>
        </SHeader>

        <SPacksTitle>
          <SectionTitle>{t('packs.title')}</SectionTitle>
          <SSeeAllButton
            onClick={() => {
              setAllPacksModalOpen(true);
            }}
          >
            {t('packs.seeAll')}
          </SSeeAllButton>
        </SPacksTitle>
        <SPacksContainer>
          {packs.map((pack) => {
            const expiresAtTime =
              (pack.subscriptionExpiresAt!.seconds as number) * 1000;
            const timeLeft = expiresAtTime - Date.now();
            const daysLeft = timeLeft / 1000 / 60 / 60 / 24;
            const monthsLeft = Math.floor(daysLeft / 30);

            return (
              <SPackContainer>
                <SUserInfo>
                  <UserAvatar
                    avatarUrl={pack.creator?.avatarUrl || undefined}
                  />
                  <SUserData>
                    <SDisplayName>{pack.creator?.nickname}</SDisplayName>
                    <SUserName>{pack.creator?.username}</SUserName>
                  </SUserData>
                </SUserInfo>
                {/* TODO: add Trans */}
                <SVotesLeft>
                  {t('packs.votesLeft', { amount: pack.votesLeft })}
                </SVotesLeft>
                <SSubscriptionLeft>
                  {t('packs.chatAccessLeft', { amount: monthsLeft })}
                </SSubscriptionLeft>
              </SPackContainer>
            );
          })}

          {!isMobile &&
            Array.from('x'.repeat((isTablet ? 3 : 4) - packs.length)).map(
              () => <SPackContainer holder />
            )}
        </SPacksContainer>

        <SectionTitle>{t('search.title')}</SectionTitle>
        <SInputWrapper>
          <SLeftInlineSVG
            svg={searchIcon}
            fill={theme.colorsThemed.text.secondary}
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
          <CreatorsList loading={loading} collection={data} withPackOffer />
        </SCardsSection>
        {hasMore && !loading && <SRef ref={loadingRef}>Loading...</SRef>}
      </Container>
      {allPacksModalOpen && null /* TODO: Add modal */}
    </>
  );
};

(Packs as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Packs;

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Packs',
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
  margin-bottom: 96px;
`;

const SHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 84px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 60%;
  }
`;

const STitle = styled.h1`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 72px;
  line-height: 86px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 56px;
    line-height: 64px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 72px;
    line-height: 86px;
  }
`;

const SDescription = styled.h2`
  font-weight: 500;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  font-size: 24px;
  line-height: 32px;
`;

const SPacksTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

const SectionTitle = styled.h3`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 32px;
  line-height: 40px;
  text-align: 'start';
  margin-bottom: 32px;
`;

const SSeeAllButton = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  padding: 4px;
  cursor: pointer;
`;

const SPacksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  margin-bottom: 84px;
`;

const SPackContainer = styled.div<{ holder?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  border-radius: 16px;
  padding: 24px;
  max-width: 300px;
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};
  opacity: ${({ holder }) => (holder ? '0' : '1')};
`;

const SUserInfo = styled.div`
  display: flex;
  flex-direction: row;
`;

const SUserData = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 35px;
  margin-left: 12px;
`;

const SDisplayName = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 14px;
  line-height: 20px;

  margin-bottom: 5px;
`;

const SUserName = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 12px;
  line-height: 16px;
`;

const SVotesLeft = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 28px;
  line-height: 36px;
`;

const SSubscriptionLeft = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 14px;
  line-height: 20px;
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
    color: ${(props) => props.theme.colorsThemed.text.secondary};
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
