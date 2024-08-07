import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import InlineSVG from '../../../atoms/InlineSVG';
// import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import closeIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import searchIcon from '../../../../public/images/svg/icons/outlined/Search.svg';
import { useGetChats } from '../../../../contexts/chatContext';
import useDebounce from '../../../../utils/hooks/useDebounce';

const SearchInput: React.FC = React.memo(() => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const inputRef: any = useRef();
  const inputContainerRef: any = useRef();
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [searchText, setSearchText] = useState('');
  const { setSearchChatroom } = useGetChats();

  const searchTextDebounced = useDebounce(searchText, 300);

  const handleSearchClick = useCallback(() => {
    setIsSearchActive((prevState) => !prevState);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchText('');
    setIsSearchActive(false);
  }, []);

  const handleInputChange = useCallback((e: any) => {
    setSearchText(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.keyCode === 13 && searchText) {
        handleSearchClose();
      }
    },
    [handleSearchClose, searchText]
  );

  useEffect(() => {
    setSearchChatroom(searchTextDebounced);
  }, [searchTextDebounced, setSearchChatroom]);

  // const handleClickOutside = useCallback(() => {
  //   if (isSearchActive) {
  //     handleSearchClose();
  //   }
  // }, []);
  // useOnClickOutside(inputContainerRef, handleClickOutside;

  useEffect(() => {
    setTimeout(() => {
      if (isSearchActive) {
        inputRef.current?.focus();
      } else {
        inputRef.current?.blur();
      }
    }, 1000);
  }, [isSearchActive]);

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
          value={searchText}
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
  width: ${(props) => (props.active ? '220px' : '44px')};
  right: ${(props) => (props.active ? '-56px' : 0)};

  display: flex;
  overflow: hidden;
  position: absolute;
  transform: translateY(-50%);
  max-height: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding: 10px 12px;
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
    width: ${(props) => (props.active ? '145px' : '44px')};
  }
`;

const SInput = styled.input`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  margin: 0 4px 0 8px;
  outline: none;
  font-size: 14px;
  background: transparent;
  font-weight: 500;
  line-height: 24px;
  min-height: 24px;

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
