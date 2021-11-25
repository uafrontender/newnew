import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import styled, { useTheme } from 'styled-components';

import InlineSVG from './InlineSVG';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';

import { setGlobalSearchActive } from '../../redux-store/slices/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';
import searchIcon from '../../public/images/svg/icons/outlined/Search.svg';

interface ISearchInput {
}

export const SearchInput: React.FC<ISearchInput> = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const inputRef: any = useRef();
  const inputContainerRef: any = useRef();
  const [searchValue, setSearchValue] = useState('');
  const [inputRightPosition, setInputRightPosition] = useState(0);
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

  useOnClickEsc(inputContainerRef, () => {
    if (globalSearchActive) {
      handleSearchClose();
    }
  });
  useOnClickOutside(inputContainerRef, () => {
    if (globalSearchActive) {
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
      setInputRightPosition(-(window.innerWidth - inputContainerRef.current?.getBoundingClientRect()?.right - (isMobile ? 16 : 32)));
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMobile]);

  return (
    <SContainer ref={inputContainerRef}>
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
          onChange={handleInoutChange}
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
    </SContainer>
  );
};

SearchInput.defaultProps = {
  fixed: false,
};

export default SearchInput;

const SContainer = styled.div`
  width: 36px;
  height: 36px;
  position: relative;

  ${({ theme }) => theme.media.tablet} {
    width: 48px;
    height: 48px;
  }
`;

interface ISInputWrapper {
  active: boolean;
  onClick: () => void;
  rightPosition: number;
}

const SInputWrapper = styled.div<ISInputWrapper>`
  top: 50%;
  width: ${(props) => (props.active ? 'calc(100vw - 32px)' : '36px')};
  right: ${(props) => (props.active ? props.rightPosition : 0)}px;
  border: 1.5px solid ${(props) => (props.active ? props.theme.colorsThemed.grayscale.outlines2 : 'transparent')};
  z-index: 3;
  padding: 6.5px;
  display: flex;
  overflow: hidden;
  position: absolute;
  transform: translateY(-50%);
  max-height: 100%;
  transition: all ease 0.5s;
  background: ${(props) => props.theme.colorsThemed.grayscale[props.active ? 'background1' : 'background2']};
  border-radius: 12px;
  flex-direction: row;
  justify-content: space-between;
  
  ${(props) => !props.active && 'cursor: pointer;'}

  ${({ theme }) => theme.media.tablet} {
    width: ${(props) => (props.active ? 'calc(100vw - 64px)' : '48px')};
    padding: 10.5px;
    border-radius: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 0;
    width: ${(props) => (props.active ? '420px' : '48px')};
    background: ${(props) => (props.active ? 'transparent' : props.theme.colorsThemed.button.background.quaternary)};
    
    :hover {
      background: ${(props) => (props.active ? 'transparent' : props.theme.colorsThemed.button.hover.quaternary)};
    }
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
