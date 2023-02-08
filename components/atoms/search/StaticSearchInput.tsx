/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import styled, { css, useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import InlineSVG from '../InlineSVG';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';

import { quickSearch } from '../../../api/endpoints/search';
import { setGlobalSearchActive } from '../../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import searchIcon from '../../../public/images/svg/icons/outlined/Search.svg';
import TopDecisionsResults from './TopDecisionsResults';
import PopularCreatorsResults from './PopularCreatorsResults';
import Button from '../Button';
import NoResults from './NoResults';
import PopularTagsResults from './PopularTagsResults';
import getChunks from '../../../utils/getChunks/getChunks';
import { useOverlayMode } from '../../../contexts/overlayModeContext';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import { Mixpanel } from '../../../utils/mixpanel';
import Loader from '../Loader';
import useDebouncedValue from '../../../utils/hooks/useDebouncedValue';
import getClearedSearchQuery from '../../../utils/getClearedSearchQuery';

interface IStaticSearchInput {
  width?: string;
}

const StaticSearchInput: React.FC<IStaticSearchInput> = React.memo(
  ({ width }) => {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { enableOverlayMode, disableOverlayMode } = useOverlayMode();
    const { showErrorToastPredefined } = useErrorToasts();

    const inputRef: any = useRef();
    const inputContainerRef: any = useRef();
    const [searchValue, setSearchValue] = useState('');
    const [inputRightPosition, setInputRightPosition] = useState(0);
    const [isResultsDropVisible, setIsResultsDropVisible] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [resultsPosts, setResultsPosts] = useState<newnewapi.IPost[]>([]);
    const [resultsCreators, setResultsCreators] = useState<newnewapi.IUser[]>(
      []
    );
    const [resultsHashtags, setResultsHashtags] = useState<
      newnewapi.IHashtag[]
    >([]);

    const { resizeMode, globalSearchActive } = useAppSelector(
      (state) => state.ui
    );
    const router = useRouter();

    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isMobileOrTablet = [
      'mobile',
      'mobileS',
      'mobileM',
      'mobileL',
      'tablet',
    ].includes(resizeMode);

    const handleSeeResults = (query: string) => {
      Mixpanel.track('Search All Results Clicked', {
        _query: query,
      });

      const chunks = getChunks(query);
      const firstChunk = chunks[0];
      const isHashtag = chunks.length === 1 && firstChunk.type === 'hashtag';

      if (isHashtag) {
        router.push(`/search?query=${firstChunk.text}&type=hashtags&tab=posts`);
      } else {
        const clearedQuery = encodeURIComponent(query);
        if (resultsPosts.length === 0 && resultsCreators.length > 0) {
          router.push(`/search?query=${clearedQuery}&tab=creators`);
        } else {
          router.push(`/search?query=${clearedQuery}&tab=posts`);
        }
      }
    };

    const handleSearchClick = useCallback(() => {
      Mixpanel.track('Search Clicked');
      dispatch(setGlobalSearchActive(!globalSearchActive));
    }, [dispatch, globalSearchActive]);

    const handleSearchClose = () => {
      Mixpanel.track('Search Closed');

      setSearchValue('');
      dispatch(setGlobalSearchActive(false));
    };

    const handleInputChange = (e: any) => {
      setSearchValue(e.target.value);
    };

    const handleKeyDown = (e: any) => {
      if (e.keyCode === 27) {
        handleSearchClose();
      }

      const clearedSearchValue = getClearedSearchQuery(searchValue);
      if (e.keyCode === 13 && clearedSearchValue) {
        handleSeeResults(clearedSearchValue);
        closeSearch();
      }
    };

    const handleCloseIconClick = () => {
      setSearchValue('');
      handleSearchClose();
      setIsResultsDropVisible(false);
    };

    useOnClickEsc(inputContainerRef, () => {
      if (globalSearchActive && !isMobileOrTablet) {
        handleSearchClose();
      }
    });
    useOnClickOutside(inputContainerRef, () => {
      if (globalSearchActive && !isMobileOrTablet) {
        handleSearchClose();
      }
    });

    useEffect(() => {
      setTimeout(() => {
        if (globalSearchActive) {
          inputRef.current?.focus();
        } else {
          inputRef.current?.blur();
        }
      }, 1000);
    }, [globalSearchActive]);

    useEffect(() => {
      const resizeObserver = new ResizeObserver(() => {
        // eslint-disable-next-line max-len
        setInputRightPosition(
          -(
            window.innerWidth -
            (inputContainerRef.current?.getBoundingClientRect()?.right || 0) -
            (isMobile ? 16 : 32)
          )
        );
      });

      resizeObserver.observe(document.body);

      return () => {
        resizeObserver.disconnect();
      };
    }, [isMobile]);

    const resetResults = () => {
      setResultsCreators([]);
      setResultsPosts([]);
      setResultsHashtags([]);
    };

    const quickSearchAbortControllerRef = useRef<AbortController | undefined>();

    async function getQuickSearchResult(query: string) {
      try {
        if (quickSearchAbortControllerRef.current) {
          quickSearchAbortControllerRef.current?.abort();
        }
        quickSearchAbortControllerRef.current = new AbortController();

        setIsLoading(true);
        const payload = new newnewapi.QuickSearchRequest({
          query,
        });

        const res = await quickSearch(
          payload,
          quickSearchAbortControllerRef?.current?.signal
        );
        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data.creators) setResultsCreators(res.data.creators);
        if (res.data.posts) setResultsPosts(res.data.posts);
        if (res.data.hashtags) setResultsHashtags(res.data.hashtags);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        showErrorToastPredefined(undefined);
      }
    }

    const debouncedSearchValue = useDebouncedValue(searchValue, 500);

    useEffect(() => {
      const clearedSearchValue = getClearedSearchQuery(debouncedSearchValue);
      if (clearedSearchValue?.length > 1) {
        getQuickSearchResult(clearedSearchValue);
        setIsResultsDropVisible(true);
      } else if (
        (!clearedSearchValue || clearedSearchValue.length === 1) &&
        !isMobileOrTablet
      ) {
        setIsResultsDropVisible(false);
        resetResults();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchValue, isMobileOrTablet]);

    function closeSearch() {
      handleSearchClose();
      setSearchValue('');
      setIsResultsDropVisible(false);
      resetResults();
    }

    useEffect(() => {
      if (isMobileOrTablet && isResultsDropVisible) {
        enableOverlayMode();
      }

      return () => {
        disableOverlayMode();
      };
    }, [
      isMobileOrTablet,
      isResultsDropVisible,
      enableOverlayMode,
      disableOverlayMode,
    ]);

    return (
      <>
        {isMobileOrTablet && globalSearchActive ? (
          <SCloseButtonMobile
            view='tertiary'
            iconOnly
            onClick={() => {
              closeSearch();
            }}
          >
            <InlineSVG
              fill={theme.colorsThemed.text.primary}
              svg={closeIcon}
              width='24px'
              height='24px'
            />
          </SCloseButtonMobile>
        ) : null}
        <SContainer
          ref={inputContainerRef}
          active={isMobileOrTablet && globalSearchActive}
          width={width}
        >
          <SInputWrapper
            active={globalSearchActive}
            onClick={globalSearchActive ? () => {} : handleSearchClick}
            rightPosition={inputRightPosition}
            width={width}
          >
            <SSearchIcon
              svg={searchIcon}
              fill={
                theme.name === 'dark'
                  ? theme.colorsThemed.text.primary
                  : theme.colorsThemed.background.outlines2
              }
              width={isMobile ? '20px' : '24px'}
              height={isMobile ? '20px' : '24px'}
            />
            <SInput
              ref={inputRef}
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
            />
          </SInputWrapper>

          {!isMobileOrTablet && isResultsDropVisible && (
            <SResultsDrop>
              {(resultsPosts.length === 0 &&
                resultsCreators.length === 0 &&
                resultsHashtags.length === 0) ||
              isLoading ? (
                !isLoading ? (
                  <SNoResults>
                    <NoResults closeDrop={handleCloseIconClick} />
                  </SNoResults>
                ) : (
                  <SBlock>
                    <Loader size='md' />
                  </SBlock>
                )
              ) : (
                <div
                  onClick={() => {
                    closeSearch();
                  }}
                >
                  {resultsPosts.length > 0 && (
                    <TopDecisionsResults posts={resultsPosts} />
                  )}
                  {resultsCreators.length > 0 && (
                    <PopularCreatorsResults creators={resultsCreators} />
                  )}
                  {resultsHashtags.length > 0 && (
                    <PopularTagsResults hashtags={resultsHashtags} />
                  )}
                  <SButton
                    onClick={() => {
                      const clearedSearchValue =
                        getClearedSearchQuery(searchValue);
                      if (clearedSearchValue) {
                        handleSeeResults(clearedSearchValue);
                      }
                    }}
                    view='quaternary'
                  >
                    {t('search.allResults')}
                  </SButton>
                </div>
              )}
            </SResultsDrop>
          )}
        </SContainer>
        {isMobileOrTablet && isResultsDropVisible && (
          <SResultsDropMobile>
            {resultsPosts.length === 0 &&
            resultsCreators.length === 0 &&
            resultsHashtags.length === 0 ? (
              !isLoading ? (
                <SNoResults>
                  <NoResults closeDrop={handleCloseIconClick} />
                </SNoResults>
              ) : (
                <SBlock>
                  <Loader size='md' />
                </SBlock>
              )
            ) : (
              <div onClick={() => closeSearch()}>
                {resultsPosts.length > 0 && (
                  <TopDecisionsResults posts={resultsPosts} />
                )}
                {resultsCreators.length > 0 && (
                  <PopularCreatorsResults creators={resultsCreators} />
                )}
                {resultsHashtags.length > 0 && (
                  <PopularTagsResults hashtags={resultsHashtags} />
                )}
                <SButton
                  onClick={() => {
                    const clearedSearchValue =
                      getClearedSearchQuery(searchValue);
                    if (clearedSearchValue) {
                      handleSeeResults(clearedSearchValue);
                    }
                  }}
                  view='quaternary'
                >
                  {t('search.allResults')}
                </SButton>
              </div>
            )}
          </SResultsDropMobile>
        )}
      </>
    );
  }
);

StaticSearchInput.defaultProps = {
  width: undefined,
};

export default StaticSearchInput;

const SContainer = styled.div<{
  active: boolean;
  width?: string;
}>`
  position: relative;
  width: ${({ width, active }) => (active ? 'unset' : width || '40vw')};
  height: 36px;

  ${({ active }) =>
    active
      ? css`
          &:before {
            position: absolute;
            left: -100vw;

            width: 100vw;
            height: 36px;

            content: '';
            background: ${({ theme }) => theme.colorsThemed.background.primary};

            ${({ theme }) => theme.media.tablet} {
              height: 48px;
            }
          }
        `
      : null};

  ${({ theme }) => theme.media.mobileM} {
    width: ${({ width, active }) => (active ? 'unset' : width || '60vw')};
  }

  ${({ theme }) => theme.media.tablet} {
    width: ${({ width, active }) => (active ? 'unset' : width || '300px')};
    height: 48px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: ${({ width, active }) => (active ? 'unset' : width || '364px')};
  }
`;

// Desktop
const SResultsDrop = styled.div`
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  position: fixed;
  border-radius: 0;
  width: 100vw;
  max-height: calc(100vh - 112px);
  height: auto;
  top: 56px;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.media.laptop} {
    position: absolute;
    padding: 16px;
    left: 0;
    width: 420px;
    margin-top: 0;
    border-radius: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 364px;
  }
`;

// Mobile
const SCloseButtonMobile = styled(Button)`
  position: absolute;
  left: 0;
  top: 8px;
  z-index: 1;

  padding: 8px;

  border-radius: 12px;
  background: ${({ theme }) => theme.colorsThemed.background.tertiary};

  ${({ theme }) => theme.media.tablet} {
    width: 48px;
    height: 48px;

    top: 12px;
    left: 2vw;

    border-radius: 16px;
  }
`;

const SResultsDropMobile = styled.div`
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  position: fixed;
  border-radius: 0;
  width: 100vw;
  height: fill-available;
  top: 56px;
  left: 0;
  padding: 16px;
  overflow: auto;

  @supports (-webkit-touch-callout: none) {
    /* CSS specific to iOS devices */
    padding-bottom: 32px;
  }

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
    padding: 16px 48px;
    top: 64px;
  }
`;

interface ISInputWrapper {
  active: boolean;
  onClick: () => void;
  rightPosition: number;
  width?: string;
}

export const SInputWrapper = styled.label<ISInputWrapper>`
  top: 50%;
  /* left: ${(props) => (props.active ? 'calc(-50% + 41px)' : '0')}; */
  width: ${(props) =>
    props.active ? 'calc(100vw - 40px - 32px - 16px)' : props.width || '40vw'};
  right: ${(props) => (props.active ? props.rightPosition : 0)}px;
  border: 1.5px solid
    ${(props) =>
      props.active
        ? props.theme.colorsThemed.background.outlines2
        : 'transparent'};

  z-index: 3;
  padding: 6.5px;
  display: flex;
  overflow: hidden;
  position: absolute;
  transform: translateY(-50%);
  max-height: 100%;
  transition: all ease 0.5s;

  background: ${({ theme, active }) =>
    active
      ? theme.colorsThemed.background.primary
      : theme.colorsThemed.button.background.secondary};

  border-radius: 12px;
  flex-direction: row;
  justify-content: space-between;
  z-index: 200;

  ${({ theme }) => theme.media.mobileM} {
    width: ${(props) =>
      props.active
        ? 'calc(100vw - 40px - 32px - 16px)'
        : props.width || '60vw'};
  }

  ${({ theme }) => theme.media.tablet} {
    width: ${(props) =>
      props.active
        ? 'calc(100vw - 32px - 48px - 32px)'
        : props.width || '300px'};
    padding: 11px 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 0;
    width: ${({ width }) => width || '364px'};
  }

  ${({ theme, active }) =>
    active
      ? css`
          & svg {
            fill: ${theme.colorsThemed.text.secondary};
          }
        `
      : null};
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

const SButton = styled(Button)`
  display: block;
  width: 100%;
`;

const SBlock = styled.section`
  height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SNoResults = styled.section`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SSearchIcon = styled(InlineSVG)`
  width: 24;
`;
