/* eslint-disable no-nested-ternary */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import styled, { css, useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import InlineSVG from '../InlineSVG';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';

import { quickSearchPostsAndCreators } from '../../../api/endpoints/search';
import { setGlobalSearchActive } from '../../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import searchIcon from '../../../public/images/svg/icons/outlined/Search.svg';
import TopDecisionsResults from './TopDecisionsResults';
import PopularCreatorsResults from './PopularCreatorsResults';
import Button from '../Button';
import Lottie from '../Lottie';
import NoResults from './NoResults';

export const SearchInput: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const inputRef: any = useRef();
  const inputContainerRef: any = useRef();
  const [searchValue, setSearchValue] = useState('');
  const [inputRightPosition, setInputRightPosition] = useState(0);
  const [isResultsDropVisible, setIsResultsDropVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [resultsPosts, setResultsPosts] = useState<newnewapi.IPost[]>([]);
  const [resultsCreators, setResultsCreators] = useState<newnewapi.IUser[]>([]);

  const { resizeMode, globalSearchActive } = useAppSelector(
    (state) => state.ui
  );
  const router = useRouter();

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

  const handleSearchClick = useCallback(() => {
    dispatch(setGlobalSearchActive(!globalSearchActive));
  }, [dispatch, globalSearchActive]);
  const handleSearchClose = () => {
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
  };
  const handleSubmit = () => {};
  const handleCloseIconClick = () => {
    if (searchValue) {
      setSearchValue('');
    } else {
      handleSearchClose();
    }
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
  };

  async function getQuickSearchResult(query: string) {
    try {
      setIsLoading(true);
      const payload = new newnewapi.QuickSearchPostsAndCreatorsRequest({
        query,
      });
      const res = await quickSearchPostsAndCreators(payload);
      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      if (res.data.creators) setResultsCreators(res.data.creators);
      if (res.data.posts) setResultsPosts(res.data.posts);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  }

  useEffect(() => {
    if (searchValue) {
      getQuickSearchResult(searchValue);
      setIsResultsDropVisible(true);
    } else if (!searchValue && !isMobileOrTablet) {
      setIsResultsDropVisible(false);
      resetResults();
    }
  }, [searchValue, isMobileOrTablet]);

  return (
    <>
      {isMobileOrTablet && globalSearchActive ? (
        <SCloseButtonMobile
          view="tertiary"
          iconOnly
          onClick={() => {
            handleSearchClose();
            setSearchValue('');
            setIsResultsDropVisible(false);
            resetResults();
          }}
        >
          <InlineSVG
            fill={theme.colorsThemed.text.primary}
            svg={closeIcon}
            width={isTablet ? '24px' : '20px'}
            height={isTablet ? '24px' : '20px'}
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
            placeholder="Titles, genres, people"
          />
          <SRightInlineSVG
            clickable
            svg={closeIcon}
            fill={theme.colorsThemed.text.primary}
            width={isMobile ? '20px' : '24px'}
            height={isMobile ? '20px' : '24px'}
            onClick={handleCloseIconClick}
          />
        </SInputWrapper>
        {!isMobileOrTablet && isResultsDropVisible && (
          <SResultsDrop>
            {resultsPosts.length === 0 && resultsCreators.length === 0 ? (
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
              <>
                {resultsPosts.length > 0 && (
                  <TopDecisionsResults posts={resultsPosts} />
                )}
                {resultsCreators.length > 0 && (
                  <PopularCreatorsResults creators={resultsCreators} />
                )}
                <SButton
                  onClick={() => {
                    router.push(`/search?query=${searchValue}`);
                  }}
                  view="quaternary"
                >
                  All results
                </SButton>
              </>
            )}
          </SResultsDrop>
        )}
      </SContainer>
      {isMobileOrTablet && isResultsDropVisible && (
        <SResultsDropMobile>
          {resultsPosts.length === 0 && resultsCreators.length === 0 ? (
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
            <>
              {resultsPosts.length > 0 && (
                <TopDecisionsResults posts={resultsPosts} />
              )}
              {resultsCreators.length > 0 && (
                <PopularCreatorsResults creators={resultsCreators} />
              )}
              <SButton
                onClick={() => {
                  router.push(`/search?query=${searchValue}`);
                }}
                view="quaternary"
              >
                All results
              </SButton>
            </>
          )}
        </SResultsDropMobile>
      )}
    </>
  );
};

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
  height: 100vh;
  top: 56px;
  padding: 16px;

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
  top: 10px;
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
  height: 100vh;
  top: 56px;
  left: 0;
  padding: 16px;

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
    padding: 10.5px;
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

const SRightInlineSVG = styled(InlineSVG)`
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
