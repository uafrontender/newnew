import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from './Text';
import Modal from '../organisms/Modal';
import Caption from './Caption';

import { useOnClickEsc } from '../../utils/clickEsc';
import { setUserCurrency } from '../../redux-store/slices/userStateSlice';
import { useOnClickOutside } from '../../utils/clickOutside';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';

import { SUPPORTED_CURRENCIES } from '../../constants/general';

interface IChangeCurrency {
}

export const ChangeCurrency: React.FC<IChangeCurrency> = () => {
  const { t } = useTranslation();
  const ref: any = useRef();
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector((state) => state.user);
  const [focused, setFocused] = useState(false);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const options = SUPPORTED_CURRENCIES;
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const ddHeight = (options.length > 6 ? 432 : options.length * 72) + 12;

  const handleChangeCurrencyClick = () => {
    setFocused(!focused);
  };
  const handleCloseClick = () => {
    setFocused(false);
  };
  const renderItem = (item: string) => {
    const handleItemClick = () => {
      dispatch(setUserCurrency(item));
    };

    return (
      <SItemHolder
        key={`change-currency-${item}`}
        onClick={handleItemClick}
        selected={item === currency}
      >
        <SItemTitle variant={3}>
          {t(`dd-currency-title-${item}`)}
        </SItemTitle>
        <SItemSubTitle variant={1}>
          {t(`dd-currency-subTitle-${item}`)}
        </SItemSubTitle>
      </SItemHolder>
    );
  };

  useOnClickEsc(ref, handleCloseClick);
  useOnClickOutside(ref, () => {
    if (!isMobile) {
      handleCloseClick();
    }
  });

  return (
    <SContainer ref={ref}>
      <SContent onClick={handleChangeCurrencyClick}>
        <STitle>
          {t(`selected-currency-title-${currency}`)}
        </STitle>
      </SContent>
      {isMobile ? (
        <Modal show={focused} onClose={handleCloseClick}>
          <SMobileListContainer focused={focused} height={ddHeight}>
            <SMobileList height={ddHeight} focused={focused}>
              {options.map(renderItem)}
            </SMobileList>
            <SCancelItemHolder onClick={handleCloseClick}>
              <SCancelItemTitleHolder>
                Close
              </SCancelItemTitleHolder>
            </SCancelItemHolder>
          </SMobileListContainer>
        </Modal>
      ) : (
        <SListHolder
          height={ddHeight}
          focused={focused}
        >
          {options.map(renderItem)}
        </SListHolder>
      )}
    </SContainer>
  );
};

export default ChangeCurrency;

const SContainer = styled.div`
  position: relative;
`;

const SContent = styled.div`
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.colorsThemed.footerButtonBackground};
`;

const STitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
`;

interface ISListHolder {
  height: number;
  focused: boolean;
}

const SListHolder = styled.div<ISListHolder>`
  left: 0;
  height: ${(props) => (props.focused ? `${props.height}px` : '0px')};
  bottom: 52px;
  z-index: 1;
  overflow: auto;
  position: absolute;
  min-width: 160px;
  transition: all ease 0.5s;
  border-radius: 16px;
  padding-bottom: ${(props) => (props.focused ? '12px' : '0px')};
  background-color: ${(props) => props.theme.colorsThemed.footerButtonBackground};

  ${(props) => props.theme.media.tablet} {
    left: unset;
    right: 0;
  }
`;

interface ISItemHolder {
  selected: boolean;
}

const SItemHolder = styled.div<ISItemHolder>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  margin: 12px 12px 0;
  padding: 12px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.colorsThemed[props.selected ? 'footerDDSelectedBackground' : 'footerButtonBackground']};
`;

const SItemTitle = styled(Text)`
  text-align: center;
  font-weight: 600;
  white-space: nowrap;

  ${(props) => props.theme.media.tablet} {
    text-align: start;
    font-weight: 500;
  }
`;

const SItemSubTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.footerDDItemColor};
  text-align: center;
  font-weight: 600;
  white-space: nowrap;

  ${(props) => props.theme.media.tablet} {
    text-align: start;
    font-weight: 500;
  }
`;

const SMobileListContainer = styled.div<ISListHolder>`
  width: 100%;
  bottom: ${(props) => (props.focused ? 0 : '-100vh')};
  height: 100%;
  display: flex;
  position: relative;
  transition: bottom ease 0.5s;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;
`;

const SMobileList = styled.div<ISListHolder>`
  height: ${(props) => props.height}px;
  display: flex;
  overflow: auto;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  flex-direction: column;
  background-color: ${(props) => props.theme.colorsThemed.footerButtonBackground};
`;

const SCancelItemHolder = styled.div`
  cursor: pointer;
  margin: 4px 0 0;
  padding: 16px 32px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.colorsThemed.footerButtonBackground};
`;

const SCancelItemTitleHolder = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 14px;
  text-align: center;
  font-weight: bold;
  line-height: 24px;
`;
