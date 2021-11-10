import React, { useRef, useState, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';

import Button from './Button';
import InlineSVG from './InlineSVG';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import { setGlobalSearchActive } from '../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';
import searchIcon from '../../public/images/svg/icons/outlined/Search.svg';

interface ISearchInput {}

export const SearchInput: React.FC<ISearchInput> = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const inputRef: any = useRef();
  const [searchValue, setSearchValue] = useState('');
  const {
    resizeMode,
    globalSearchActive,
  } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleSearchClick = useCallback(() => {
    dispatch(setGlobalSearchActive(!globalSearchActive));
  }, [dispatch, globalSearchActive]);
  const handleSearchClose = () => {
    setSearchValue('');
    dispatch(setGlobalSearchActive(false));
  };
  const handleInoutChange = (e: any) => {
    setSearchValue(e.target.value);
  };
  const handleKeyDown = (e: any) => {
    if (e.keyCode === 27) {
      handleSearchClose();
    }
  };
  const handleSubmit = () => {
  };
  const handleCloseIconClick = () => {
    if (searchValue) {
      setSearchValue('');
    } else {
      handleSearchClose();
    }
  };

  useOnClickEsc(inputRef, () => {
    if (globalSearchActive) {
      handleSearchClose();
    }
  });
  useOnClickOutside(inputRef, () => {
    if (globalSearchActive) {
      handleSearchClose();
    }
  });

  return (
    <SContainer ref={inputRef}>
      <Button
        iconOnly
        view="secondary"
        onClick={handleSearchClick}
      >
        <InlineSVG
          svg={searchIcon}
          fill={theme.colorsThemed.text.primary}
          width={isMobile ? '20px' : '24px'}
          height={isMobile ? '20px' : '24px'}
        />
      </Button>
      {globalSearchActive && (
        <SInputWrapper>
          <InlineSVG
            clickable
            svg={searchIcon}
            fill={theme.colorsThemed.text.primary}
            width="24px"
            height="24px"
            onClick={handleSubmit}
          />
          <SInput
            autoFocus
            value={searchValue}
            onChange={handleInoutChange}
            onKeyDown={handleKeyDown}
            placeholder="Titles, genres, people"
          />
          <InlineSVG
            clickable
            svg={closeIcon}
            fill={theme.colorsThemed.text.primary}
            width="24px"
            height="24px"
            onClick={handleCloseIconClick}
          />
        </SInputWrapper>
      )}
    </SContainer>
  );
};

SearchInput.defaultProps = {
  fixed: false,
};

export default SearchInput;

const SContainer = styled.div`
  ${({ theme }) => theme.media.laptop} {
    position: relative;
  }
`;

const SInputWrapper = styled.div<ISearchInput>`
  top: 50%;
  left: 0;
  right: 0;
  border: 1.5px solid ${(props) => props.theme.colorsThemed.grayscale.outlines2};
  z-index: 3;
  padding: 8px 12px;
  display: flex;
  position: absolute;
  transform: translateY(-50%);
  background: ${(props) => props.theme.colorsThemed.grayscale.background1};
  border-radius: 12px;
  justify-content: space-between;
  
  ${({ theme }) => theme.media.tablet} {
    left: 32px;
    right: 32px;
    padding: 12px;
  }

  ${({ theme }) => theme.media.laptop} {
    left: unset;
    right: 0;
    width: 420px;
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
