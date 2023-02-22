import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Modal from '../organisms/Modal';
import Button from './Button';
import CheckBox from '../molecules/CheckBox';
import Headline from './Headline';
import InlineSVG from './InlineSVG';

import { useOnClickEsc } from '../../utils/hooks/useOnClickEsc';
import { useOnClickOutside } from '../../utils/hooks/useOnClickOutside';

import arrowDown from '../../public/images/svg/icons/filled/ArrowDown.svg';
import { useAppState } from '../../contexts/appStateContext';

interface IChangeCollectionType {
  options: any;
  selected: string;
  disabled?: boolean;
  onChange: (newCategory: string) => void;
}

export const ChangeCollectionType: React.FC<IChangeCollectionType> = (
  props
) => {
  const { options, selected, disabled, onChange } = props;
  const theme = useTheme();
  const { t } = useTranslation('page-SeeMore');
  const ref: any = useRef();
  const [focused, setFocused] = useState(false);
  const { resizeMode } = useAppState();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

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
      <SCheckBox
        key={`change-collection-type-${item.key}`}
        label={t(`collection.title.${item.key}` as any)}
        selected={isSelected}
        handleChange={!disabled ? handleItemClick : () => {}}
      />
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
          {t(`collection.title.${selected}` as any)}
        </Headline>
        <SInlineSVG
          svg={arrowDown}
          fill={theme.colorsThemed.text.primary}
          width='32px'
          height='32px'
          focused={focused}
        />
      </SWrapper>
      {isMobile ? (
        <Modal show={focused} onClose={handleCloseClick}>
          <SMobileListContainer focused={focused}>
            <SMobileList>{options.map(renderItem)}</SMobileList>
            <SCancelButton view='modalSecondary' onClick={handleCloseClick}>
              {t('collection.button.cancel')}
            </SCancelButton>
          </SMobileListContainer>
        </Modal>
      ) : (
        <SListHolder focused={focused}>{options.map(renderItem)}</SListHolder>
      )}
    </SContainer>
  );
};

ChangeCollectionType.defaultProps = {
  disabled: undefined,
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
  focused: boolean;
}

const SListHolder = styled.div<ISListHolder>`
  top: 52px;
  left: 0;
  opacity: ${(props) => (props.focused ? 1 : 0)};
  z-index: 2;
  padding: 8px;
  overflow: hidden;
  position: absolute;
  transition: opacity ease 0.5s;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  pointer-events: ${(props) => (props.focused ? 'unset' : 'none')};
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};
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
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};
`;

const SCheckBox = styled(CheckBox)`
  padding: 8px 8px 8px 3px;

  ${(props) => props.theme.media.tablet} {
    padding: 8px 11px;
    min-width: 200px;
    border-radius: 12px;

    :hover {
      background-color: ${(props) =>
        props.theme.colorsThemed.background.backgroundDDSelected};
    }
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
