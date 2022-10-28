import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import InlineSVG from '../../../atoms/InlineSVG';

import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import useDebounce from '../../../../utils/hooks/useDebounce';

import closeIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import searchIcon from '../../../../public/images/svg/icons/outlined/Search.svg';

interface ISearchInput {
  passInputValue: (searchString: string) => void;
}
const SearchInput: React.FC<ISearchInput> = React.memo(({ passInputValue }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const inputRef: any = useRef();
  const inputContainerRef: any = useRef();
  const [searchValue, setSearchValue] = useState('');

  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchClick = useCallback(() => {
    setIsSearchActive((prevState) => !prevState);
  }, []);

  const handleSearchClose = () => {
    setSearchValue('');
    setIsSearchActive(false);
  };

  const handleInputChange = (e: any) => {
    setSearchValue(e.target.value);
  };

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 13 && searchValue) {
      passInputValue(searchValue);
      closeSearch();
    }
  };

  useOnClickOutside(inputContainerRef, () => {
    if (isSearchActive) {
      handleSearchClose();
    }
  });

  useEffect(() => {
    setTimeout(() => {
      if (isSearchActive) {
        inputRef.current?.focus();
      } else {
        inputRef.current?.blur();
      }
    }, 1000);
  }, [isSearchActive]);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    if (passInputValue) passInputValue(debouncedSearchValue);
  }, [debouncedSearchValue, passInputValue]);

  function closeSearch() {
    handleSearchClose();
    setSearchValue('');
  }

  return (
    <SContainer ref={inputContainerRef} active={isSearchActive}>
      <SInputWrapper
        active={isSearchActive}
        onClick={isSearchActive ? () => {} : handleSearchClick}
      >
        <SLeftInlineSVG
          clickable
          svg={searchIcon}
          fill={theme.colorsThemed.text.primary}
          width='20px'
          height='20px'
        />
        <SInput
          ref={inputRef}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
        />
        <SRightInlineSVG
          clickable
          svg={closeIcon}
          fill={theme.colorsThemed.text.primary}
          width='20px'
          height='20px'
          onClick={handleSearchClose}
        />
      </SInputWrapper>
    </SContainer>
  );
});

export default SearchInput;

const SContainer = styled.div<{
  active: boolean;
}>`
  width: 44px;
  height: 44px;
  position: relative;
`;

interface ISInputWrapper {
  active: boolean;
  onClick: () => void;
}

const SInputWrapper = styled.div<ISInputWrapper>`
  top: 50%;
  width: ${(props) => (props.active ? '280px' : '44px')};
  right: ${(props) => (props.active ? '-56px' : 0)};

  display: flex;
  overflow: hidden;
  position: absolute;
  transform: translateY(-50%);
  max-height: 100%;
  flex-direction: row;
  justify-content: space-between;

  padding: 12px;
  z-index: 200;

  transition: all ease 0.5s;
  border-radius: 16px;
  border: 1.5px solid
    ${(props) =>
      props.active
        ? props.theme.colorsThemed.background.outlines2
        : 'transparent'};
  z-index: 3;
  background: ${({ active, theme }) =>
    active
      ? theme.colorsThemed.background.primary
      : theme.colorsThemed.button.hover.quaternary};

  ${(props) =>
    !props.active &&
    css`
      cursor: pointer;
      background: transparent;

      &:hover {
        background: ${({ theme }) =>
          props.active
            ? 'transparent'
            : theme.colorsThemed.button.hover.secondary};
      }
    `}

  ${({ theme }) => theme.media.laptopL} {
    width: ${(props) => (props.active ? '210px' : '44px')};
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
`;

const SRightInlineSVG = styled(InlineSVG)`
  min-width: 20px;
  min-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    min-width: 20px;
    min-height: 20px;
  }
`;
