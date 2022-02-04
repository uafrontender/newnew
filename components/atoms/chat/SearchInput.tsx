/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import InlineSVG from '../InlineSVG';
import { useAppSelector } from '../../../redux-store/store';
import searchIcon from '../../../public/images/svg/icons/outlined/Search.svg';

interface ISearchInput {}

export const SearchInput: React.FC<ISearchInput> = () => {
  const theme = useTheme();
  const inputRef: any = useRef();
  // const inputContainerRef: any = useRef();
  const [searchValue, setSearchValue] = useState('');
  const [inputRightPosition, setInputRightPosition] = useState(0);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const { t } = useTranslation('chat');

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleSearchClick = () => {};
  const handleInoutChange = (e: any) => {
    setSearchValue(e.target.value);
  };
  const handleSubmit = () => {};

  // useEffect(() => {
  //   const resizeObserver = new ResizeObserver(() => {
  //     // eslint-disable-next-line max-len
  //     setInputRightPosition(-(window.innerWidth - (inputContainerRef.current?.getBoundingClientRect()?.right || 0) - (isMobile ? 16 : 32)));
  //   });

  //   resizeObserver.observe(document.body);

  //   return () => {
  //     resizeObserver.disconnect();
  //   };
  // }, [isMobile]);

  return (
    <SContainer>
      <SInputWrapper rightPosition={inputRightPosition}>
        <SLeftInlineSVG
          svg={searchIcon}
          fill={theme.colorsThemed.text.quaternary}
          width={isMobile ? '20px' : '24px'}
          height={isMobile ? '20px' : '24px'}
        />
        <SInput
          ref={inputRef}
          value={searchValue}
          onChange={handleInoutChange}
          placeholder={t('toolbar.search-placeholder')}
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
  height: 36px;
  position: relative;

  ${({ theme }) => theme.media.tablet} {
    height: 48px;
  }
`;

interface ISInputWrapper {
  rightPosition: number;
}

const SInputWrapper = styled.div<ISInputWrapper>`
  width: 288px;
  z-index: 3;
  padding: 6.5px;
  display: flex;
  overflow: hidden;
  max-height: 100%;
  border-radius: 12px;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.tablet} {
    padding: 10.5px;
    border-radius: 16px;
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
