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

import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import searchIcon from '../../../public/images/svg/icons/outlined/Search.svg';
import PopularCreatorsResults from './PopularCreatorsResults';
import Button from '../Button';
import Lottie from '../Lottie';
import NoResults from './NoResults';
import PopularTagsResults from './PopularTagsResults';
import getChunks from '../../../utils/getChunks/getChunks';
import { useOverlayMode } from '../../../contexts/overlayModeContext';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import { Mixpanel } from '../../../utils/mixpanel';
import getClearedSearchQuery from '../../../utils/getClearedSearchQuery';
import useDebouncedValue from '../../../utils/hooks/useDebouncedValue';
import { useAppState } from '../../../contexts/appStateContext';

const SearchInput: React.FC = React.memo(() => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { enableOverlayMode, disableOverlayMode } = useOverlayMode();
  const { showErrorToastPredefined } = useErrorToasts();

  const inputRef: any = useRef();
  const inputContainerRef: any = useRef();
  const resultsContainerRef: any = useRef();
  const [searchValue, setSearchValue] = useState('');
  const [inputRightPosition, setInputRightPosition] = useState(0);
  const [isResultsDropVisible, setIsResultsDropVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [resultsPosts, setResultsPosts] = useState<newnewapi.IPost[]>([]);
  const [resultsCreators, setResultsCreators] = useState<newnewapi.IUser[]>([]);
  const [resultsHashtags, setResultsHashtags] = useState<newnewapi.IHashtag[]>(
    []
  );

  const { globalSearchActive } = useAppSelector((state) => state.ui);
  const { resizeMode } = useAppState();
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

  const isSmallDesktop = ['laptop'].includes(resizeMode);

  const pushRouteOrClose = useCallback(
    (path: string) => {
      if (router.asPath === path) {
        setSearchValue('');
        setIsResultsDropVisible(false);
        dispatch(setGlobalSearchActive(false));
      } else {
        router.push(path);
      }
    },
    [router, dispatch]
  );

  const handleSeeResults = (query: string) => {
    Mixpanel.track('Search All Results Clicked', {
      _query: query,
    });

    const clearedQuery = query.replace(/^#+/, '#');

    const chunks = getChunks(clearedQuery);
    const firstChunk = chunks[0];
    const isHashtag = chunks.length === 1 && firstChunk.type === 'hashtag';

    if (isHashtag) {
      pushRouteOrClose(`/search?query=${firstChunk.text}&tab=posts`);
    } else {
      const noHashQuery = clearedQuery.replace('#', '');
      const encodedQuery = encodeURIComponent(noHashQuery);
      if (resultsPosts.length === 0 && resultsCreators.length > 0) {
        pushRouteOrClose(`/search?query=${encodedQuery}&tab=creators`);
      } else {
        pushRouteOrClose(`/search?query=${encodedQuery}&tab=posts`);
      }
    }
  };

  const handleSearchClick = useCallback(() => {
    Mixpanel.track('Search Clicked');
    dispatch(setGlobalSearchActive(!globalSearchActive));
  }, [dispatch, globalSearchActive]);

  const handleSearchClose = useCallback(() => {
    Mixpanel.track('Search Closed');

    setSearchValue('');
    setIsResultsDropVisible(false);
    dispatch(setGlobalSearchActive(false));
  }, [dispatch]);

  const handleInputChange = (e: any) => {
    // TODO: create util for spaces handle
    const onlySpacesRegex = /^\s+$/;

    if (onlySpacesRegex.test(e.target.value)) {
      setSearchValue('');
    } else {
      setSearchValue(e.target.value);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 27) {
      handleSearchClose();
    }

    const clearedSearchValue = getClearedSearchQuery(searchValue);
    if (e.keyCode === 13 && clearedSearchValue.length > 1) {
      handleSeeResults(clearedSearchValue);
      closeSearch();
    }
  };

  const handleSubmit = () => {};
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

  const handleClickOutside = useCallback(() => {
    if (!isMobileOrTablet) {
      handleSearchClose();
    }
  }, [isMobileOrTablet, handleSearchClose]);

  useOnClickOutside(
    [inputContainerRef, resultsContainerRef],
    handleClickOutside
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (globalSearchActive) {
      timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 1000);
    } else {
      inputRef.current?.blur();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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
      if (!res?.data || res.error) {
        throw new Error(res?.error?.message ?? 'Request failed');
      }

      if (res.data.creators) {
        setResultsCreators(res.data.creators);
      }

      if (res.data.posts) {
        setResultsPosts(res.data.posts);
      }

      if (res.data.hashtags) {
        setResultsHashtags(res.data.hashtags);
      }

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
    } else {
      setIsResultsDropVisible(false);
      resetResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue, isMobileOrTablet]);

  const closeSearch = useCallback(() => {
    handleSearchClose();
    setSearchValue('');
    setIsResultsDropVisible(false);
    resetResults();
  }, [handleSearchClose]);

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
      >
        <SInputWrapper
          active={globalSearchActive}
          onClick={globalSearchActive ? () => {} : handleSearchClick}
          rightPosition={inputRightPosition}
        >
          <SLeftInlineSVG
            clickable
            svg={searchIcon}
            fill={theme.colorsThemed.text.primary}
            width={isMobile ? '20px' : '24px'}
            height={isMobile ? '20px' : '24px'}
            onClick={globalSearchActive ? handleSubmit : handleSearchClick}
          />
          <SInput
            ref={inputRef}
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              !isMobile && !isSmallDesktop
                ? t('search.placeholderLong')
                : t('search.placeholder')
            }
          />
        </SInputWrapper>
        {!isMobileOrTablet && isResultsDropVisible && (
          <SResultsDrop ref={resultsContainerRef}>
            {resultsPosts.length === 0 &&
            resultsCreators.length === 0 &&
            resultsHashtags.length === 0 ? (
              !isLoading ? (
                <SNoResults>
                  <NoResults closeDrop={handleCloseIconClick} />
                </SNoResults>
              ) : (
                <SBlock>
                  <Lottie
                    width={64}
                    height={64}
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: loadingAnimation,
                    }}
                  />
                </SBlock>
              )
            ) : (
              <div>
                {resultsCreators.length > 0 && (
                  <PopularCreatorsResults
                    creators={resultsCreators}
                    onSelect={closeSearch}
                  />
                )}
                {resultsHashtags.length > 0 && (
                  <PopularTagsResults
                    hashtags={resultsHashtags}
                    onSelect={closeSearch}
                  />
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
        <SResultsDropMobile ref={resultsContainerRef}>
          {resultsPosts.length === 0 &&
          resultsCreators.length === 0 &&
          resultsHashtags.length === 0 ? (
            !isLoading ? (
              <SNoResults>
                <NoResults closeDrop={handleCloseIconClick} />
              </SNoResults>
            ) : (
              <SBlock>
                <Lottie
                  width={64}
                  height={64}
                  options={{
                    loop: true,
                    autoplay: true,
                    animationData: loadingAnimation,
                  }}
                />
              </SBlock>
            )
          ) : (
            <div>
              {resultsCreators.length > 0 && (
                <PopularCreatorsResults
                  creators={resultsCreators}
                  onSelect={closeSearch}
                />
              )}
              {resultsHashtags.length > 0 && (
                <PopularTagsResults
                  hashtags={resultsHashtags}
                  onSelect={closeSearch}
                />
              )}
              <SButton
                onClick={() => {
                  const clearedSearchValue = getClearedSearchQuery(searchValue);
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
});

SearchInput.defaultProps = {
  fixed: false,
};

export default SearchInput;

const SContainer = styled.div<{
  active: boolean;
}>`
  width: 36px;
  height: 36px;
  position: relative;

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
      : null}

  ${({ theme }) => theme.media.tablet} {
    width: 48px;
    height: 48px;
  }
`;

// Desktop
const SResultsDrop = styled.div`
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  position: fixed;
  border-radius: 0;
  width: 100vw;
  height: calc(100vh - 112px);
  top: 56px;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;

  ${({ theme }) => theme.media.laptop} {
    position: absolute;
    padding: 16px;
    right: 0;
    width: 420px;
    margin-top: 0;
    border-radius: 16px;
    height: auto;
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
  overflow: auto;
  padding: 16px;

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
}

const SInputWrapper = styled.div<ISInputWrapper>`
  top: 50%;
  width: ${(props) => (props.active ? 'calc(100vw - 32px - 50px)' : '36px')};
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
  background: ${(props) =>
    props.theme.colorsThemed.background[
      props.active ? 'primary' : 'secondary'
    ]};
  border-radius: 12px;
  flex-direction: row;
  justify-content: space-between;
  z-index: 200;

  ${(props) =>
    !props.active &&
    css`
      cursor: pointer;
      background: ${props.active
        ? 'transparent'
        : props.theme.colorsThemed.button.background.quaternary};

      /* :hover {
        background: ${props.active
        ? 'transparent'
        : props.theme.colorsThemed.button.hover.quaternary};
      } */
    `}

  ${({ theme }) => theme.media.tablet} {
    width: ${(props) => (props.active ? 'calc(100vw - 60px - 50px)' : '48px')};
    padding: 11px;
    border-radius: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 0;
    width: ${(props) => (props.active ? '420px' : '48px')};

    background: '#E5E5E5';

    /* :hover {
      background: ${(props) =>
      props.active
        ? 'transparent'
        : props.theme.colorsThemed.button.hover.quaternary};
    } */
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

const SLeftInlineSVG = styled(InlineSVG)`
  min-width: 20px;
  min-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    min-width: 24px;
    min-height: 24px;
  }
`;

const SButton = styled(Button)`
  display: block;
  width: 100%;
`;

const SBlock = styled.section`
  height: 200px;
  display: flex;
  align-items: center;
`;

const SNoResults = styled.section`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
