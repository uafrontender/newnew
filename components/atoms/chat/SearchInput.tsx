/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactEventHandler, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import InlineSVG from '../InlineSVG';
import { useAppSelector } from '../../../redux-store/store';
import searchIcon from '../../../public/images/svg/icons/outlined/Search.svg';

interface ISearchInput {
  placeholderText: string;
  bgColor?: string;
  fontSize?: string;
  style?: React.CSSProperties;
  passInputValue?: (str: string) => void;
}

const SearchInput: React.FC<ISearchInput> = ({ placeholderText, bgColor, style, fontSize, passInputValue }) => {
  const theme = useTheme();
  const inputRef: any = useRef();
  const [searchValue, setSearchValue] = useState('');
  const [focusedInput, setFocusedInput] = useState<boolean>(false);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    if (passInputValue) passInputValue(searchValue);
  }, [searchValue, passInputValue]);

  return (
    <SContainer style={style}>
      <SInputWrapper bgColor={bgColor} focus={focusedInput}>
        <SLeftInlineSVG
          svg={searchIcon}
          fill={theme.colorsThemed.text.quaternary}
          width={isMobile ? '20px' : '24px'}
          height={isMobile ? '20px' : '24px'}
        />
        <SInput
          onFocus={() => {
            setFocusedInput(true);
          }}
          onBlur={() => {
            setFocusedInput(false);
          }}
          fontSize={fontSize}
          ref={inputRef}
          value={searchValue}
          onChange={handleInputChange}
          placeholder={placeholderText}
        />
      </SInputWrapper>
    </SContainer>
  );
};

export default SearchInput;

SearchInput.defaultProps = {
  passInputValue: () => {},
};

interface ISContainer {
  style?: React.CSSProperties;
}

const SContainer = styled.div<ISContainer>`
  height: 36px;
  position: relative;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    height: 48px;
  }
`;

interface ISInputWrapper {
  bgColor?: string;
  focus: boolean;
}
const SInputWrapper = styled.div<ISInputWrapper>`
  width: 100%;
  z-index: 3;
  padding: 6.5px;
  display: flex;
  overflow: hidden;
  max-height: 100%;
  border-radius: 12px;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${(props) => {
    if (props.bgColor) {
      return props.bgColor;
    }
    return props.theme.colorsThemed.background.secondary;
  }};

  border: 1px solid
    ${(props) => {
      if (props.focus) {
        return props.theme.colorsThemed.background.outlines2;
      }
      if (props.bgColor) {
        return props.bgColor;
      }
      return props.theme.colorsThemed.background.secondary;
    }};

  ${({ theme }) => theme.media.tablet} {
    padding: 10.5px;
    border-radius: 16px;
  }
`;

interface ISInput {
  fontSize?: string;
}
const SInput = styled.input<ISInput>`
  width: 100%;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  margin: 0 8px;
  outline: none;
  font-size: ${(props) => {
    if (props.fontSize) {
      return props.fontSize;
    }
    return '14px';
  }};
  background: transparent;
  font-weight: 500;
  line-height: 24px;

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }
  ::focus {
    border-color: ;
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

SearchInput.defaultProps = {
  bgColor: undefined,
  style: undefined,
  fontSize: undefined,
  passInputValue: () => {},
};
