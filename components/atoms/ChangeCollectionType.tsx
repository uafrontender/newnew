import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from './Text';
import Modal from '../organisms/Modal';
import Button from './Button';
import Headline from './Headline';
import InlineSVG from './InlineSVG';

import { useOnClickEsc } from '../../utils/hooks/useOnClickEsc';
import { useAppSelector } from '../../redux-store/store';
import { useOnClickOutside } from '../../utils/hooks/useOnClickOutside';

import arrowDown from '../../public/images/svg/icons/filled/ArrowDown.svg';

interface IChangeCollectionType {
  options: any;
  selected: string;
  onChange: (newCategory: string) => void;
}

export const ChangeCollectionType: React.FC<IChangeCollectionType> = (props) => {
  const {
    options,
    selected,
    onChange,
  } = props;
  const theme = useTheme();
  const { t } = useTranslation('home');
  const ref: any = useRef();
  const [focused, setFocused] = useState(false);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);

  const ddHeight = (options.length > 6 ? 300 : options.length * (isTablet ? 50 : 52)) + 16;

  const handleChangeCollectionTypeClick = () => {
    setFocused(!focused);
  };
  const handleCloseClick = () => {
    setFocused(false);
  };
  const renderItem = (item: any) => {
    const isSelected = item.key === selected;
    const handleItemClick = () => {
      handleCloseClick();
      onChange(item.key);
    };

    return (
      <SButton
        key={`change-collection-type-${item}`}
        view={isSelected ? 'modalSecondarySelected' : 'modalSecondary'}
        onClick={handleItemClick}
        selected={isSelected}
      >
        <SItemTitle variant={3} weight={600}>
          {t(`${item.key}-block-title`)}
        </SItemTitle>
      </SButton>
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
      <SWrapper onClick={handleChangeCollectionTypeClick}>
        <Headline variant={4}>
          {t(`${selected}-block-title`)}
        </Headline>
        <SInlineSVG
          svg={arrowDown}
          fill={theme.colorsThemed.text.primary}
          width="32px"
          height="32px"
          focused={focused}
        />
      </SWrapper>
      {isMobile ? (
        <Modal show={focused} onClose={handleCloseClick}>
          <SMobileListContainer focused={focused}>
            <SMobileList>
              {options.map(renderItem)}
            </SMobileList>
            <SCancelButton
              view="modalSecondary"
              onClick={handleCloseClick}
            >
              {t('button-cancel')}
            </SCancelButton>
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

export default ChangeCollectionType;

const SContainer = styled.div`
  position: relative;
`;

const SWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ISListHolder {
  height: number;
  focused: boolean;
}

const SListHolder = styled.div<ISListHolder>`
  top: 52px;
  left: 0;
  height: ${(props) => (props.focused ? `${props.height}px` : '0px')};
  z-index: 2;
  padding: ${(props) => (props.focused ? '8px' : '0px 8px')};
  overflow: hidden;
  position: absolute;
  transition: all ease 0.5s;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundDD};
`;

const SItemTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  text-align: center;
  white-space: nowrap;

  ${(props) => props.theme.media.tablet} {
    text-align: start;
  }
`;

interface ISMobileListContainer {
  focused: boolean;
}

const SMobileListContainer = styled.div<ISMobileListContainer>`
  width: 100%;
  bottom: ${(props) => (props.focused ? 0 : '-100vh')};
  height: 100%;
  padding: 16px;
  display: flex;
  position: relative;
  transition: bottom ease 0.5s;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;
`;

const SMobileList = styled.div`
  display: flex;
  padding: 12px;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  flex-direction: column;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundDD};
`;

interface ISButton {
  selected: boolean;
}

const SButton = styled(Button)<ISButton>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  padding: 16px 32px;

  ${(props) => props.theme.media.tablet} {
    min-width: 200px;
    justify-content: flex-start;
  }
`;

const SCancelButton = styled(Button)`
  padding: 16px 32px;
  margin-top: 4px;
`;

interface ISInlineSVG {
  focused: boolean;
}

const SInlineSVG = styled(InlineSVG)<ISInlineSVG>`
  z-index: 1;
  transform: rotate(${(props) => (props.focused ? '180deg' : '0deg')});
  transition: all ease 0.5s;
  margin-left: 4px;
`;
