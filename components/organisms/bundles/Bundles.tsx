/* eslint-disable react/no-array-index-key */
import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import assets from '../../../constants/assets';
import GoBackButton from '../../molecules/GoBackButton';
import { useAppSelector } from '../../../redux-store/store';
import InlineSvg from '../../atoms/InlineSVG';
import searchIcon from '../../../public/images/svg/icons/outlined/Search.svg';
import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import usePagination, {
  PaginatedResponse,
  Paging,
} from '../../../utils/hooks/usePagination';
import { searchCreators } from '../../../api/endpoints/search';
import BuyBundleModal from '../../molecules/bundles/BuyBundleModal';
import BundleCard from '../../molecules/bundles/BundleCard';
import BackButton from '../../molecules/profile/BackButton';
import AllBundlesModal from '../../molecules/bundles/AllBundlesModal';
import { useBundles } from '../../../contexts/bundlesContext';
import CreatorsBundleModal from '../../molecules/bundles/CreatorsBundleModal';
import AnimatedBackground from '../../atoms/AnimationBackground';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import BundleCreatorsList from '../../molecules/bundles/BundleCreatorsList';
import { useAppState } from '../../../contexts/appStateContext';
import MobileBundleCreatorsList from '../../molecules/bundles/MobileBundleCreatorsList';
import { Mixpanel } from '../../../utils/mixpanel';
import useGoBackOrRedirect from '../../../utils/useGoBackOrRedirect';

export const Bundles: React.FC = React.memo(() => {
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const { t } = useTranslation('page-Bundles');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const { showErrorToastPredefined } = useErrorToasts();

  const [allBundlesModalOpen, setAllBundlesModalOpen] = useState(false);
  const [shownCreatorBundle, setShownCreatorBundle] = useState<
    newnewapi.ICreatorBundle | undefined
  >();
  const [offeredCreator, setOfferedCreator] = useState<
    newnewapi.IUser | undefined
  >();
  const { bundles } = useBundles();

  const [searchValue, setSearchValue] = useState('');

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

      if (!res?.data || res.error) {
        showErrorToastPredefined(undefined);
        throw new Error(res?.error?.message ?? 'Request failed');
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
          <SAnimationBackground
            src={assets.common.vote}
            alt='vote'
            isCalculatedHeight
          />
          <SubNavigation>
            {isMobile ? (
              <SBackButton
                onClick={() => {
                  Mixpanel.track('Navigation Item Clicked', {
                    _stage: 'Bundles',
                    _button: 'Back button',
                    _component: 'Bundles',
                  });
                  goBackOrRedirect('/');
                }}
              />
            ) : (
              <GoBackButton
                longArrow
                onClick={() => {
                  goBackOrRedirect('/');
                  Mixpanel.track('Navigation Item Clicked', {
                    _stage: 'Bundles',
                    _button: 'Back button',
                    _component: 'Bundles',
                  });
                }}
              >
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
        {isMobile ? (
          <MobileBundleCreatorsList
            creators={sortedCreators}
            loading={paginatedCreators.loading}
            hasMore={paginatedCreators.hasMore}
            initialLoadDone={paginatedCreators.initialLoadDone}
            loadMore={() => {
              paginatedCreators.loadMore().catch((e) => console.error(e));
            }}
            onBundleClicked={(creator) => {
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
        ) : (
          <SBundleCreatorsList
            creators={sortedCreators}
            loading={paginatedCreators.loading}
            hasMore={paginatedCreators.hasMore}
            initialLoadDone={paginatedCreators.initialLoadDone}
            loadMore={() => {
              paginatedCreators.loadMore().catch((e) => console.error(e));
            }}
            onBundleClicked={(creator) => {
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
        )}
      </Container>
      {bundles && (
        <AllBundlesModal
          show={allBundlesModalOpen}
          modalType='initial'
          creatorBundles={bundles}
          onClose={() => {
            setAllBundlesModalOpen(false);
          }}
        />
      )}
      {offeredCreator && (
        <BuyBundleModal
          show
          modalType='following'
          creator={offeredCreator}
          successPath='/bundles'
          onClose={() => {
            setOfferedCreator(undefined);
            setShownCreatorBundle(undefined);
          }}
        />
      )}
      {shownCreatorBundle && (
        <CreatorsBundleModal
          show
          modalType={offeredCreator !== undefined ? 'covered' : 'initial'}
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
});

export default Bundles;

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

const SBundleCreatorsList = styled(BundleCreatorsList)`
  width: 100%;
  height: 600px;
`;
