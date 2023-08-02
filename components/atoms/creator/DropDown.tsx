import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import Text from '../Text';
import Modal from '../../organisms/Modal';
import Button from '../Button';
import InlineSvg from '../InlineSVG';

import { useOnClickEsc } from '../../../utils/hooks/useOnClickEsc';
import useDropDownDirection from '../../../utils/hooks/useDropDownDirection';
import { useOnClickOutside } from '../../../utils/hooks/useOnClickOutside';

import ArrowDown from '../../../public/images/svg/icons/filled/ArrowDown.svg';
import { useAppState } from '../../../contexts/appStateContext';

type TItem = {
  id: string;
  label: string;
};

interface IDropDown {
  value: string;
  options: TItem[];
  disabled?: boolean;
  handleChange: (id: string) => void;
}

export const DropDown: React.FC<IDropDown> = (props) => {
  const { value, options, disabled, handleChange } = props;
  const { t } = useTranslation('common');
  const theme = useTheme();
  const ref: any = useRef();
  const [focused, setFocused] = useState(false);
  const { resizeMode } = useAppState();
  const selectedItem = options.find((el) => el.id === value);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const ddHeight =
    (options.length > 6 ? 372 : options.length * (isTablet ? 54 : 56)) + 20;

  const direction = useDropDownDirection(ref, ddHeight);

  const handleDropDownClick = () => {
    setFocused(!focused);
  };
  const handleCloseClick = useCallback(() => {
    setFocused(false);
  }, []);

  const renderItem = useCallback(
    (item: TItem) => {
      const selected = value === item.id;
      const handleItemClick = () => {
        handleChange(item.id);
        handleCloseClick();
      };

      return (
        <SButton
          key={`dd-option-${item.id}`}
          view={selected ? 'modalSecondarySelected' : 'modalSecondary'}
          onClick={handleItemClick}
          selected={selected}
        >
          <SItemTitle variant={3} weight={600}>
            {item.label}
          </SItemTitle>
        </SButton>
      );
    },
    [value, handleChange, handleCloseClick]
  );

  useOnClickEsc(ref, handleCloseClick);
  const handleClickOutside = useCallback(() => {
    if (!isMobile) {
      handleCloseClick();
    }
  }, [isMobile, handleCloseClick]);
  useOnClickOutside(ref, handleClickOutside);

  const mobileViewRef = useRef(null);

  useOnClickOutside(mobileViewRef, () => {
    handleCloseClick();
  });

  return (
    <SContainer ref={ref}>
      <SLabelButton onClick={handleDropDownClick} disabled={disabled ?? false}>
        <span>{selectedItem?.label}</span>
        <SInlineSVG
          svg={ArrowDown}
          fill={theme.colorsThemed.text.secondary}
          width='24px'
          height='24px'
          focused={focused}
        />
      </SLabelButton>
      {isMobile ? (
        <Modal show={focused} onClose={handleCloseClick}>
          <SMobileListContainer focused={focused}>
            <SMobileList ref={mobileViewRef}>
              {options.map(renderItem)}
            </SMobileList>
            <SCancelButton view='modalSecondary' onClick={handleCloseClick}>
              {t('button.cancel')}
            </SCancelButton>
          </SMobileListContainer>
        </Modal>
      ) : (
        <SListHolder height={ddHeight} focused={focused} direction={direction}>
          {options.map(renderItem)}
        </SListHolder>
      )}
    </SContainer>
  );
};

export default DropDown;

DropDown.defaultProps = {
  disabled: false,
};

const SContainer = styled.div`
  position: relative;
`;

interface ISListHolder {
  height: number;
  focused: boolean;
  direction: string;
}

const SListHolder = styled.div<ISListHolder>`
  left: 0;
  height: ${(props) => (props.focused ? `${props.height}px` : '0px')};
  padding: ${(props) => (props.focused ? '12px' : '0 12px')};
  z-index: 1;
  overflow: hidden;
  position: absolute;
  transition: all ease 0.5s;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  padding-bottom: ${(props) => (props.focused ? '12px' : '0px')};
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};

  ${(props) => props.theme.media.tablet} {
    left: unset;
    right: 0;
  }

  ${(props) => {
    if (props.direction === 'down') {
      return css`
        top: 54px;
      `;
    }

    return css`
      bottom: 54px;
    `;
  }}
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
  overflow-y: auto;
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};
`;

interface ISButton {
  selected: boolean;
}

const SButton = styled(Button)<ISButton>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  padding: 16px;
  margin-bottom: 4px;
  flex-shrink: 0;

  &:last-child {
    margin-bottom: 0;
  }

  ${(props) => props.theme.media.tablet} {
    min-width: 136px;
    justify-content: flex-start;
  }
`;

const SCancelButton = styled(Button)`
  padding: 16px 32px;
  margin-top: 4px;
`;

const SLabelButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;

  border: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.primary
      : props.theme.colorsThemed.background.secondary};

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }

  span {
    margin-right: 4px;
  }

  transition: 0.2s linear;

  &:focus {
    outline: none;
  }

  &:hover:enabled,
  &:focus:active {
    cursor: pointer;

    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colorsThemed.background.primary
        : props.theme.colorsThemed.background.secondary};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const SInlineSVG = styled(InlineSvg)<{
  focused: boolean;
}>`
  transform: ${({ focused }) => (focused ? 'rotate(180deg)' : 'unset')};
`;
